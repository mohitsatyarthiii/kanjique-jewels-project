import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const COOKIE_NAME = process.env.COOKIE_NAME || "token";

    // --- 1) PEHLE cookies check karo (MOST IMPORTANT) ---
    let token = req.cookies?.[COOKIE_NAME];

    // --- 2) Sirf fallback ke taur pe header check karo ---
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("No token found in cookies");
      return res.status(401).json({ error: "Not authenticated" });
    }

    // --- 3) Verify JWT ---
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verify failed:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // --- 4) Fetch user from DB ---
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("User not found for token:", decoded.id);
      return res.status(401).json({ error: "User not found" });
    }

    // --- 5) Attach user to request ---
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Auth server error" });
  }
};
