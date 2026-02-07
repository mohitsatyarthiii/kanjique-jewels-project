import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

// Add item to cart
router.post("/", addToCart);

// Get user cart
router.get("/", getCart);

// Update cart item quantity
router.put("/", updateCartItem);

// Remove item from cart
router.delete("/:productId", removeCartItem);

// Clear entire cart
router.delete("/", clearCart);

export default router;