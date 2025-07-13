const ApiError = require("../utils/ApiError")
const JWTService = require("../utils/JwtService")

const AuthMiddleware  = async (req,res,next)=>{
    try {

        const headers = req.headers['authorization'] ||''
        if(!headers || !headers.startsWith("Bearer ")){
            throw new ApiError(401,"Please Login First")
        }

        const token = headers.split(" ")[1]
        if(!token){
            throw new ApiError(401,"Enter Valid Details")
        }

        const payload = JWTService.ValidateToken(token)

        const { UserModel } = require('../models/User.model');
        const userDoc = await UserModel.findById(payload.user);
        if(!userDoc || userDoc.isActive === false){
            throw new ApiError(403,"Account is deactivated. Please contact support");
        }

        req.user = payload.user
        next()


    } catch (error) {
        next(error)
    }
}
 
module.exports =AuthMiddleware