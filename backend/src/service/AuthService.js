const { UserModel } = require("../models/User.model")
const ApiError = require("../utils/ApiError")
const bcryptjs = require("bcryptjs")
const JWTService = require("../utils/JwtService")
const { AccountModel } = require("../models/Account.model")
const { TransactionModel } = require("../models/Transactions.model")
const { FixDepositModel } = require("../models/FixDeposit.model")
const { ATMmodel } = require("../models/ATMCard.model")
const { ProfileModel } = require("../models/Profile.model")
const { Cloudinary } = require("../utils/cloudinary")
const {default:random}  = require("random-int")
const jwt = require("jsonwebtoken")
const NodeMailerService = require("../utils/NodeMail")
// New: email notifications & utils for account opening
const NotificationService = require("./NotificationService");
const { generateAccountNumber, getAccountTypeDisplayName } = require("../utils/accountNumberUtils");
const { APIKEYModel } = require("../models/api_key.model")

class AuthService{
    static async loginUser(body){
        
        const {email,password} = body
        const check_exist = await UserModel.findOne({email})
        if(!check_exist){
            throw new ApiError(400,"No Account Found")
        }
        const isMatch = await bcryptjs.compare(password,check_exist.password)
        if(!isMatch){
            throw new ApiError(400,"Invalid Credentials")
        }

        const token = JWTService.generateToken(check_exist._id)

        return {
            msg:"Login Success",
            "token":token
        }



    }


    static async registerUser(body){

        const {name,email,password,ac_type} = body

        const check_exist = await UserModel.findOne({email:email.toLowerCase()})
        if(check_exist){
            throw new ApiError(400,"Email Already Exist")
        }

            // Generate unique UPI handle e.g., gourab@mybank
            const baseUpi = name.toLowerCase().replace(/\s+/g, '') + '@mybank';
            let upi_id = baseUpi;
            let suffix = 1;
            // Ensure uniqueness of UPI handle in DB
            // eslint-disable-next-line no-await-in-loop
            while(await UserModel.exists({ upi_id })){
                upi_id = `${baseUpi}${suffix}`;
                suffix += 1;
            }

            const user =    await UserModel.create({
                name,
                email,
                password,
                ac_type,
                upi_id
               })

               const ac=  await AccountModel.create({
                user:user._id,
                amount:0,
                ac_type:ac_type
            }) 

            // Link the newly created account with the user so that subsequent
            // `.populate('account_no')` queries (used by RechargeService, TransferService, etc.)
            // can correctly retrieve the user's primary account.
            await UserModel.findByIdAndUpdate(user._id, {
                $push: { account_no: ac._id }
            });


            await TransactionModel.create({
                user:user._id,
                    account:ac._id,
                    amount:0,
                    type:'credit',
                    isSuccess:true,
                    remark:'Account Opening !'
            })

            await ProfileModel.create({
                user:user._id
            })

            // Send account opening email asynchronously so it does not block registration flow
            setImmediate(async () => {
                try {
                    const accountNumber = generateAccountNumber(user._id, ac._id, ac.ac_type);
                    await NotificationService.sendAccountOpeningEmail(
                        user.name,
                        user.email,
                        accountNumber,
                        getAccountTypeDisplayName(ac.ac_type)
                    );
                } catch (err) {
                    console.error("Failed to send account opening email:", err);
                }
            });


        const token = JWTService.generateToken(user._id)

               return {
                msg:"Register Success",
                "token":token
            }


    }
    static async profileUser(user){
        // Include _id so the frontend can generate deterministic account numbers
        const userd = await UserModel.findById(user)
        .select("_id name email ac_type createdAt upi_id")

        const profile_obj ={}

        const account = await  AccountModel.find({user})
        .select("_id amount ac_type")

         const profileData = await ProfileModel.findOne({
                user
            })

            


             if(!profileData){
            const  profile=      await ProfileModel.create({
                user:user
            })  
            profile_obj['mobile_no'] = profile.mobile_no
            profile_obj['bio'] = profile.bio
            profile_obj['isEmailVerified'] = profile.isEmailVerified
            profile_obj['image'] = profile.image.image_uri
            profile_obj['kyc_status'] = profile.kyc_status



             }else{

                    profile_obj['mobile_no'] = profileData.mobile_no
            profile_obj['bio'] = profileData.bio
            profile_obj['isEmailVerified'] = profileData.isEmailVerified
            profile_obj['image'] = profileData.image.image_uri
            profile_obj['kyc_status'] = profileData.kyc_status
             }

        if(!account || account.length === 0){
          const ac=  await AccountModel.create({
                user,
                amount:0,
                ac_type: 'saving' // Default to saving account
            }) 

           


            await TransactionModel.create({
                    account:ac._id,
                    amount:0,
                    type:'credit',
                    isSuccess:true,
                    remark:'Account Opening !',
                user:user._id,

            })

            profile_obj['account_no'] = [{
                _id:ac._id,
                amount:ac.amount,
                ac_type:ac.ac_type
            }]  

        } else {
            profile_obj['account_no'] = account
        }
        
        profile_obj['fd_amount'] = 0
        // profile_obj['amount'] = account.amount
        // for fd

      const fixDeposits=  await FixDepositModel.find({user,isClaimed:false})

      if(fixDeposits.length>0){

     const fd_amount= await  Promise.resolve(fixDeposits.map((cur,i)=>{
            return cur.amount
      }).reduce((pre,cur,i)=>{
        return pre+cur
      }))

      
      profile_obj['fd_amount'] = fd_amount


      }


      const atms = await ATMmodel.find({user}).select("_id card_type card_no cvv expiry account")
        
      



        if(!userd){
            throw new ApiError(401,"Profile Not Found")
        }

        // api key credentials

            const existApiKeyDoc = await APIKEYModel.findOne({user,isOnWorking:true})
            .select("api_hash api_secret -_id")
            if(existApiKeyDoc){
                profile_obj['api_keys'] = existApiKeyDoc
            }



        return  {...userd.toObject(),...profile_obj,atms}

    }

    static async UpdateUserAvatar(user,file){

        const profileData = await ProfileModel.findOne({user})

        if(profileData.image.public_id){
                await Cloudinary.uploader.destroy(profileData.image.public_id)
        }

      const result =   await Cloudinary.uploader.upload(file.path,{
        folder:'cbi-payment-gatway',

      })


      await ProfileModel.findOneAndUpdate({user},{
        image:{
            image_uri:result.secure_url,
            public_id:result.public_id
        }
      })

      

        return {
          msg:"Profile Image Updated :)"
        }
    }

    static async UpdateUserDetails(user,body){
        // Enforce cooldown: user can update profile only once every 30 days
        const profile = await ProfileModel.findOne({user});
        if(!profile){
            throw new ApiError(404,"Profile not found");
        }

        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        if(profile.lastProfileUpdate && (Date.now() - new Date(profile.lastProfileUpdate).getTime()) < THIRTY_DAYS){
            throw new ApiError(400,"Profile can only be updated once every 30 days. Please try later or contact support.");
        }

        await ProfileModel.findOneAndUpdate({
            user
        },{
          bio:body.bio,
          mobile_no:body.mobile_no,
          lastProfileUpdate:new Date()
          
        })
        await UserModel.findByIdAndUpdate(user,{
            name:body.name
        })


        return {
            msg:"Profile Updated :)"
        }
    }

    static async SendEmailOTP(user){
        try {
            const userd = await UserModel.findById(user)
            if(!userd){
                throw new ApiError(404,"User Not Found")
            }

            // Check if environment variables are configured
            if (!process.env.EMAIL_VERIFIED_HASH) {
                throw new ApiError(500, "Email verification not configured properly")
            }

            const otp = random(100000,999999)
            const jwt_token  = jwt.sign({userID:userd._id},process.env.EMAIL_VERIFIED_HASH+otp,{
                expiresIn:'10m'
            })
            
            await NodeMailerService.SendVerificationEmail(userd.name,otp,userd.email)

            return {
                token:jwt_token,
                msg: "Verification email sent successfully"
            }
        } catch (error) {
            console.error("Error sending email OTP:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Failed to send verification email")
        }
    }

    static async VerifyEmailOTP(user,body){
        try {
            const {token, otp} = body;
            
            if (!token || !otp) {
                throw new ApiError(400, "Token and OTP are required")
            }

            if (!process.env.EMAIL_VERIFIED_HASH) {
                throw new ApiError(500, "Email verification not configured properly")
            }

            const payload = jwt.verify(token, process.env.EMAIL_VERIFIED_HASH + otp)
            
            if (!payload.userID) {
                throw new ApiError(400, "Invalid token")
            }

            let profile = await ProfileModel.findOneAndUpdate({
                user: payload.userID
            }, {
                isEmailVerified: true
            })

            // If profile not found (legacy accounts), create it on the fly
            if (!profile) {
                profile = await ProfileModel.create({
                    user: payload.userID,
                    isEmailVerified: true,
                });
            }

            return {
                "msg": "Email verified successfully!"
            }
        } catch (error) {
            console.error("Error verifying email OTP:", error);
            
            if (error.name === 'JsonWebTokenError') {
                throw new ApiError(400, "Invalid or expired OTP")
            }
            if (error.name === 'TokenExpiredError') {
                throw new ApiError(400, "OTP has expired. Please request a new one")
            }
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Email verification failed")
        }
    }
}

module.exports =AuthService