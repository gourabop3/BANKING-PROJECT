'use client';

import { useState, useEffect } from 'react';
import { 
    FiPlus, 
    FiEdit, 
    FiTrash, 
    FiUpload, 
    FiImage, 
    FiCode, 
    FiSearch,
    FiFilter,
    FiEye,
    FiToggleLeft,
    FiToggleRight,
    FiStar,
    FiDownload
} from 'react-icons/fi';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories] = useState([
        'web-templates',
        'mobile-apps',
        'desktop-software',
        'scripts',
        'plugins',
        'themes',
        'components',
        'apis',
        'databases',
        'other'
    ]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        subcategory: '',
        technology: [],
        features: [],
        requirements: [],
        compatibility: [],
        tags: [],
        demoUrl: '',
        version: '1.0.0',
        images: [],
        sourceCode: null,
        isActive: true,
        isFeatured: false
    });

    const [uploadProgress, setUploadProgress] = useState({
        images: false,
        sourceCode: false
    });

    const [dragActive, setDragActive] = useState({
        images: false,
        sourceCode: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (files) => {
        setUploadProgress(prev => ({ ...prev, images: true }));
        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            
            if (files.length === 1) {
                formData.append('image', files[0]);
                const response = await fetch('/api/admin/upload/image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, {
                            url: data.data.url,
                            cloudinaryId: data.data.public_id,
                            isPrimary: prev.images.length === 0
                        }]
                    }));
                }
            } else {
                Array.from(files).forEach(file => {
                    formData.append('images', file);
                });
                const response = await fetch('/api/admin/upload/images', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    const newImages = data.data.map((img, index) => ({
                        url: img.url,
                        cloudinaryId: img.public_id,
                        isPrimary: formData.images.length === 0 && index === 0
                    }));
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...newImages]
                    }));
                }
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploadProgress(prev => ({ ...prev, images: false }));
        }
    };

    const handleSourceCodeUpload = async (file) => {
        setUploadProgress(prev => ({ ...prev, sourceCode: true }));
        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('sourceCode', file);
            
            const response = await fetch('/api/admin/upload/source-code', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    sourceCode: {
                        url: data.data.url,
                        filename: data.data.filename,
                        cloudinaryId: data.data.public_id,
                        size: data.data.size,
                        format: data.data.format
                    }
                }));
            }
        } catch (error) {
            console.error('Error uploading source code:', error);
        } finally {
            setUploadProgress(prev => ({ ...prev, sourceCode: false }));
        }
    };

    const handleDrag = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(prev => ({ ...prev, [type]: true }));
        } else if (e.type === "dragleave") {
            setDragActive(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (type === 'images') {
                handleImageUpload(e.dataTransfer.files);
            } else if (type === 'sourceCode') {
                handleSourceCodeUpload(e.dataTransfer.files[0]);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const url = editingProduct 
                ? `/api/admin/products/${editingProduct._id}`
                : '/api/admin/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                fetchProducts();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discountPrice: '',
            category: '',
            subcategory: '',
            technology: [],
            features: [],
            requirements: [],
            compatibility: [],
            tags: [],
            demoUrl: '',
            version: '1.0.0',
            images: [],
            sourceCode: null,
            isActive: true,
            isFeatured: false
        });
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData(product);
        setShowModal(true);
    };

    const handleDelete = async (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`/api/admin/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const toggleProductStatus = async (productId, isActive) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/products/${productId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive })
            });
            const data = await response.json();
            if (data.success) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error toggling product status:', error);
        }
    };

    const toggleFeatured = async (productId, isFeatured) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/products/${productId}/toggle-featured`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isFeatured })
            });
            const data = await response.json();
            if (data.success) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addArrayItem = (field, value) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
        }
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <FiPlus /> Add Product
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="relative">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <FiImage className="text-4xl text-gray-400" />
                                    </div>
                                )}
                                {product.isFeatured && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                        <FiStar /> Featured
                                    </div>
                                )}
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs ${
                                    product.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                                
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="text-lg font-bold text-blue-600">
                                            ${product.discountPrice || product.price}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-sm text-gray-500 line-through ml-2">
                                                ${product.price}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {product.category?.replace('-', ' ')}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>Downloads: {product.downloadCount || 0}</span>
                                    <span>v{product.version}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <FiEdit /> Edit
                                    </button>
                                    <button
                                        onClick={() => toggleProductStatus(product._id, !product.isActive)}
                                        className={`px-3 py-2 rounded text-sm transition-colors ${
                                            product.isActive 
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                    >
                                        {product.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                                    </button>
                                    <button
                                        onClick={() => toggleFeatured(product._id, !product.isFeatured)}
                                        className={`px-3 py-2 rounded text-sm transition-colors ${
                                            product.isFeatured 
                                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <FiStar />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="px-3 py-2 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    >
                                        <FiTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <FiCode className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">No products found</h3>
                        <p className="text-gray-400">Start by adding your first product</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Pricing */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price ($) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Discount Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.discountPrice}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Version
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.version}
                                            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Images
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                            dragActive.images 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragEnter={(e) => handleDrag(e, 'images')}
                                        onDragLeave={(e) => handleDrag(e, 'images')}
                                        onDragOver={(e) => handleDrag(e, 'images')}
                                        onDrop={(e) => handleDrop(e, 'images')}
                                    >
                                        <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                                        <label className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-700">browse files</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files)}
                                                className="hidden"
                                            />
                                        </label>
                                        {uploadProgress.images && (
                                            <div className="mt-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Display uploaded images */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            {formData.images.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={image.url}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    {image.isPrimary && (
                                                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                                            Primary
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                images: prev.images.filter((_, i) => i !== index)
                                                            }));
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Source Code Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Source Code File (ZIP) *
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                            dragActive.sourceCode 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragEnter={(e) => handleDrag(e, 'sourceCode')}
                                        onDragLeave={(e) => handleDrag(e, 'sourceCode')}
                                        onDragOver={(e) => handleDrag(e, 'sourceCode')}
                                        onDrop={(e) => handleDrop(e, 'sourceCode')}
                                    >
                                        <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-2">Drag and drop ZIP file here, or</p>
                                        <label className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-700">browse files</span>
                                            <input
                                                type="file"
                                                accept=".zip,.rar"
                                                onChange={(e) => handleSourceCodeUpload(e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                        {uploadProgress.sourceCode && (
                                            <div className="mt-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Display uploaded source code */}
                                    {formData.sourceCode && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FiCode className="text-blue-600" />
                                                    <span className="font-medium">{formData.sourceCode.filename}</span>
                                                    <span className="text-sm text-gray-500">
                                                        ({(formData.sourceCode.size / (1024 * 1024)).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, sourceCode: null }))}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <FiTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subcategory
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subcategory}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Demo URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.demoUrl}
                                            onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="flex gap-6">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        Active
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        Featured
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editingProduct ? 'Update Product' : 'Create Product'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;