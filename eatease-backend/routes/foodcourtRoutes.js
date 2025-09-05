import express from "express";
import { FoodCourt, User } from "../models/index.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, location, city } = req.body;
    const user_id = req.user.id;

    if (!name || !location || !city) {
      return res.status(400).json({ error: "All fields (name, location, city) are required" });
    }

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.usertype !== "admin") {
      return res.status(403).json({ error: "Only admins can create foodcourts" });
    }

    const newFoodcourt = await FoodCourt.create({ name, location, city, user_id });
    res.status(201).json(newFoodcourt);
  } catch (err) {
    console.error("Error creating foodcourt:", err);
    res.status(500).json({ error: "Failed to create foodcourt" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, city } = req.body;

    const foodcourt = await FoodCourt.findByPk(id);
    if (!foodcourt) return res.status(404).json({ error: "Foodcourt not found" });
    if (foodcourt.user_id !== req.user.id) {
      return res.status(403).json({ error: "You can only edit your own foodcourts" });
    }

    foodcourt.name = name || foodcourt.name;
    foodcourt.location = location || foodcourt.location;
    foodcourt.city = city || foodcourt.city;

    await foodcourt.save();
    res.json(foodcourt);
  } catch (err) {
    console.error("Error updating foodcourt:", err);
    res.status(500).json({ error: "Failed to update foodcourt" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const foodcourt = await FoodCourt.findByPk(id);
    if (!foodcourt) return res.status(404).json({ error: "Foodcourt not found" });

    if (foodcourt.user_id !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own foodcourts" });
    }

    await foodcourt.destroy();
    res.json({ message: "Foodcourt deleted successfully" });
  } catch (err) {
    console.error("Error deleting foodcourt:", err);
    res.status(500).json({ error: "Failed to delete foodcourt" });
  }
});




router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const adminId = req.user.id;
    const foodcourts = await FoodCourt.findAll({
      where: { user_id: adminId },
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });
    res.json(foodcourts);
  } catch (err) {
    console.error("Error fetching admin foodcourts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- NEW ROBUST, CASE-INSENSITIVE SEARCH LOGIC ---
router.get("/search", async (req, res) => {
  try {
    const { mall, city } = req.query;

    if (!mall || !mall.trim()) {
      return res.status(400).json({ error: "Foodcourt name is required for search." });
    }

    const whereClause = {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("name")),
          { [Op.like]: `%${mall.trim().toLowerCase()}%` }
        )
      ]
    };

    if (city && city.trim()) {
      whereClause[Op.and].push(
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("city")),
          { [Op.like]: `%${city.trim().toLowerCase()}%` }
        )
      );
    }

    const foodcourts = await FoodCourt.findAll({ where: whereClause });
    res.status(200).json({ foodcourts });

  } catch (err) {
    console.error("Error searching foodcourts:", err);
    res.status(500).json({ error: "An error occurred during the search." });
  }
});


router.get("/public", async (req, res) => {
  try {
    const { city } = req.query;
    let where = {};
    if (city) where.city = { [Op.like]: `%${city}%` };

    const foodcourts = await FoodCourt.findAll({ where });
    res.json(foodcourts);
  } catch (err) {
    console.error("Error fetching public foodcourts:", err);
    res.status(500).json({ error: "Failed to fetch foodcourts" });
  }
});

router.get("/", async (req, res) => {
  try {
    const foodcourts = await FoodCourt.findAll({
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });
    res.json(foodcourts);
  } catch (err) {
    console.error("Error fetching all foodcourts:", err);
    res.status(500).json({ error: "Failed to fetch foodcourts" });
  }
});

// This dynamic route MUST be last among the GET routes
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(404).json({ error: "Foodcourt not found" });
    }
    const foodcourt = await FoodCourt.findByPk(id, {
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });

    if (!foodcourt) return res.status(404).json({ error: "Foodcourt not found" });
    res.json(foodcourt);
  } catch (err) {
    console.error("Error fetching foodcourt by ID:", err);
    res.status(500).json({ error: "Failed to fetch foodcourt" });
  }
});

export default router;

