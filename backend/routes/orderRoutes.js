import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { placeOrder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, getOrders);

export default router;
