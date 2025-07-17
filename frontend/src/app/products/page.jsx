'use client';

import { useState, useEffect } from 'react';
import { 
    FiShoppingCart, 
    FiEye, 
    FiStar, 
    FiDownload, 
    FiCode,
    FiSearch,
    FiFilter,
    FiTag,
    FiExternalLink,
    FiHeart,
    FiShare2,
    FiZap
} from 'react-icons/fi';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const categories = [
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
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                setProducts(data.data.filter(product => product.isActive));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (product) => {
        try {
            // Check if user is logged in
            const token = localStorage.getItem('userToken');
            if (!token) {
                // Redirect to login
                window.location.href = '/login?redirect=/products';
                return;
            }

            // Create payment order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    amount: product.discountPrice || product.price
                })
            });

            const data = await response.json();
            if (data.success) {
                // Redirect to payment page or open payment gateway
                window.location.href = `/payment/${data.orderId}`;
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const filteredAndSortedProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.discountPrice || a.price) - (b.discountPrice || b.price);
                case 'price-high':
                    return (b.discountPrice || b.price) - (a.discountPrice || a.price);
                case 'popular':
                    return (b.downloadCount || 0) - (a.downloadCount || 0);
                case 'rating':
                    return (b.rating?.average || 0) - (a.rating?.average || 0);
                default: // newest
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const calculateDiscount = (originalPrice, discountPrice) => {
        if (!discountPrice) return 0;
        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Products Marketplace</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover premium source codes, templates, and digital solutions to accelerate your projects
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products, technologies, or features..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="newest">Newest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>

                    {/* Results Count */}
                    <div className="text-gray-600 mb-6">
                        Showing {filteredAndSortedProducts.length} products
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="relative">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                                        alt={product.name}
                                        className="w-full h-48 object-cover cursor-pointer"
                                        onClick={() => handleViewDetails(product)}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                        <FiCode className="text-6xl text-white" />
                                    </div>
                                )}
                                
                                {/* Featured Badge */}
                                {product.isFeatured && (
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <FiZap className="w-3 h-3" />
                                        Featured
                                    </div>
                                )}

                                {/* Discount Badge */}
                                {product.discountPrice && (
                                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                        -{calculateDiscount(product.price, product.discountPrice)}%
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                        <FiHeart className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                        <FiShare2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Category and Version */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <FiTag className="w-3 h-3 mr-1" />
                                        {product.category?.replace('-', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500">v{product.version}</span>
                                </div>

                                {/* Rating and Downloads */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(product.rating?.average || 0)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({product.rating?.count || 0})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <FiDownload className="w-3 h-3" />
                                        {product.downloadCount || 0}
                                    </div>
                                </div>

                                {/* Technology Tags */}
                                {product.technology && product.technology.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {product.technology.slice(0, 3).map((tech, index) => (
                                            <span
                                                key={index}
                                                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {product.technology.length > 3 && (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                +{product.technology.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {formatPrice(product.discountPrice || product.price)}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-sm text-gray-500 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewDetails(product)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <FiEye className="w-4 h-4" />
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handlePurchase(product)}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <FiShoppingCart className="w-4 h-4" />
                                        Buy Now
                                    </button>
                                </div>

                                {/* Demo Link */}
                                {product.demoUrl && (
                                    <button
                                        onClick={() => window.open(product.demoUrl, '_blank')}
                                        className="w-full mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <FiExternalLink className="w-3 h-3" />
                                        Live Demo
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Products Found */}
                {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-16">
                        <FiCode className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">No products found</h3>
                        <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('');
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Product Details Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                                    <div className="flex items-center gap-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {selectedProduct.category?.replace('-', ' ')}
                                        </span>
                                        <span className="text-sm text-gray-500">Version {selectedProduct.version}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Product Images */}
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div className="mb-6">
                                    <img
                                        src={selectedProduct.images.find(img => img.isPrimary)?.url || selectedProduct.images[0]?.url}
                                        alt={selectedProduct.name}
                                        className="w-full h-64 object-cover rounded-xl"
                                    />
                                    {selectedProduct.images.length > 1 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto">
                                            {selectedProduct.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image.url}
                                                    alt={`${selectedProduct.name} ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Product Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                                    <p className="text-gray-700 mb-6">{selectedProduct.description}</p>

                                    {/* Features */}
                                    {selectedProduct.features && selectedProduct.features.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3">Features</h3>
                                            <ul className="list-disc list-inside space-y-1">
                                                {selectedProduct.features.map((feature, index) => (
                                                    <li key={index} className="text-gray-700">{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Technologies */}
                                    {selectedProduct.technology && selectedProduct.technology.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3">Technologies Used</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProduct.technology.map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Requirements */}
                                    {selectedProduct.requirements && selectedProduct.requirements.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                                            <ul className="list-disc list-inside space-y-1">
                                                {selectedProduct.requirements.map((req, index) => (
                                                    <li key={index} className="text-gray-700">{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Purchase Panel */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">
                                            {formatPrice(selectedProduct.discountPrice || selectedProduct.price)}
                                        </div>
                                        {selectedProduct.discountPrice && (
                                            <div className="text-lg text-gray-500 line-through">
                                                {formatPrice(selectedProduct.price)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Downloads:</span>
                                            <span className="font-medium">{selectedProduct.downloadCount || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rating:</span>
                                            <div className="flex items-center gap-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            className={`w-4 h-4 ${
                                                                i < Math.floor(selectedProduct.rating?.average || 0)
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    ({selectedProduct.rating?.count || 0})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">File Size:</span>
                                            <span className="font-medium">
                                                {selectedProduct.sourceCode?.size 
                                                    ? `${(selectedProduct.sourceCode.size / (1024 * 1024)).toFixed(1)} MB`
                                                    : 'N/A'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handlePurchase(selectedProduct)}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <FiShoppingCart />
                                            Buy Now
                                        </button>
                                        
                                        {selectedProduct.demoUrl && (
                                            <button
                                                onClick={() => window.open(selectedProduct.demoUrl, '_blank')}
                                                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <FiExternalLink />
                                                Live Demo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;