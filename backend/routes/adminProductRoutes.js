import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  getProductDetails,
  getFrontendProducts,
  getFeaturedProducts,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  updateVariantStock,
  searchProducts,
  getProductsByCategory,
  toggleProductStatus,
  toggleFeaturedStatus
} from "../controllers/adminProductController.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Product } from "../models/Product.js";

const router = express.Router();

// Multer + Cloudinary setup with multiple file fields
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    format: async (req, file) => {
      // Preserve original format or convert to webp for optimization
      const ext = file.originalname.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'webp';
    },
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const name = file.originalname.split('.')[0].replace(/\s+/g, '-').toLowerCase();
      return `${timestamp}-${random}-${name}`;
    },
    transformation: [
      { width: 1200, height: 1200, crop: "limit", quality: "auto" },
      { fetch_format: "auto" }
    ]
  },
});

// Custom file filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 20 // Maximum 20 files total
  }
});

// ============ ADMIN ROUTES (Protected) ============

// Apply auth and admin middleware to all routes
router.use(requireAuth, requireAdmin);

// Create product with multiple image fields
router.post("/products", 
  upload.fields([
    { name: 'mainImages', maxCount: 5 },
    { name: 'variantImages[0]', maxCount: 3 },
    { name: 'variantImages[1]', maxCount: 3 },
    { name: 'variantImages[2]', maxCount: 3 },
    { name: 'variantImages[3]', maxCount: 3 },
    { name: 'variantImages[4]', maxCount: 3 }
  ]), 
  createProduct
);

// Get all products with filtering (admin view)
router.get("/products", getProducts);

// Get single product by ID (admin view)
router.get("/products/:id", getProductById);

// Update product with multiple image fields
router.put("/products/:id", 
  upload.fields([
    { name: 'mainImages', maxCount: 5 },
    { name: 'variantImages[0]', maxCount: 3 },
    { name: 'variantImages[1]', maxCount: 3 },
    { name: 'variantImages[2]', maxCount: 3 },
    { name: 'variantImages[3]', maxCount: 3 },
    { name: 'variantImages[4]', maxCount: 3 }
  ]), 
  updateProduct
);

// Update variant stock
router.patch("/products/:productId/variants/:variantId/stock", updateVariantStock);

// Toggle product active status
router.patch("/products/:id/toggle-status", toggleProductStatus);

// Toggle featured status
router.patch("/products/:id/toggle-featured", toggleFeaturedStatus);

// Soft delete product (set isActive to false)
router.delete("/products/:id", deleteProduct);

// Hard delete product (permanent deletion)
router.delete("/products/:id/hard", hardDeleteProduct);

// Search products (admin)
router.get("/products/search", searchProducts);

// Get products by category (admin)
router.get("/products/category/:category", getProductsByCategory);

// ============ BULK OPERATIONS (Admin Only) ============

// Bulk update products
router.patch("/products/bulk/update", async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs are required"
      });
    }
    
    // Remove tags if present (since we removed tags from schema)
    if (updates.tags) {
      delete updates.tags;
    }
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { 
        ...updates,
        updatedBy: req.user._id 
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({
      success: false,
      error: "Server error in bulk update"
    });
  }
});

// Bulk delete products (soft delete)
router.delete("/products/bulk/delete", async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs are required"
      });
    }
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { 
        isActive: false,
        updatedBy: req.user._id 
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products deleted`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({
      success: false,
      error: "Server error in bulk delete"
    });
  }
});

// Export products (for backup or export)
router.get("/admin/products/export/csv", async (req, res) => {
  try {
    const products = await Product.find()
      .select('title slug basePrice baseSalePrice category subCategory gender brand totalStock inStock isFeatured isActive createdAt')
      .populate('createdBy', 'name email')
      .lean();
    
    // Convert to CSV format (updated without tags)
    const csvData = products.map(product => ({
      ID: product._id,
      Title: product.title,
      Slug: product.slug,
      Base_Price: product.basePrice,
      Sale_Price: product.baseSalePrice || '',
      Category: product.category,
      Subcategory: product.subCategory,
      Gender: product.gender || '',
      Brand: product.brand || '',
      Stock: product.totalStock,
      In_Stock: product.inStock ? 'Yes' : 'No',
      Featured: product.isFeatured ? 'Yes' : 'No',
      Active: product.isActive ? 'Yes' : 'No',
      Created_At: new Date(product.createdAt).toLocaleDateString(),
      Created_By: product.createdBy?.name || product.createdBy?.email || 'N/A'
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
    
    // Simple CSV conversion
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');
    
    res.send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({
      success: false,
      error: "Server error exporting products"
    });
  }
});

// ============ PUBLIC ROUTES (for frontend) ============

// Get all products for frontend with filtering
router.get("/products", getFrontendProducts);

// Get single product details by slug (frontend)
router.get("/products/details/:slug", getProductDetails);

// Get featured products for frontend
router.get("/products/featured", getFeaturedProducts);

// Search products for frontend
router.get("/products/search", searchProducts);

// Get products by category for frontend
router.get("/products/category/:category", getProductsByCategory);

// Get new arrivals for frontend
router.get("/products/new-arrivals", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ 
      isActive: true,
      inStock: true 
    })
    .select('title slug basePrice baseSalePrice mainImages brand category overallDiscountPercentage minPrice maxPrice availableColors')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();
    
    const productsWithDisplayPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice
    });
  } catch (err) {
    console.error("New arrivals error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching new arrivals"
    });
  }
});

// Get related products (by category)
router.get("/products/related/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;
    
    // Get the current product to find its category
    const currentProduct = await Product.findById(productId)
      .select('category subCategory')
      .lean();
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      inStock: true,
      category: currentProduct.category,
      subCategory: currentProduct.subCategory
    })
    .select('title slug basePrice baseSalePrice mainImages brand category overallDiscountPercentage')
    .limit(parseInt(limit))
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();
    
    const productsWithDisplayPrice = relatedProducts.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice
    });
  } catch (err) {
    console.error("Related products error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching related products"
    });
  }
});

// Get available filters for frontend
router.get("/products/filters/available", async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    
    const filter = { isActive: true, inStock: true };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    
    // Get unique categories, subcategories, brands, colors, sizes
    const [
      categories,
      subCategories,
      brands,
      colorsResult,
      sizesResult,
      priceRange
    ] = await Promise.all([
      Product.distinct('category', filter),
      Product.distinct('subCategory', filter),
      Product.distinct('brand', filter).where('brand').ne(null).ne(''),
      Product.aggregate([
        { $match: filter },
        { $unwind: "$availableColors" },
        { $group: {
          _id: "$availableColors.name",
          hexCode: { $first: "$availableColors.hexCode" },
          count: { $sum: 1 }
        }},
        { $project: {
          name: "$_id",
          hexCode: 1,
          count: 1,
          _id: 0
        }}
      ]),
      Product.aggregate([
        { $match: filter },
        { $unwind: "$availableSizes" },
        { $group: {
          _id: "$availableSizes",
          count: { $sum: 1 }
        }},
        { $project: {
          size: "$_id",
          count: 1,
          _id: 0
        }}
      ]),
      Product.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          minPrice: { $min: "$minPrice" },
          maxPrice: { $max: "$maxPrice" }
        }}
      ])
    ]);
    
    res.json({
      success: true,
      filters: {
        categories,
        subCategories: subCategories.filter(Boolean),
        brands: brands.filter(Boolean),
        colors: colorsResult,
        sizes: sizesResult,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      }
    });
  } catch (err) {
    console.error("Available filters error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching filters"
    });
  }
});

export default router;