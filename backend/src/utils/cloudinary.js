const {v2:cloudinary} = require("cloudinary")


cloudinary.config({
api_key:process.env.CLOUDINARY_API_KEY,
api_secret:process.env.CLOUDINARY_API_SCREATE,
cloud_name:process.env.CLOUDINARY_NAME
})

exports.Cloudinary = cloudinary