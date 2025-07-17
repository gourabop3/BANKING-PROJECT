# Product Upload System with Cloudinary Integration

## Overview
This system allows administrators to upload and manage digital products (source codes, templates, etc.) with image and file upload capabilities using Cloudinary. Users can browse, view details, and purchase products with secure file downloads.

## Features Implemented

### Admin Panel Features
- **Product Management**: Create, edit, delete, and manage products
- **Image Upload**: Drag & drop image upload with Cloudinary integration
- **Source Code Upload**: ZIP file upload for source code with Cloudinary storage
- **Product Categories**: Web templates, mobile apps, scripts, plugins, etc.
- **Pricing Management**: Regular price and discount price support
- **Product Status**: Active/inactive and featured product management
- **Search & Filter**: Real-time search and category filtering

### User Features
- **Product Marketplace**: Beautiful product showcase with filters and search
- **Product Details**: Detailed product view with images, features, and specifications
- **Purchase System**: Secure product purchase flow
- **Download Management**: Controlled access to purchased source code files

## Environment Variables Required

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Configuration (existing)
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
ADMIN_JWT_SECRET=@@adminjwt

# Database (existing)
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets (existing)
JWT_SECRET=your_jwt_secret
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install cloudinary multer --force
```

### 2. Configure Cloudinary
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from your dashboard
3. Add them to your `.env` file

### 3. Database Setup
The following models are created:
- `Product.model.js` - Core product information
- `ProductPurchase.model.js` - Purchase tracking and download management

### 4. Start the Application
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

## API Endpoints

### Admin Endpoints (Protected)
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PUT /api/admin/products/:id/toggle-status` - Toggle active status
- `PUT /api/admin/products/:id/toggle-featured` - Toggle featured status

### File Upload Endpoints (Protected)
- `POST /api/admin/upload/image` - Upload single product image
- `POST /api/admin/upload/images` - Upload multiple images
- `POST /api/admin/upload/source-code` - Upload ZIP source code file
- `DELETE /api/admin/upload/delete` - Delete uploaded file

### Public Endpoints
- `GET /api/products` - List active products
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category

## Product Data Structure

```javascript
{
  name: "Product Name",
  description: "Product description",
  price: 99.99,
  discountPrice: 79.99, // Optional
  category: "web-templates", // Enum values
  subcategory: "E-commerce",
  technology: ["React", "Node.js", "MongoDB"],
  images: [
    {
      url: "https://cloudinary-url",
      cloudinaryId: "public_id",
      isPrimary: true
    }
  ],
  sourceCode: {
    url: "https://cloudinary-url",
    filename: "source-code.zip",
    cloudinaryId: "public_id",
    size: 5242880, // bytes
    format: "zip"
  },
  features: ["Feature 1", "Feature 2"],
  requirements: ["Node.js 14+", "MongoDB"],
  compatibility: ["Windows", "macOS", "Linux"],
  demoUrl: "https://demo-url.com",
  version: "1.0.0",
  isActive: true,
  isFeatured: false,
  downloadCount: 0,
  rating: {
    average: 4.5,
    count: 10
  }
}
```

## File Upload Specifications

### Images
- **Supported formats**: JPG, PNG, GIF, WebP
- **Max file size**: 10MB per image
- **Optimization**: Auto-compression and format conversion
- **Folders**: Stored in `products/images/` on Cloudinary

### Source Code Files
- **Supported formats**: ZIP, RAR
- **Max file size**: 50MB
- **Folders**: Stored in `products/source-codes/` on Cloudinary
- **Security**: Download links are generated on-demand for purchased products

## Frontend Pages

### Admin Pages
- `/admin-dashboard/products` - Product management interface

### User Pages
- `/products` - Product marketplace/catalog
- `/products/:id` - Individual product details

## Security Features

1. **Admin Authentication**: Protected admin routes
2. **File Validation**: Server-side file type and size validation
3. **Cloudinary Security**: Secure upload with signed URLs
4. **Purchase Verification**: Download access only for purchased products
5. **Rate Limiting**: Protection against abuse

## Usage Instructions

### For Administrators
1. Login to admin panel
2. Navigate to Products section
3. Click "Add Product" to create new product
4. Fill in product details
5. Upload product images (drag & drop supported)
6. Upload source code ZIP file
7. Save product

### For Users
1. Browse products on the marketplace
2. Use search and filters to find products
3. View product details and demo
4. Purchase products securely
5. Download source code after purchase

## File Organization

```
backend/
├── src/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary configuration
│   ├── controller/
│   │   ├── AdminController.js      # Admin product management
│   │   ├── FileUploadController.js # File upload handling
│   │   └── ProductController.js    # Public product endpoints
│   ├── models/
│   │   ├── Product.model.js        # Product schema
│   │   └── ProductPurchase.model.js # Purchase tracking
│   ├── router/
│   │   ├── admin/index.js          # Admin routes
│   │   └── products.js             # Public product routes
│   └── service/
│       └── AdminService.js         # Updated with product methods

frontend/
├── src/
│   └── app/
│       ├── admin-dashboard/
│       │   └── products/
│       │       └── page.jsx        # Admin product management
│       └── products/
│           └── page.jsx            # User product catalog
```

## Troubleshooting

### Common Issues
1. **Upload fails**: Check Cloudinary credentials and network connection
2. **Large files**: Ensure file size is within limits
3. **Image not displaying**: Verify Cloudinary URLs are accessible
4. **Permission denied**: Check admin authentication

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify environment variables are set
3. Check network requests in browser dev tools
4. Review server logs for errors

## Future Enhancements
- Payment gateway integration
- User reviews and ratings
- Product variations and bundles
- Advanced search with filters
- Product recommendations
- Bulk product import/export

## Support
For issues or questions, check the application logs and ensure all environment variables are properly configured.