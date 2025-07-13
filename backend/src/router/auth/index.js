const express = require("express")
const AuthController = require("../../controller/AuthController")
const AuthValidation = require("../../validations/AuthValidation")
const ValidationMiddleware = require("../../middleware/ValidationMiddleware")
const AuthMiddleware = require("../../middleware/AuthMiddleware")
const { UploadFile } = require("../../utils/UploadFile")
const router = express.Router()

router.route("/login")
.post(AuthValidation.loginUser,ValidationMiddleware,AuthController.loginUser)



router.route("/register")
.post(AuthValidation.registerUser,ValidationMiddleware,AuthController.registerUser)


router.route("/profile")
.get(AuthMiddleware,AuthController.profileUser)

router.use(AuthMiddleware)


router.route('/update-avatar')
.post(UploadFile.single("avatar"),AuthController.UpdateUserAvatar)



router.route('/update-basic-details')
.post(AuthValidation.updateBasicDetails,ValidationMiddleware,AuthController.UpdateUserDetails)


router.route('/send-email-otp')
.post(AuthMiddleware,AuthController.SendEmailOTP)




router.route('/verify-email')
.post(AuthMiddleware,AuthValidation.VerifyOTP,ValidationMiddleware,AuthController.VerifyEmailOTP)


module.exports = router