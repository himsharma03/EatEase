import express from "express";
import { Role, Permission } from "../models/index.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const roles = await Role.findAll({ include: [{ model: Permission }] });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, permissions } = req.body; 
    const role = await Role.create({ name, description });

    if (permissions && permissions.length > 0) {
      await role.setPermissions(permissions);
    }

    const roleWithPerms = await Role.findByPk(role.id, { include: [{ model: Permission }] });
    res.status(201).json(roleWithPerms);
  } catch (error) {
    res.status(500).json({ error: "Failed to create role" });
  }
});

export default router;
