import express from "express";
import { Permission } from "../models/index.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch {
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const newPermission = await Permission.create({ name, description });
    res.status(201).json(newPermission);
  } catch {
    res.status(500).json({ error: "Failed to create permission" });
  }
});

export default router;
