import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    // Multiple sources से token check करें
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      // Bearer token से check करें
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      console.log("No token found in cookies or headers");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.status(401).json({ error: "Authentication failed" });
  }
};

