import express from "express";
import { User, Role, Permission, UserRole } from "../models/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { user_id, role_id, foodcourt_id } = req.body;
    if (!user_id || !role_id) return res.status(400).json({ error: "user_id and role_id are required" });

    const userRole = await UserRole.create({ user_id, role_id, foodcourt_id: foodcourt_id || null });
    res.status(201).json(userRole);
  } catch (error) {
    res.status(500).json({ error: "Failed to assign role" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "usertype"],
      include: [{
        model: Role,
        include: [Permission],
      }],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user roles" });
  }
});

export default router;
