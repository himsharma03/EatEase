import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", async (req, res) => {
  try {
    const { name, email, password, phone, usertype } = req.body;

    if (!name || !email || !password || !phone || !usertype) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      phone,
      usertype,
    });

    res.status(201).json({ id: newUser.id, name, email, phone, usertype });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "usertype", "phone"],
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone", "usertype"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const firstName = user.name.split(" ")[0];

    res.json({
      id: user.id,
      name: firstName, 
      email: user.email,
      phone: user.phone,
      usertype: user.usertype,
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
