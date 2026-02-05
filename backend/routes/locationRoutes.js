import express from "express";
import { getLocalizedProducts } from "../controllers/locationController.js";

const router = express.Router();

router.get("/localized-products", getLocalizedProducts);

export default router;
