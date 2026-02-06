// routes/cartRoutes.js
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

router.post("/", addToCart);
router.get("/", getCart);
router.put("/", updateCartItem);
router.delete("/item/:productId", removeCartItem);
router.delete("/clear", clearCart);

export default router;