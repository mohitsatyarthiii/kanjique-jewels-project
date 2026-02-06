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
  FiUpload,
  FiCopy,
  FiMinus,
  FiTag,
  FiPercent,
  FiHash,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiPackage,
  FiShoppingBag
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
  { name: "Black", hexCode: "#000000" }
];

// Available Sizes
const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

// Materials
const MATERIALS = ["Gold", "Silver", "Platinum", "Diamond", "Gemstone", "Pearl", "Mixed"];

// Purity/Karat Options
const PURITY_OPTIONS = {
  "Gold": ["18K", "22K", "24K"],
  "Silver": ["925", "999"],
  "Platinum": ["950", "900"],
  "Diamond": ["VS", "SI", "VVS", "IF"],
  "Gemstone": ["AAA", "AA", "A"],
  "Pearl": ["AAA", "AA", "A"],
  "Mixed": ["Mixed"]
};

// Gender Options
const GENDER_OPTIONS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" }
];

// Variant Component
const VariantForm = ({ variant, index, onChange, onRemove, onImageUpload, variantImages }) => {
  const fileInputRef = useRef();

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-900">Variant #{index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color *
          </label>
          <div className="flex gap-2">
            <select
              value={variant.color?.name || ""}
              onChange={(e) => {
                const selectedColor = AVAILABLE_COLORS.find(c => c.name === e.target.value);
                onChange(index, 'color', selectedColor);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
              required
            >
              <option value="">Select Color</option>
              {AVAILABLE_COLORS.map(color => (
                <option key={color.name} value={color.name}>
                  {color.name}
                </option>
              ))}
            </select>
            {variant.color?.hexCode && (
              <div 
                className="w-10 h-10 rounded border border-gray-300"
                style={{ backgroundColor: variant.color.hexCode }}
                title={variant.color.name}
              />
            )}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size *
          </label>
          <select
            value={variant.size || ""}
            onChange={(e) => onChange(index, 'size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
            required
          >
            <option value="">Select Size</option>
            {AVAILABLE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            value={variant.sku || ""}
            onChange={(e) => onChange(index, 'sku', e.target.value)}
            placeholder="e.g., RING-GOLD-M-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={variant.stockQuantity || ""}
            onChange={(e) => onChange(index, 'stockQuantity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
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
            onChange={(e) => onChange(index, 'price', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
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
            onChange={(e) => onChange(index, 'salePrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
          />
        </div>

        {/* Discount Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount %
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={variant.discountPercentage || ""}
              onChange={(e) => onChange(index, 'discountPercentage', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
            />
            <FiPercent className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={variant.isActive !== false}
              onChange={(e) => onChange(index, 'isActive', e.target.checked)}
              className="w-4 h-4 text-[#b2965a] rounded focus:ring-[#b2965a]"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Variant Images */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Variant Images (Optional)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => onImageUpload(index, e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-[#b2965a] hover:bg-gray-50 transition-colors"
          >
            <FiUpload className="w-4 h-4" />
            <span className="text-sm">Upload Images</span>
          </button>
          <span className="text-xs text-gray-500">Max 3 images per variant</span>
        </div>

        {/* Variant Image Previews */}
        {variantImages[index]?.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {variantImages[index].map((file, imgIndex) => (
              <div key={imgIndex} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                  className="w-20 h-20 object-cover rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = [...variantImages[index]];
                    newFiles.splice(imgIndex, 1);
                    const newVariantImages = [...variantImages];
                    newVariantImages[index] = newFiles;
                    // Call update function for variant images
                  }}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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
    overallDiscountPercentage: "",
    category: MAIN_CATEGORIES[0].value,
    subCategory: SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
    gender: "women",
    brand: "",
    material: "Gold",
    purity: "18K",
    weight: "",
    tags: [],
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    isActive: true,
    variants: []
  });
  
  const [mainImages, setMainImages] = useState([]);
  const [existingMainImages, setExistingMainImages] = useState([]);
  const [mainImagePreviews, setMainImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantImages, setVariantImages] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const mainFileInputRef = useRef();

  // Initialize form
  useEffect(() => {
    if (initialProduct) {
      // Populate form data
      setFormData({
        title: initialProduct.title || "",
        description: initialProduct.description || "",
        shortDescription: initialProduct.shortDescription || "",
        basePrice: initialProduct.basePrice || "",
        baseSalePrice: initialProduct.baseSalePrice || "",
        overallDiscountPercentage: initialProduct.overallDiscountPercentage || "",
        category: initialProduct.category || MAIN_CATEGORIES[0].value,
        subCategory: initialProduct.subCategory || SUB_CATEGORIES[initialProduct.category]?.[0] || "",
        gender: initialProduct.gender || "women",
        brand: initialProduct.brand || "",
        material: initialProduct.material || "Gold",
        purity: initialProduct.purity || "18K",
        weight: initialProduct.weight || "",
        tags: initialProduct.tags || [],
        metaTitle: initialProduct.metaTitle || "",
        metaDescription: initialProduct.metaDescription || "",
        isFeatured: initialProduct.isFeatured || false,
        isActive: initialProduct.isActive !== false,
        variants: initialProduct.variants || []
      });
      
      setExistingMainImages(initialProduct.mainImages || []);
      setMainImagePreviews(initialProduct.mainImages?.map(img => img.url) || []);
      setVariants(initialProduct.variants || []);
      setVariantImages([]);
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
      overallDiscountPercentage: "",
      category: MAIN_CATEGORIES[0].value,
      subCategory: SUB_CATEGORIES[MAIN_CATEGORIES[0].value][0],
      gender: "women",
      brand: "",
      material: "Gold",
      purity: "18K",
      weight: "",
      tags: [],
      metaTitle: "",
      metaDescription: "",
      isFeatured: false,
      isActive: true,
      variants: []
    });
    setMainImages([]);
    setExistingMainImages([]);
    setMainImagePreviews([]);
    setVariants([]);
    setVariantImages([]);
    setStep(1);
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

  const handleMaterialChange = (e) => {
    const material = e.target.value;
    setFormData(prev => ({
      ...prev,
      material,
      purity: PURITY_OPTIONS[material]?.[0] || ""
    }));
  };

  // Main Images
  const handleMainImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = mainImagePreviews.length + files.length;
    
    if (totalImages > 5) {
      alert("Maximum 5 main images allowed");
      return;
    }

    const newImages = [...mainImages, ...files];
    setMainImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMainImagePreviews(prev => [...prev, ...newPreviews]);

    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = null;
    }
  };

  const removeMainImage = (index) => {
    const isExisting = index < existingMainImages.length;
    
    if (isExisting) {
      setExistingMainImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingMainImages.length;
      setMainImages(prev => prev.filter((_, i) => i !== newIndex));
    }
    
    const url = mainImagePreviews[index];
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    setMainImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Variants Management
  const addVariant = () => {
    const newVariant = {
      color: { name: "", hexCode: "" },
      size: "",
      sku: "",
      stockQuantity: 0,
      price: formData.basePrice || "",
      salePrice: formData.baseSalePrice || "",
      discountPercentage: formData.overallDiscountPercentage || 0,
      isActive: true
    };
    setVariants([...variants, newVariant]);
    setVariantImages([...variantImages, []]);
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...variants];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedVariants[index][parent] = { ...updatedVariants[index][parent], [child]: value };
    } else {
      updatedVariants[index][field] = value;
    }
    setVariants(updatedVariants);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
    setVariantImages(variantImages.filter((_, i) => i !== index));
  };

  const handleVariantImageUpload = (variantIndex, files) => {
    const filesArray = Array.from(files);
    if (filesArray.length > 3) {
      alert("Maximum 3 images per variant");
      return;
    }
    
    const updatedVariantImages = [...variantImages];
    updatedVariantImages[variantIndex] = [
      ...updatedVariantImages[variantIndex],
      ...filesArray
    ];
    setVariantImages(updatedVariantImages);
  };

  // Tags Management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Generate SKU
  const generateSKU = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase();
    const materialCode = formData.material.substring(0, 1).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${materialCode}-${random}`;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'variants' && key !== 'tags') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add tags as comma separated string
      if (formData.tags.length > 0) {
        formDataToSend.append('tags', formData.tags.join(','));
      }

      // Add variants as JSON string
      if (variants.length > 0) {
        formDataToSend.append('variants', JSON.stringify(variants));
      }

      // Add main images
      mainImages.forEach(image => {
        formDataToSend.append("mainImages", image);
      });

      // Add variant images
      variantImages.forEach((files, index) => {
        if (files && files.length > 0) {
          files.forEach(file => {
            formDataToSend.append(`variantImages[${index}]`, file);
          });
        }
      });

      let response;
      if (initialProduct) {
        // Update product
        response = await api.put(
          `/api/products/${initialProduct._id}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // Create product
        response = await api.post(
          "/api/products",
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((stepNum) => (
                  <React.Fragment key={stepNum}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNum 
                        ? 'bg-[#b2965a] text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-12 h-1 ${
                        step > stepNum ? 'bg-[#b2965a]' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {step === 1 && "Basic Information"}
                {step === 2 && "Pricing & Variants"}
                {step === 3 && "SEO & Images"}
              </span>
            </div>
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
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
                <FiPackage className="inline-block w-5 h-5 mr-2" />
                Product Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
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
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none resize-none"
                      placeholder="Brief description for product cards"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.shortDescription.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none resize-none"
                      placeholder="Detailed product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                      >
                        {GENDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <select
                        name="material"
                        value={formData.material}
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                      >
                        {MATERIALS.map(mat => (
                          <option key={mat} value={mat}>{mat}</option>
                        ))}
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
                        {PURITY_OPTIONS[formData.material]?.map(purity => (
                          <option key={purity} value={purity}>{purity}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (grams)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                      placeholder="e.g., 5.2"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-800 hover:text-blue-900"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex gap-6 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#b2965a] rounded focus:ring-[#b2965a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <FiEye className="inline-block w-4 h-4 mr-1" />
                    Featured Product
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#b2965a] rounded focus:ring-[#b2965a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <FiEye className="inline-block w-4 h-4 mr-1" />
                    Active Product
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Variants */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
                <FiTag className="inline-block w-5 h-5 mr-2" />
                Pricing & Variants
              </h3>

              {/* Base Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    name="baseSalePrice"
                    min="0"
                    step="0.01"
                    value={formData.baseSalePrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Discount %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="overallDiscountPercentage"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.overallDiscountPercentage}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                    />
                    <FiPercent className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Product Variants</h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 px-4 py-2 bg-[#b2965a] text-white rounded-lg hover:bg-[#9c8146]"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Variant
                  </button>
                </div>

                {variants.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FiLayers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No variants added yet</p>
                    <p className="text-sm text-gray-500">
                      Add variants for different colors, sizes, and prices
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <VariantForm
                        key={index}
                        variant={variant}
                        index={index}
                        onChange={updateVariant}
                        onRemove={removeVariant}
                        onImageUpload={handleVariantImageUpload}
                        variantImages={variantImages}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: SEO & Images */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
                <FiImage className="inline-block w-5 h-5 mr-2" />
                Images & SEO
              </h3>

              {/* Main Images */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Product Images (Max 5)
                  </label>
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-[#b2965a] hover:bg-gray-50"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload Images
                  </button>
                  <input
                    type="file"
                    ref={mainFileInputRef}
                    onChange={handleMainImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {mainImagePreviews.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No images uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">
                      First image will be used as thumbnail
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {mainImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMainImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-3 h-3" />
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

              {/* SEO Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none"
                    placeholder="Optimized title for search engines"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b2965a] focus:border-[#b2965a] outline-none resize-none"
                    placeholder="Optimized description for search engines"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Next Step
                </button>
              ) : (
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
              )}
            </div>
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
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
      await api.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/api/products/${id}`, {
        isActive: !currentStatus
      });
      setProducts(prev => prev.map(p => 
        p._id === id ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (error) {
      console.error("Toggle status error:", error);
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
                         product.description?.toLowerCase().includes(search.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(search.toLowerCase()) ||
                         product.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "inStock" && product.inStock) ||
                        (stockFilter === "outOfStock" && !product.inStock);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.isActive) ||
                         (statusFilter === "inactive" && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];
  const totalStock = filteredProducts.reduce((sum, p) => sum + (p.totalStock || 0), 0);
  const activeProducts = filteredProducts.filter(p => p.isActive).length;
  const featuredProducts = filteredProducts.filter(p => p.isFeatured).length;

  return (
    <AdminLayout>
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog with variants</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <FiPlus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-[#b2965a]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
            </div>
            <FiPackage className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
            </div>
            <FiEye className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured Products</p>
              <p className="text-2xl font-bold text-gray-900">{featuredProducts}</p>
            </div>
            <FiEye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* View Mode & Reset */}
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
              >
                List
              </button>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStockFilter("all");
                setStatusFilter("all");
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b2965a]"></div>
          <p className="text-gray-500 mt-2">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
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
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.mainImages?.[0]?.url || 'https://via.placeholder.com/300x200'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {!product.isActive && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                    Inactive
                  </div>
                )}
                {product.isFeatured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#b2965a] text-white text-xs rounded">
                    Featured
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                  <span className="font-bold text-[#b2965a]">
                    ₹{product.baseSalePrice || product.basePrice}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 truncate">
                  {product.shortDescription || product.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {product.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {product.gender}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {product.variants?.length || 0} variants
                  </span>
                </div>

                {/* Stock & Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.inStock ? `${product.totalStock || 0} in stock` : 'Out of stock'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(product._id, product.isActive)}
                      className={`p-1 rounded ${product.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {product.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View (Table)
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price & Variants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock & Status</th>
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
                            src={product.mainImages?.[0]?.url || 'https://via.placeholder.com/48'} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{product.title}</p>
                            {product.isFeatured && (
                              <span className="px-2 py-1 bg-[#b2965a] text-white text-xs rounded">
                                Featured
                              </span>
                            )}
                            {!product.isActive && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {product.shortDescription || product.description}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {product.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {product.tags?.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{product.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {product.category}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{product.subCategory}</p>
                        <p className="text-xs text-gray-400 mt-1">{product.gender}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {product.baseSalePrice ? (
                            <>
                              <p className="text-lg font-bold text-gray-900">₹{product.baseSalePrice}</p>
                              <p className="text-sm text-gray-500 line-through">₹{product.basePrice}</p>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                -{product.overallDiscountPercentage}%
                              </span>
                            </>
                          ) : (
                            <p className="font-bold text-gray-900">₹{product.basePrice}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.material} {product.purity} • {product.weight}g
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <FiLayers className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {product.variants?.length || 0} variants
                          </span>
                          {product.availableColors?.slice(0, 3).map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hexCode }}
                              title={color.name}
                            />
                          ))}
                          {product.availableColors?.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{product.availableColors.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.inStock 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {product.inStock && (
                            <span className="text-xs font-medium text-gray-700">
                              {product.totalStock || 0} units
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.variants?.slice(0, 2).map(variant => (
                            <div key={variant._id} className="flex items-center gap-1">
                              <span>{variant.color.name} ({variant.size})</span>
                              <span className="text-gray-400">•</span>
                              <span>{variant.stockQuantity}</span>
                            </div>
                          ))}
                          {product.variants?.length > 2 && (
                            <span className="text-gray-400">
                              +{product.variants.length - 2} more variants
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(product._id, product.isActive)}
                          className={`p-2 rounded-lg ${
                            product.isActive 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                          title={product.isActive ? "Deactivate" : "Activate"}
                        >
                          {product.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
        </div>
      )}

      {/* Pagination */}
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