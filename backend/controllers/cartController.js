import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;
    const userId = req.user._id;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid product ID" 
      });
    }

    // Find product with variants
    const product = await Product.findOne({ 
      _id: productId,
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }

    // Check stock based on variant or product
    let inStock = product.inStock;
    let price = product.basePrice;
    let variantDetails = null;

    // If variant is specified, find variant details
    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.status(404).json({
          success: false,
          error: "Variant not found"
        });
      }
      if (variant.stockQuantity <= 0) {
        return res.status(400).json({
          success: false,
          error: "Variant is out of stock"
        });
      }
      inStock = variant.stockQuantity > 0;
      price = variant.salePrice || variant.price;
      variantDetails = {
        color: variant.color,
        size: variant.size,
        sku: variant.sku
      };
    } else {
      // Check product stock
      if (product.totalStock <= 0) {
        return res.status(400).json({
          success: false,
          error: "Product is out of stock"
        });
      }
    }

    // Use sale price if available
    const finalPrice = product.baseSalePrice || price;

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
      item => item.product.toString() === productId && 
             item.variant?.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
      
      // Check stock availability for variant
      if (variantId) {
        const variant = product.variants.id(variantId);
        if (newQuantity > variant.stockQuantity) {
          return res.status(400).json({
            success: false,
            error: `Only ${variant.stockQuantity} items available in stock`
          });
        }
      } else {
        if (newQuantity > product.totalStock) {
          return res.status(400).json({
            success: false,
            error: `Only ${product.totalStock} items available in stock`
          });
        }
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = finalPrice;
    } else {
      // Add new item to cart
      const newItem = {
        product: productId,
        quantity: parseInt(quantity),
        price: finalPrice,
        variant: variantId || null,
        variantDetails: variantDetails
      };
      cart.items.push(newItem);
    }

    // Recalculate cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Save cart
    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title slug mainImages basePrice baseSalePrice category brand inStock totalStock variants'
    });

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: cart
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
        select: 'title slug mainImages basePrice baseSalePrice category brand inStock totalStock variants'
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          totalSavings: 0
        }
      });
    }

    // Calculate totals and add savings
    let totalItems = 0;
    let totalPrice = 0;
    let totalSavings = 0;

    cart.items.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
      
      // Calculate savings if sale price exists
      const product = item.product;
      if (product && product.basePrice > item.price) {
        totalSavings += (product.basePrice - item.price) * item.quantity;
      }
    });

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.totalSavings = totalSavings;

    await cart.save();

    res.status(200).json({
      success: true,
      cart: cart
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

    if (!productId || quantity === undefined || quantity < 0) {
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
             item.variant?.toString() === variantId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = await Product.findById(productId);
      
      if (variantId) {
        const variant = product.variants.id(variantId);
        if (!variant || variant.stockQuantity < quantity) {
          return res.status(400).json({
            success: false,
            error: `Only ${variant?.stockQuantity || 0} items available in stock`
          });
        }
      } else {
        if (product.totalStock < quantity) {
          return res.status(400).json({
            success: false,
            error: `Only ${product.totalStock} items available in stock`
          });
        }
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title slug mainImages basePrice baseSalePrice category brand'
    });

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: cart
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
    const { variantId } = req.query;
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
      select: 'title slug mainImages basePrice baseSalePrice category brand'
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: cart
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
    cart.totalSavings = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: cart
    });

  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({
      success: false,
      error: "Server error clearing cart"
    });
  }
};