import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// Get user profile
router.get("/api/profile", requireAuth, getProfile);

// Update user profile
router.put("/api/profile", requireAuth, updateProfile);

export default router;
