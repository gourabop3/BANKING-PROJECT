const AuthService = require("../service/AuthService")

class AuthController{

    static async  loginUser(req,res){
        const res_obj = await AuthService.loginUser(req.body)
        res.status(200).send(res_obj)
    }

    static async registerUser(req,res){
        const res_obj = await AuthService.registerUser(req.body)
        res.status(201).send(res_obj)
    }

    static async profileUser(req,res){
        const res_obj = await AuthService.profileUser(req.user);
        res.status(200).send(res_obj)
    }
     static async UpdateUserAvatar(req,res){
        const res_obj = await AuthService.UpdateUserAvatar(req.user,req.file);
        res.status(200).send(res_obj)
    }

      static async UpdateUserDetails(req,res){
        const res_obj = await AuthService.UpdateUserDetails(req.user,req.body);
        res.status(200).send(res_obj)
    }
    
      static async SendEmailOTP(req,res){
        const res_obj = await AuthService.SendEmailOTP(req.user);
        res.status(200).send(res_obj)
    }

    static async VerifyEmailOTP(req,res){
        const res_obj = await AuthService.VerifyEmailOTP(req.user,req.body);
        res.status(200).send(res_obj)
    }
 
    
    
    

}
module.exports = AuthController