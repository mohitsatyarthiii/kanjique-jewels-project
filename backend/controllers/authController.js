import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const COOKIE_NAME = process.env.COOKIE_NAME || "token";

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const token = generateToken({ id: user._id });
    setTokenCookie(res, token);

    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken({ id: user._id });
    setTokenCookie(res, token);

    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ ok: true });
};

export const me = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
  res.json({ ok: true, user: safeUser });
};
