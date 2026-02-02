import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../../utils/axiosInstance";
import { 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiX,
  FiSave,
  FiImage,
  FiCheck,
  FiUpload
} from "react-icons/fi";

// Categories and Subcategories
const MAIN_CATEGORIES = [
  { label: "Rings", value: "Rings" },
  { label: "Necklaces", value: "Necklaces" },
  { label: "Earrings", value: "Earrings" },
  { label: "Bracelets & Bangles", value: "Bracelets & Bangles" },
  { label: "Pendants", value: "Pendants" },
  { label: "Collections", value: "Collections" }
];

const SUB_CATEGORIES = {
  "Rings": [
    "Engagement Rings", "Wedding Rings", "Casual Rings", "Cocktail Rings", "Diamond Rings", "Gold Rings"
  ],
  "Necklaces": [
    "Gold Necklaces", "Diamond Necklaces", "Chokers", "Bridal Necklaces", "Daily Wear Necklaces"
  ],
  "Earrings": [
    "Stud Earrings", "Hoop Earrings", "Drop Earrings", "Jhumkas", "Diamond Earrings", "Gold Earrings"
  ],
  "Bracelets & Bangles": [
    "Gold Bangles", "Diamond Bangles", "Bracelets", "Cuffs", "Kids Bangles"
  ],
  "Pendants": [
    "Gold Pendants", "Diamond Pendants", "Religious Pendants", "Heart Pendants", "Minimal Pendants"
  ],
  "Collections": [
    "Bridal Collection", "Festive Collection", "Daily Wear Collection", "Kids Collection", "Men's Collection"
  ]
};

// Product Form Modal Component
const ProductFormModal = ({ open, onClose, onSaved, initialProduct }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: MAIN_CATEGORIES[0].value,
    subCategory: SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
    brand: "",
    inStock: true,
    stockQuantity: 10,
    weight: "",
    material: "Gold",
    purity: "18K"
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // Initialize form when modal opens or initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setFormData({
        title: initialProduct.title || "",
        description: initialProduct.description || "",
        price: initialProduct.price || "",
        category: initialProduct.category || MAIN_CATEGORIES[0].value,
        subCategory: initialProduct.subCategory || SUB_CATEGORIES[initialProduct.category]?.[0] || SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
        brand: initialProduct.brand || "",
        inStock: initialProduct.inStock !== undefined ? initialProduct.inStock : true,
        stockQuantity: initialProduct.stockQuantity || 10,
        weight: initialProduct.weight || "",
        material: initialProduct.material || "Gold",
        purity: initialProduct.purity || "18K"
      });
      
      setExistingImages(initialProduct.images || []);
      setImagePreviews(initialProduct.images?.map(img => img.url) || []);
      setImages([]);
    } else {
      resetForm();
    }
  }, [initialProduct, open]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: MAIN_CATEGORIES[0].value,
      subCategory: SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
      brand: "",
      inStock: true,
      stockQuantity: 10,
      weight: "",
      material: "Gold",
      purity: "18K"
    });
    setImages([]);
    setExistingImages([]);
    setImagePreviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      subCategory: SUB_CATEGORIES[category]?.[0] || ""
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imagePreviews.length + files.length;
    
    if (totalImages > 4) {
      alert("Maximum 4 images allowed per product");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const removeImage = (index) => {
    // Check if it's a new image or existing image
    const isNewImage = index >= existingImages.length;
    
    if (isNewImage) {
      // Remove from new images array
      const newImageIndex = index - existingImages.length;
      setImages(prev => prev.filter((_, i) => i !== newImageIndex));
    } else {
      // Remove from existing images array
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    }
    
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL if it's a blob
    const url = imagePreviews[index];
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add new images
      images.forEach(image => {
        formDataToSend.append("images", image);
      });

      // Add existing image URLs (for edit)
      if (initialProduct && existingImages.length > 0) {
        existingImages.forEach((image, index) => {
          formDataToSend.append(`existingImages[${index}]`, image.url);
        });
      }

      let response;
      if (initialProduct) {
        // Update existing product
        response = await api.put(
          `/api/product/products/${initialProduct._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
      } else {
        // Create new product
        response = await api.post(
          "/api/product/products",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
      }

      onSaved(response.data.product);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.error || "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {initialProduct ? "Update product details" : "Fill in product information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  required
                  placeholder="e.g., Diamond Solitaire Ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none resize-none"
                  placeholder="Describe the product features and details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  placeholder="Brand name"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Stock</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (g)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                    step="0.1"
                    placeholder="e.g., 5.2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#b2965a] rounded focus:ring-[#b2965a]"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Categories</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                >
                  {MAIN_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory *
                </label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                >
                  {SUB_CATEGORIES[formData.category]?.map(subCat => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Material Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Material Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Gemstone">Gemstone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purity/Karat
                </label>
                <select
                  name="purity"
                  value={formData.purity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                >
                  <option value="18K">18K Gold</option>
                  <option value="22K">22K Gold</option>
                  <option value="24K">24K Gold</option>
                  <option value="925">925 Sterling Silver</option>
                  <option value="950">950 Platinum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images (Max 4)</h3>
            
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#b2965a] hover:bg-gray-50 transition-colors"
              >
                <FiUpload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Upload Images</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Upload product images. First image will be used as thumbnail.
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={preview}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                        Thumbnail
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  {initialProduct ? "Update Product" : "Save Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main AdminProducts Component
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/product/products");
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/product/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleProductSaved = (savedProduct) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p._id === savedProduct._id ? savedProduct : p
      ));
    } else {
      // Add new product
      setProducts(prev => [savedProduct, ...prev]);
    }
    resetModal();
  };

  const resetModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(search.toLowerCase()) ||
                         product.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "inStock" && product.inStock) ||
                        (stockFilter === "outOfStock" && !product.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ["all", ...new Set(products.map(p => p.category))];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <FiPlus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== "all").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            >
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setStockFilter("all");
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
          >
            <FiFilter className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b2965a]"></div>
            <p className="text-gray-500 mt-2">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">No products found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
            <button
              onClick={openAddModal}
              className="mt-4 text-[#b2965a] hover:text-[#8c703f] font-medium"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/48'} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {product.category}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{product.subCategory}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {product.material} {product.purity}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.inStock 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {product.inStock && (
                          <span className="text-xs text-gray-500">
                            {product.stockQuantity || 0} units
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination & Stats */}
      {filteredProducts.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600">
            Showing <span className="font-bold">{filteredProducts.length}</span> of{" "}
            <span className="font-bold">{products.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#b2965a] text-white rounded-lg">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={resetModal}
        onSaved={handleProductSaved}
        initialProduct={editingProduct}
      />
    </AdminLayout>
  );
};

export default AdminProducts;