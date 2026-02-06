import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  updateVariantStock,
  searchProducts,
  getProductsByCategory
} from "../controllers/adminProductController.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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

// Admin middleware for all routes
router.use(requireAuth, requireAdmin);

// ============ PRODUCT ROUTES ============

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

// Get all products with filtering
router.get("/products", getProducts);

// Get product by ID (for admin editing)
router.get("/products/:id", getProductById);

// Get product by slug (public/product detail)
router.get("/products/:slug", getProductBySlug);

// Search products
router.get("/products/search", searchProducts);

// Get products by category
router.get("/products/category/:category", getProductsByCategory);

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

// Soft delete product (set isActive to false)
router.delete("/products/:id", deleteProduct);

// Hard delete product (permanent deletion)
router.delete("/products/:id/hard", hardDeleteProduct);

// ============ BULK OPERATIONS ============

// Bulk update products (for admin)
router.patch("/products/bulk/update", async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs are required"
      });
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
router.get("/products/export/csv", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('title slug basePrice baseSalePrice category subCategory brand totalStock variants')
      .lean();
    
    // Convert to CSV format
    const csvData = products.map(product => ({
      Title: product.title,
      Slug: product.slug,
      Base_Price: product.basePrice,
      Sale_Price: product.baseSalePrice || '',
      Category: product.category,
      Subcategory: product.subCategory,
      Brand: product.brand || '',
      Stock: product.totalStock,
      Variants: product.variants?.length || 0
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
    
    // Simple CSV conversion
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
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

// Public routes (no admin check)
router.get("/public/products", async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      subCategory,
      minPrice, 
      maxPrice,
      color,
      size,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter for public (only active products)
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice || maxPrice) {
      filter.minPrice = {};
      if (minPrice) filter.minPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.maxPrice.$lte = parseFloat(maxPrice);
    }
    if (color) filter['availableColors.name'] = { $regex: color, $options: 'i' };
    if (size) filter.availableSizes = size;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('title slug basePrice baseSalePrice mainImages brand category subCategory overallDiscountPercentage isFeatured')
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    });
  } catch (err) {
    console.error("Public products error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching products"
    });
  }
});

router.get("/public/product/:slug", getProductBySlug);

router.get("/public/products/category/:category", getProductsByCategory);

router.get("/public/products/search", searchProducts);

// Get featured products
router.get("/public/products/featured", async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true,
      inStock: true 
    })
    .select('title slug basePrice baseSalePrice mainImages brand overallDiscountPercentage')
    .limit(10)
    .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Featured products error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching featured products"
    });
  }
});

// Get new arrivals
router.get("/public/products/new-arrivals", async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true,
      inStock: true 
    })
    .select('title slug basePrice baseSalePrice mainImages brand overallDiscountPercentage')
    .limit(10)
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("New arrivals error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching new arrivals"
    });
  }
});

export default router;