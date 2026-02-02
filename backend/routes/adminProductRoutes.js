import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/adminProductController.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// multer + cloudinary setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    format: async (req, file) => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});
const parser = multer({ storage });

// admin-only routes
router.use(requireAuth, requireAdmin);

router.post("/products", parser.array("images", 4), createProduct);
router.get("/products", getProducts);
router.put("/products/:id", parser.array("images", 4), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
