const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Allow images and zip files
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-zip-compressed' ||
        file.mimetype === 'application/octet-stream') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and zip files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});

// Upload single image to Cloudinary
const uploadImageToCloudinary = async (buffer, filename, folder = 'products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: folder,
                public_id: filename,
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height
                    });
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// Upload zip file to Cloudinary
const uploadFileToCloudinary = async (buffer, filename, folder = 'source-codes') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                folder: folder,
                public_id: filename,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        format: result.format,
                        bytes: result.bytes
                    });
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        throw error;
    }
};

// Generate thumbnail for images
const generateThumbnail = (url, width = 300, height = 300) => {
    return cloudinary.url(url, {
        width: width,
        height: height,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
    });
};

module.exports = {
    cloudinary,
    upload,
    uploadImageToCloudinary,
    uploadFileToCloudinary,
    deleteFromCloudinary,
    generateThumbnail
};