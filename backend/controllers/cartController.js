import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const idx = cart.items.findIndex(it => it.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.product", "title slug price images inStock");
    res.json({ success: true, cart });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "title slug price images inStock");
    res.json({ cart: cart || { items: [] } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const idx = cart.items.findIndex(it => it.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ error: "Item not in cart" });

    cart.items[idx].quantity = Number(quantity);
    await cart.save();
    await cart.populate("items.product", "title slug price images inStock");
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Remove item
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(it => it.product.toString() !== productId);
    await cart.save();
    await cart.populate("items.product", "title slug price images inStock");
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
