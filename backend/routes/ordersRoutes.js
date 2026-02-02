import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getUserOrders } from "../controllers/ordersController.js";

const router = express.Router();

// GET /api/orders → get all payments/orders for logged-in user
router.get("/api/userorders", requireAuth, getUserOrders);

export default router;
