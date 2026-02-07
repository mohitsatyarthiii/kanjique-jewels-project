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

// Apply auth and admin middleware to all admin routes
router.use(requireAuth, requireAdmin);

// Create product with images
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

// Get all products (admin view with all filters)
router.get("/products", getAdminProducts);

// Get single product by ID (admin view)
router.get("/products/:id", getAdminProductById);

// Update product with images
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

// Soft delete product
router.delete("/products/:id", deleteProduct);

// Hard delete product (permanent)
router.delete("/products/:id/hard", hardDeleteProduct);

// Bulk update products
router.patch("/products/bulk/update", bulkUpdateProducts);

// Bulk delete products
router.delete("/products/bulk/delete", bulkDeleteProducts);

// Export products to CSV
router.get("/products/export/csv", exportProductsCSV);

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

export default router;