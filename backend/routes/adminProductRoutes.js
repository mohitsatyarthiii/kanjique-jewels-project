import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  // Admin functions
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  updateVariantStock,
  toggleProductStatus,
  toggleFeaturedStatus,
  bulkUpdateProducts,
  bulkDeleteProducts,
  exportProductsCSV,
  
  // Frontend functions
  getProductDetails,
  getFeaturedProducts,
  getFrontendProducts,
  searchProducts,
  getProductsByCategory,
  getNewArrivals,
  getRelatedProducts,
  getAvailableFilters
} from "../controllers/adminProductController.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

const router = express.Router();

// Multer + Cloudinary setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    format: async (req, file) => {
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

// File filter for images only
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

// ======================== ADMIN ROUTES (Protected) ========================

// NOTE: apply `requireAuth` + `requireAdmin` only to admin routes below.
// Public frontend routes are declared first so they remain accessible.

// Create product with images
router.post("/products", requireAuth, requireAdmin,
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

// Get all products (admin view with all filters)
router.get("/products", requireAuth, requireAdmin, getAdminProducts);

// Get single product by ID (admin view)
router.get("/products/:id", requireAuth, requireAdmin, getAdminProductById);

// Update product with images
router.put("/products/:id", requireAuth, requireAdmin,
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
router.patch("/products/:productId/variants/:variantId/stock", requireAuth, requireAdmin, updateVariantStock);

// Toggle product active status
router.patch("/products/:id/toggle-status", requireAuth, requireAdmin, toggleProductStatus);

// Toggle featured status
router.patch("/products/:id/toggle-featured", requireAuth, requireAdmin, toggleFeaturedStatus);

// Soft delete product
router.delete("/products/:id", requireAuth, requireAdmin, deleteProduct);

// Hard delete product (permanent)
router.delete("/products/:id/hard", requireAuth, requireAdmin, hardDeleteProduct);

// Bulk update products
router.patch("/products/bulk/update", requireAuth, requireAdmin, bulkUpdateProducts);

// Bulk delete products
router.delete("/products/bulk/delete", requireAuth, requireAdmin, bulkDeleteProducts);

// Export products to CSV
router.get("/products/export/csv", requireAuth, requireAdmin, exportProductsCSV);

// ======================== PUBLIC ROUTES (for frontend) ========================

// Get all products for frontend with filtering
router.get("/public/products", getFrontendProducts);

// Get single product details by slug
router.get("/public/products/details/:slug", getProductDetails);

// Get featured products
router.get("/public/products/featured", getFeaturedProducts);

// Get new arrivals
router.get("/public/products/new-arrivals", getNewArrivals);

// Get related products
router.get("/public/products/related/:productId", getRelatedProducts);

// Search products
router.get("/public/products/search", searchProducts);

// Get products by category
router.get("/public/products/category/:category", getProductsByCategory);

// Get available filters
router.get("/public/products/filters/available", getAvailableFilters);

// Add this route for public product access by ID
router.get("/public/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID"
      });
    }

    const product = await Product.findOne({ 
      _id: id,
      isActive: true 
    })
    .select('-__v -createdBy -updatedBy -updatedAt')
    .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    // Filter only active variants
    product.variants = product.variants.filter(variant => variant.isActive);
    
    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching product" 
    });
  }
});

export default router;