const { uploadImageToCloudinary, uploadFileToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

class FileUploadController {
    static async uploadProductImage(req, res, next) {
        try {
            if (!req.file) {
                throw new ApiError(400, 'No image file provided');
            }

            const filename = `product-image-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            const result = await uploadImageToCloudinary(
                req.file.buffer, 
                filename, 
                'products/images'
            );

            res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height
                },
                message: 'Image uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async uploadSourceCode(req, res, next) {
        try {
            if (!req.file) {
                throw new ApiError(400, 'No source code file provided');
            }

            // Validate file is a zip
            if (!req.file.mimetype.includes('zip') && !req.file.mimetype.includes('octet-stream')) {
                throw new ApiError(400, 'Only ZIP files are allowed for source code');
            }

            const filename = `source-code-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            const result = await uploadFileToCloudinary(
                req.file.buffer, 
                filename, 
                'products/source-codes'
            );

            res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    public_id: result.public_id,
                    filename: req.file.originalname,
                    size: result.bytes,
                    format: result.format
                },
                message: 'Source code uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async uploadMultipleImages(req, res, next) {
        try {
            if (!req.files || req.files.length === 0) {
                throw new ApiError(400, 'No image files provided');
            }

            const uploadPromises = req.files.map(async (file, index) => {
                const filename = `product-image-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
                return await uploadImageToCloudinary(
                    file.buffer, 
                    filename, 
                    'products/images'
                );
            });

            const results = await Promise.all(uploadPromises);

            res.status(200).json({
                success: true,
                data: results.map(result => ({
                    url: result.url,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height
                })),
                message: 'Images uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteFile(req, res, next) {
        try {
            const { publicId, resourceType = 'image' } = req.body;

            if (!publicId) {
                throw new ApiError(400, 'Public ID is required');
            }

            const result = await deleteFromCloudinary(publicId, resourceType);

            res.status(200).json({
                success: true,
                data: result,
                message: 'File deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async uploadThumbnail(req, res, next) {
        try {
            if (!req.file) {
                throw new ApiError(400, 'No thumbnail image provided');
            }

            const filename = `thumbnail-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            const result = await uploadImageToCloudinary(
                req.file.buffer, 
                filename, 
                'products/thumbnails'
            );

            res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height
                },
                message: 'Thumbnail uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FileUploadController;