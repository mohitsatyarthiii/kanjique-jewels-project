import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true }, // e.g., "men", "women", "kids"
   // e.g., "men", "women", "kids"
  brand: { type: String },
  images: [{ url: String, public_id: String }], // cloudinary images
  inStock: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
