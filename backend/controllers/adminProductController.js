import { Product } from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";

// Create new product
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, subCategory, brand, inStock } = req.body;

    if (!title || !price || !category || !subCategory)
      return res.status(400).json({ error: "Title, price, category and subcategory required" });

    // handle images
    let images = [];
    if (req.files) {
      images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const slug = title.toLowerCase().replace(/ /g, "-");
    const product = await Product.create({
      title,
      slug,
      description,
      price,
      category,
      subCategory,
      brand,
      images,
      inStock: inStock !== undefined ? inStock : true,
      createdBy: req.user._id,
    });

    res.json({ ok: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ ok: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // optional: handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({ url: file.path, public_id: file.filename }));
      updates.images = newImages; // replace existing images
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ ok: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // delete images from cloudinary
    if (product.images && product.images.length > 0) {
      for (let img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await product.deleteOne();
    res.json({ ok: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
