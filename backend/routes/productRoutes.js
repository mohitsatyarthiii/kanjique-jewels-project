import express from "express";
import { getProductById, getProducts, getSimilarProducts, getSuggestedProducts } from "../controllers/productController.js";

const router = express.Router();

// Public route to fetch products
router.get("/", getProducts);
router.get("/:id", getProductById);

// Get similar products based on current product's category
router.get('/similar/:productId', getSimilarProducts);

// Get suggested products for a category (for category pages)
router.get('/suggested/:category', getSuggestedProducts);

export default router;
