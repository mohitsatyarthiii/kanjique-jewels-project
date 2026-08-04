import express from "express";
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
  deleteProductImage,
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
import { uploadProductImages } from "../middleware/productImageUpload.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

const router = express.Router();

// ======================== ADMIN ROUTES (Protected) ========================

// NOTE: apply `requireAuth` + `requireAdmin` only to admin routes below.
// Public frontend routes are declared first so they remain accessible.

// Create product with images
router.post("/products", requireAuth, requireAdmin,
  uploadProductImages,
  createProduct
);

// Get all products (admin view with all filters)
router.get("/products", requireAuth, requireAdmin, getAdminProducts);

// Get single product by ID (admin view)
router.get("/products/:id", requireAuth, requireAdmin, getAdminProductById);

// Update product with images
router.put("/products/:id", requireAuth, requireAdmin,
  uploadProductImages,
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

// Delete one main or variant image by its subdocument ID.
router.delete("/products/:id/images/:imageId", requireAuth, requireAdmin, deleteProductImage);

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
