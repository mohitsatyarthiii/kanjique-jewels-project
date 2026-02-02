import { Payment } from "../models/Payment.js";

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Payment.find({ user: req.user._id })
      .populate("items.product", "title images price") // <- yaha populate karna zaruri hai
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
