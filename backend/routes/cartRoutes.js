import express from "express";
import { addToCart, getCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/cart", requireAuth, addToCart);
router.get("/api/cart", requireAuth, getCart);
router.put("/api/cart", requireAuth, updateCartItem);
router.delete("/api/cart/:productId", requireAuth, removeCartItem);

export default router;
