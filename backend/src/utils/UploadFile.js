const multer = require("multer")


const uploadFile = multer({
    storage:multer.diskStorage({})
})

exports.UploadFile = uploadFile