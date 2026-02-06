import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  color: { 
    name: { type: String, required: true }, // e.g., "Red", "Blue"
    hexCode: { type: String, required: true }, // e.g., "#FF0000"
  },
  size: { 
    type: String, 
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
    required: true 
  },
  stockQuantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true }, // variant-specific price
  salePrice: { type: Number }, // variant-specific sale price
  discountPercentage: { type: Number, default: 0 }, // discount for this variant
  sku: { type: String, unique: true }, // Stock Keeping Unit
  images: [{ url: String, public_id: String }], // variant-specific images
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  shortDescription: { type: String, maxlength: 200 }, // Add short description
  basePrice: { type: Number, required: true }, // Renamed from priceINR
  baseSalePrice: { type: Number }, // Renamed from salePrice
  overallDiscountPercentage: { type: Number, default: 0 }, // Overall product discount
  
  // Pricing range for filtering
  minPrice: { type: Number },
  maxPrice: { type: Number },
  
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  gender: { type: String, enum: ['men', 'women', 'kids', 'unisex'] }, // Added gender field
  brand: { type: String },
  
  // Main product images (for product listing)
  mainImages: [{ url: String, public_id: String }],
  
  // Product variants
  variants: [variantSchema],
  
  // Available colors (for filtering)
  availableColors: [{
    name: String,
    hexCode: String
  }],
  
  // Available sizes (for filtering)
  availableSizes: [String],
  
  // Stock management
  totalStock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { 
  timestamps: true 
});

// Pre-save middleware to update min/max prices and available colors/sizes
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    // Calculate min and max prices
    const prices = this.variants.map(v => v.salePrice || v.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
    
    // Update available colors
    const uniqueColors = [...new Set(
      this.variants.map(v => JSON.stringify({ 
        name: v.color.name, 
        hexCode: v.color.hexCode 
      }))
    )].map(str => JSON.parse(str));
    this.availableColors = uniqueColors;
    
    // Update available sizes
    const uniqueSizes = [...new Set(this.variants.map(v => v.size))];
    this.availableSizes = uniqueSizes;
    
    // Calculate total stock
    this.totalStock = this.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
    this.inStock = this.totalStock > 0;
  } else {
    // If no variants, use base prices
    this.minPrice = this.baseSalePrice || this.basePrice;
    this.maxPrice = this.baseSalePrice || this.basePrice;
    this.totalStock = 0;
    this.inStock = false;
  }
  
  next();
});

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ minPrice: 1, maxPrice: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });

export const Product = mongoose.model("Product", productSchema);