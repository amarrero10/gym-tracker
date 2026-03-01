import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const router = express.Router();

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "password must be at least 8 characters" });
    }

    const normalizedUsername = username.toLowerCase().trim();

    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) {
      return res.status(409).json({ message: "username already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      displayName,
      passwordHash,
    });

    const token = signToken({ userId: user._id.toString() });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Error registering user" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    const normalizedUsername = username.toLowerCase().trim();

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = signToken({ userId: user._id.toString() });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error logging in" });
  }
};

export default router;

// my token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWEzYWNlYTNkZjFjZmM2NTk4Y2JkZjgiLCJpYXQiOjE3NzIzMzQzMTQsImV4cCI6MTc3MjkzOTExNH0.giajlZlqydwzRs0CXmEr78-sVVY0TQcHFChwuRM68EY

// Login token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWEzYWNlYTNkZjFjZmM2NTk4Y2JkZjgiLCJpYXQiOjE3NzIzMzQ0MDQsImV4cCI6MTc3MjkzOTIwNH0.RJe2R1BZ1idBRT8MmGLxvShkk9SZwYgvsBx8T4JuFiM

// MY ID 69a3acea3df1cfc6598cbdf8

// MY Plan Id: 69a0c7e2b56b9db07de07625
