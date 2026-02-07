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
  FiCheck,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiRefreshCw,
  FiImage
} from "react-icons/fi";

// Categories and Subcategories (Jewelry focused)
const MAIN_CATEGORIES = [
  { label: "Rings", value: "Rings" },
  { label: "Bangles", value: "Bangles" },
  { label: "Necklaces", value: "Necklaces" },
  { label: "Earrings", value: "Earrings" },
  { label: "Bracelets", value: "Bracelets" },
  { label: "Pendants", value: "Pendants" },
  { label: "Anklets", value: "Anklets" },
  { label: "Mang Tikka", value: "Mang Tikka" },
  { label: "Nath", value: "Nath" }
];

const SUB_CATEGORIES = {
  "Rings": [
    "Artificial Rings",
    "Fashion Rings",
    "Casual Rings",
    "Stone Rings",
    "Bridal Rings"
  ],
  "Bangles": [
    "Artificial Bangles",
    "Imitation Bangles",
    "Kids Bangles",
    "Traditional Bangles"
  ],
  "Necklaces": [
    "Artificial Necklaces",
    "Imitation Necklaces",
    "Chokers",
    "Bridal Necklaces"
  ],
  "Earrings": [
    "Stud Earrings",
    "Hoop Earrings",
    "Jhumkas",
    "Artificial Earrings"
  ],
  "Bracelets": [
    "Artificial Bracelets",
    "Imitation Bracelets",
    "Cuffs",
    "Chain Bracelets"
  ],
  "Pendants": [
    "Artificial Pendants",
    "Imitation Pendants",
    "Religious Pendants",
    "Heart Pendants"
  ],
  "Anklets": [
    "Artificial Anklets",
    "Imitation Anklets",
    "Beaded Anklets"
  ],
  "Mang Tikka": [
    "Bridal Mang Tikka",
    "Traditional Mang Tikka",
    "Stone Mang Tikka"
  ],
  "Nath": [
    "Traditional Nath",
    "Bridal Nath",
    "Stone Nath"
  ]
};

// Available Colors with hex codes
const AVAILABLE_COLORS = [
  { name: "Gold", hexCode: "#FFD700" },
  { name: "Rose Gold", hexCode: "#B76E79" },
  { name: "White Gold", hexCode: "#F5F5F5" },
  { name: "Silver", hexCode: "#C0C0C0" },
  { name: "Platinum", hexCode: "#E5E4E2" },
  { name: "Diamond White", hexCode: "#FFFFFF" },
  { name: "Ruby Red", hexCode: "#E0115F" },
  { name: "Emerald Green", hexCode: "#50C878" },
  { name: "Sapphire Blue", hexCode: "#0F52BA" },
  { name: "Black", hexCode: "#000000" },
  { name: "Brown", hexCode: "#8B4513" },
  { name: "Pink", hexCode: "#FFC0CB" }
];

// Ring sizes in numbers
const RING_SIZES = ['Size 5', 'Size 6', 'Size 7', 'Size 8', 'Size 9', 'Size 10', 'Size 11', 'Size 12'];

// Bangle sizes in numbers
const BANGLE_SIZES = ['2.0"', '2.1"', '2.2"', '2.3"', '2.4"', '2.5"', '2.6"', '2.7"'];

// Gender Options
const GENDER_OPTIONS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" }
];

// Get appropriate sizes based on category
const getSizesForCategory = (category) => {
  switch(category) {
    case 'Rings':
      return RING_SIZES;
    case 'Bangles':
      return BANGLE_SIZES;
    default:
      return [];
  }
};

// Variant Component
const VariantForm = ({ variant, index, onChange, onRemove, category }) => {
  const sizes = getSizesForCategory(category);
  
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-900">Variant #{index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color *
          </label>
          <select
            value={variant.color?.name || ""}
            onChange={(e) => {
              const selectedColor = AVAILABLE_COLORS.find(c => c.name === e.target.value);
              onChange(index, 'color', selectedColor);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
            required
          >
            <option value="">Select Color</option>
            {AVAILABLE_COLORS.map(color => (
              <option key={color.name} value={color.name}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        {/* Size - Only show for Rings and Bangles */}
        {(category === 'Rings' || category === 'Bangles') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size *
            </label>
            <select
              value={variant.size || ""}
              onChange={(e) => onChange(index, 'size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
              required
            >
              <option value="">Select Size</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={variant.stockQuantity || ""}
            onChange={(e) => onChange(index, 'stockQuantity', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variant.price || ""}
            onChange={(e) => onChange(index, 'price', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
            required
          />
        </div>

        {/* Sale Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sale Price (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variant.salePrice || ""}
            onChange={(e) => onChange(index, 'salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU (Optional)
          </label>
          <input
            type="text"
            value={variant.sku || ""}
            onChange={(e) => onChange(index, 'sku', e.target.value)}
            placeholder="Auto-generated if empty"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
          />
        </div>
      </div>
    </div>
  );
};

// Product Form Modal Component
const ProductFormModal = ({ open, onClose, onSaved, initialProduct }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    basePrice: "",
    baseSalePrice: "",
    totalStock: "",
    overallDiscountPercentage: "",
    category: MAIN_CATEGORIES[0].value,
    subCategory: SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
    gender: "unisex",
    brand: "",
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    isActive: true,
    availableColors: [],
    variants: []
  });
  
  const [mainImages, setMainImages] = useState([]);
  const [mainImagePreviews, setMainImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const mainFileInputRef = useRef();

  // Initialize form
  useEffect(() => {
    if (initialProduct) {
      // Transform backend data for form
      setFormData({
        title: initialProduct.title || "",
        description: initialProduct.description || "",
        shortDescription: initialProduct.shortDescription || "",
        basePrice: initialProduct.basePrice || "",
        baseSalePrice: initialProduct.baseSalePrice || "",
        totalStock: initialProduct.totalStock || "",
        overallDiscountPercentage: initialProduct.overallDiscountPercentage || "",
        category: initialProduct.category || MAIN_CATEGORIES[0].value,
        subCategory: initialProduct.subCategory || SUB_CATEGORIES[initialProduct.category]?.[0] || "",
        gender: initialProduct.gender || "unisex",
        brand: initialProduct.brand || "",
        metaTitle: initialProduct.metaTitle || "",
        metaDescription: initialProduct.metaDescription || "",
        isFeatured: initialProduct.isFeatured || false,
        isActive: initialProduct.isActive !== false,
        availableColors: initialProduct.availableColors || [],
        variants: initialProduct.variants || []
      });
      
      setMainImagePreviews(initialProduct.mainImages?.map(img => img.url) || []);
      setVariants(initialProduct.variants || []);
    } else {
      resetForm();
    }
  }, [initialProduct, open]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      basePrice: "",
      baseSalePrice: "",
      totalStock: "",
      overallDiscountPercentage: "",
      category: MAIN_CATEGORIES[0].value,
      subCategory: SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
      gender: "unisex",
      brand: "",
      metaTitle: "",
      metaDescription: "",
      isFeatured: false,
      isActive: true,
      availableColors: [],
      variants: []
    });
    setMainImages([]);
    setMainImagePreviews([]);
    setVariants([]);
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

  // Main Images
  const handleMainImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = mainImagePreviews.length + files.length;
    
    if (totalImages > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setMainImages(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMainImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMainImage = (index) => {
    const url = mainImagePreviews[index];
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    
    setMainImages(prev => prev.filter((_, i) => i !== index));
    setMainImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Variants Management
  const addVariant = () => {
    const newVariant = {
      color: { name: "", hexCode: "" },
      size: (formData.category === 'Rings' || formData.category === 'Bangles') ? "" : undefined,
      stockQuantity: 0,
      price: formData.basePrice || "",
      sku: "",
      isActive: true
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...variants];
    
    if (field === 'color') {
      updatedVariants[index].color = value;
    } else {
      updatedVariants[index][field] = value;
    }
    
    setVariants(updatedVariants);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'variants' && key !== 'availableColors') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add availableColors as JSON string
      if (formData.availableColors.length > 0) {
        formDataToSend.append('availableColors', JSON.stringify(formData.availableColors));
      }

      // Add variants as JSON string
      if (variants.length > 0) {
        // Ensure variant prices are set properly
        const finalVariants = variants.map(variant => ({
          ...variant,
          price: variant.price || formData.basePrice,
          stockQuantity: variant.stockQuantity || 0
        }));
        formDataToSend.append('variants', JSON.stringify(finalVariants));
      }

      // Add main images
      mainImages.forEach(image => {
        formDataToSend.append("mainImages", image);
      });

      // Add replaceImages flag if editing
      if (initialProduct && mainImages.length > 0) {
        formDataToSend.append("replaceImages", "true");
      }

      let response;
      
      if (initialProduct) {
        // UPDATE existing product
        response = await api.put(
          `/api/products/${initialProduct._id}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // CREATE new product
        response = await api.post(
          '/api/products',
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (response.data.success) {
        onSaved(response.data.product);
        onClose();
        alert(initialProduct ? "Product updated successfully!" : "Product created successfully!");
      } else {
        throw new Error(response.data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.error || error.message || "Failed to save product. Please check all required fields.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {initialProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  required
                >
                  {MAIN_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  required
                >
                  {SUB_CATEGORIES[formData.category]?.map(subCat => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                >
                  {GENDER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹) *
                </label>
                <input
                  type="number"
                  name="basePrice"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  name="baseSalePrice"
                  min="0"
                  step="0.01"
                  value={formData.baseSalePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Stock (units)
                </label>
                <input
                  type="number"
                  name="totalStock"
                  min="0"
                  value={formData.totalStock}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                />
              </div>
            </div>

            {/* Colors Selection */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Colors for Product
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {AVAILABLE_COLORS.map(color => (
                  <label
                    key={color.name}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.availableColors.some(c => c.name === color.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            availableColors: [...prev.availableColors, color]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            availableColors: prev.availableColors.filter(c => c.name !== color.name)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-[#b2965a] rounded"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hexCode }}
                        title={color.hexCode}
                      />
                      <span className="text-sm text-gray-700">{color.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none resize-none"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none resize-none"
                placeholder="Brief description for product listings"
              />
            </div>

            {/* Variants Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">Product Variants</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#b2965a] text-white rounded text-sm hover:bg-[#9c8146]"
                >
                  <FiPlus className="w-4 h-4" /> Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center p-4 border border-dashed border-gray-300 rounded">
                  <p className="text-gray-600">No variants added</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add variants for different colors {formData.category === 'Rings' || formData.category === 'Bangles' ? 'and sizes' : ''}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <VariantForm
                      key={index}
                      variant={variant}
                      index={index}
                      onChange={updateVariant}
                      onRemove={removeVariant}
                      category={formData.category}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Images */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (Max 5)
              </label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="file"
                  ref={mainFileInputRef}
                  onChange={handleMainImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => mainFileInputRef.current.click()}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:border-[#b2965a] hover:bg-gray-50 text-sm"
                >
                  <FiUpload className="w-4 h-4" /> Upload Images
                </button>
                <span className="text-sm text-gray-500">
                  {mainImagePreviews.length}/5 images
                </span>
              </div>

              {mainImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {mainImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square rounded border border-gray-200 overflow-hidden bg-gray-100">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMainImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex gap-4 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#b2965a] rounded"
                />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#b2965a] rounded"
                />
                <span className="text-sm text-gray-700">Active Product</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#b2965a] text-white rounded hover:bg-[#9c8146] text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiSave className="w-4 h-4" />
                  {initialProduct ? "Update Product" : "Create Product"}
                </span>
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
  const [statusFilter, setStatusFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing refresh

  // Fetch products on component mount and when refreshKey changes
  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

 const fetchProducts = async () => {
  setLoading(true);
  try {
    // Using the admin products endpoint
    const res = await api.get("/api/products", {
      params: {
        isActive: statusFilter === "all" ? undefined : statusFilter === "active"
      }
    });
    
    if (res.data.success) {
      setProducts(res.data.products || []);
    } else {
      throw new Error(res.data.error || "Failed to load products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    alert(error.response?.data?.error || error.message || "Failed to load products");
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
  
  try {
    // Use hard delete endpoint instead of soft delete
    const res = await api.delete(`/api/products/${id}/hard`);
    
    if (res.data.success) {
      // Remove from local state
      setProducts(prev => prev.filter(p => p._id !== id));
      alert("Product permanently deleted successfully!");
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert(error.response?.data?.error || "Failed to delete product");
  }
};

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/api/products/${id}/toggle-status`);
      
      if (res.data.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === id ? { ...p, isActive: !currentStatus } : p
        ));
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      alert("Failed to toggle product status");
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const res = await api.patch(`/api/products/${id}/toggle-featured`);
      
      if (res.data.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === id ? { ...p, isFeatured: !currentFeatured } : p
        ));
      }
    } catch (error) {
      console.error("Toggle featured error:", error);
      alert("Failed to toggle featured status");
    }
  };

  const handleProductSaved = (savedProduct) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p._id === savedProduct._id ? savedProduct : p
      ));
    } else {
      // Add new product at the beginning
      setProducts(prev => [savedProduct, ...prev]);
    }
    resetModal();
    setRefreshKey(prev => prev + 1); // Refresh data
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

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = search === "" || 
      product.title?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase()) ||
      product.brand?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "inStock" && product.inStock) ||
                        (stockFilter === "outOfStock" && !product.inStock);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.isActive) ||
                         (statusFilter === "inactive" && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Calculate stats
  const totalProducts = filteredProducts.length;
  const inStockCount = filteredProducts.filter(p => p.inStock).length;
  const activeCount = filteredProducts.filter(p => p.isActive).length;
  const featuredCount = filteredProducts.filter(p => p.isFeatured).length;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your jewelry product catalog</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            title="Refresh products"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#b2965a] text-white px-4 py-2 rounded hover:bg-[#9c8146]"
          >
            <FiPlus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-600">In Stock</p>
          <p className="text-2xl font-bold text-green-600">{inStockCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-yellow-600">{featuredCount}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none"
              />
            </div>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== "all").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none"
            >
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#b2965a]"></div>
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center shadow-sm">
          <div className="text-gray-400 mb-4 text-4xl">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={openAddModal}
            className="text-[#b2965a] hover:text-[#8c703f] font-medium"
          >
            + Add your first product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                          {product.mainImages?.[0]?.url ? (
                            <img 
                              src={product.mainImages[0].url} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/48/cccccc/ffffff?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              <FiImage className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.title}</p>
                          <p className="text-sm text-gray-500 truncate">{product.brand || "No brand"}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {product.category}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 truncate">{product.subCategory}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {product.baseSalePrice ? (
                          <>
                            <p className="font-bold text-gray-900">₹{product.baseSalePrice.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 line-through">₹{product.basePrice.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="font-bold text-gray-900">₹{product.basePrice?.toLocaleString() || "0"}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.inStock 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {product.totalStock || 0} units total
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(product._id, product.isActive)}
                            className={`p-1.5 rounded-full transition-colors ${
                              product.isActive 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                          </button>
                          <span className={`text-sm ${product.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeatured(product._id, product.isFeatured)}
                            className={`p-1.5 rounded-full transition-colors ${
                              product.isFeatured 
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                            title={product.isFeatured ? "Remove from featured" : "Add to featured"}
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <span className={`text-sm ${product.isFeatured ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {product.isFeatured ? 'Featured' : 'Regular'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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
          
          {/* Table Footer */}
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products
              </p>
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
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