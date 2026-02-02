import { User } from "../models/User.js";

// Get logged in user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user's profile (name, mobile, address)
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
