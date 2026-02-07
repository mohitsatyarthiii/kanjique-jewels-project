import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// Get user profile
router.get("/", requireAuth, getProfile);

// Update user profile
router.put("/", requireAuth, updateProfile);

export default router;
