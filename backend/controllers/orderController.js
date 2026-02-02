import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const order = new Order({
      user: userId,
      items: cart.items,
      totalAmount: cart.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      ),
      status: "Pending",
    });

    await order.save();

    // Empty cart after placing order
    cart.items = [];
    await cart.save();

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "items.product"
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
