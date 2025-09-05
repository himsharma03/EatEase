import express from "express";
import { Table, Booking } from "../models/index.js"; 
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Op } from "sequelize"; 

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
    const { foodcourt_id, number, capacity } = req.body;

    if (!foodcourt_id || !number || !capacity) {
      return res.status(400).json({ error: "All fields required" });
    }

    const newTable = await Table.create({ foodcourt_id, number, capacity });
    res.status(201).json(newTable);
  } catch (err) {
    console.error("Error creating table:", err);
    res.status(500).json({ error: "Failed to create table" });
  }
});

router.get("/:foodcourtId", authMiddleware, async (req, res) => {
  try {
    const { foodcourtId } = req.params;
    const tables = await Table.findAll({ where: { foodcourt_id: foodcourtId } });
    res.json(tables);
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { number, capacity } = req.body;

    const table = await Table.findByPk(id);
    if (!table) return res.status(404).json({ error: "Table not found" });

    table.number = number || table.number;
    table.capacity = capacity || table.capacity;

    await table.save();
    res.json(table);
  } catch (err) {
    console.error("Error updating table:", err);
    res.status(500).json({ error: "Failed to update table" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);
    if (!table) return res.status(404).json({ error: "Table not found" });

    await table.destroy();
    res.json({ message: "Table deleted successfully" });
  } catch (err) {
    console.error("Error deleting table:", err);
    res.status(500).json({ error: "Failed to delete table" });
  }
});

router.get("/status/:foodcourtId", authMiddleware, async (req, res) => {
  try {
    const { foodcourtId } = req.params;
    const now = new Date();

    const tables = await Table.findAll({
      where: { foodcourt_id: foodcourtId },
      include: [
        {
          model: Booking,
          as: "bookings", 
          where: {
            status: "booked",
            start_time: { [Op.lte]: now },
            end_time: { [Op.gte]: now },
          },
          required: false, 
        },
      ],
    });

    const result = tables.map((t) => ({
      id: t.id,
      number: t.number,
      capacity: t.capacity,
      status: t.bookings && t.bookings.length > 0 ? "occupied" : "available",
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching table status:", err);
    res.status(500).json({ error: "Failed to fetch table status" });
  }
});

export default router;
