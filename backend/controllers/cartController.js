import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;
    const userId = req.user._id;

    // Find product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ 
        success: false,
        error: "Product not found or inactive" 
      });
    }

    // Check if product is in stock
    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        error: "Product is out of stock"
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ 
        user: userId, 
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variant?.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item to cart
      const newItem = {
        product: productId,
        quantity: parseInt(quantity),
        price: product.baseSalePrice || product.basePrice,
        variant: variantId || null,
        variantDetails: variantId ? product.variants.id(variantId) : null
      };
      cart.items.push(newItem);
    }

    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Save cart
    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title slug mainImages basePrice baseSalePrice inStock category brand'
    });

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error adding to cart",
      details: err.message 
    });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'title slug mainImages basePrice baseSalePrice inStock category brand availableColors availableSizes'
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      });
    }

    // Calculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });

  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching cart"
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, variantId } = req.body;
    const userId = req.user._id;

    if (!productId || quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data"
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }

    // Find item index
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
             (!variantId || item.variant?.toString() === variantId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }

    // Get product to check stock
    const product = await Product.findById(productId);
    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        error: "Product is out of stock"
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = parseInt(quantity);

    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title slug mainImages basePrice baseSalePrice inStock category brand'
    });

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });

  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({
      success: false,
      error: "Server error updating cart"
    });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }

    // Filter out the item
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => 
      !(item.product.toString() === productId && 
        (!variantId || item.variant?.toString() === variantId))
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }

    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    // Populate remaining items
    await cart.populate({
      path: 'items.product',
      select: 'title slug mainImages basePrice baseSalePrice inStock category brand'
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });

  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({
      success: false,
      error: "Server error removing item from cart"
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }

    // Clear all items
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });

  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({
      success: false,
      error: "Server error clearing cart"
    });
  }
};