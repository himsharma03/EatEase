import express from "express";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import sequelize from "../config/db.js";
import FoodCourt from "../models/FoodCourt.js";
import generateBookingQR from "../controllers/qrController.js";
import { Op } from "sequelize";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router = express.Router();

router.post("/available", authMiddleware, async (req, res) => {
  try {
    const { foodcourt_id, start_time, end_time, guest_count } = req.body;
    if (!foodcourt_id || !start_time || !end_time || !guest_count) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const tables = await Table.findAll({ where: { foodcourt_id } });

    const overlapping = await Booking.findAll({
      where: {
        table_id: { [Op.in]: tables.map(t => t.id) },
        status: { [Op.in]: ["booked", "checked_in"] },
        [Op.and]: [
          { start_time: { [Op.lt]: end_time } },
          { end_time: { [Op.gt]: start_time } },
        ],
      },
    });

    const bookedIds = overlapping.map(b => b.table_id);

    const available = tables.filter(
      t => t.capacity >= guest_count && !bookedIds.includes(t.id)
    );

    res.json(available);
  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { table_id, start_time, end_time, guest_count } = req.body;
  const user_id = req.user.id;
  if (!table_id || !start_time || !end_time || !guest_count) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const booking = await sequelize.transaction(async (t) => {
      await Table.findByPk(table_id, { transaction: t, lock: t.LOCK.UPDATE });

      const conflict = await Booking.findOne({
        where: {
          table_id,
          status: { [Op.in]: ["booked", "checked_in"] }, 
          [Op.and]: [
            { start_time: { [Op.lt]: end_time } },
            { end_time: { [Op.gt]: start_time } },
          ],
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (conflict) throw new Error("BOOKED");

      return await Booking.create({
        user_id,
        table_id,
        guest_count,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        status: "booked",
      }, { transaction: t });
    });

    const io = req.app.get("io");
    io.to(`foodcourt_${booking.table_id}`).emit("bookingUpdate", {
      type: "NEW_BOOKING",
      booking,
    });

    res.status(201).json(booking);
  } catch (err) {
    if (err.message === "BOOKED") {
      return res.status(409).json({ error: "Time slot already booked" });
    }
    console.error("Booking error:", err);
    res.status(500).json({ error: "Failed to book table" });
  }
});


router.get("/currently-active/:foodcourtId", authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const bookings = await Booking.findAll({
      include: [
        {
          model: Table,
          as: "table",
          where: { foodcourt_id: req.params.foodcourtId },
          required: true, 
        },
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone"],
        },
      ],
      where: {
        status: { [Op.in]: ["booked", "checked_in"] },
        start_time: { [Op.lte]: now },
        end_time: { [Op.gte]: now },
      },
      order: [["start_time", "ASC"]],
    });

    res.json(bookings);
  } catch (err) {
    console.error("Currently active bookings error:", err);
    res.status(500).json({ error: "Failed to fetch active bookings" });
  }
});

router.get("/today/:foodcourtId", authMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.findAll({
      include: [
        { 
          model: Table, 
          as: "table", 
          where: { foodcourt_id: req.params.foodcourtId },
          include: [{ model: FoodCourt, as: "foodcourt" }]
        },
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone"]
        }
      ],
      where: { 
        start_time: { [Op.between]: [start, end] } 
      },
      order: [["start_time", "ASC"]],
    });
    
    res.json(bookings);
  } catch (err) {
    console.error("Today's bookings error:", err);
    res.status(500).json({ error: "Failed to fetch today's bookings" });
  }
});

router.post("/release/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "released";
    await booking.save();

    const io = req.app.get("io");
    io.to(`foodcourt_${booking.table_id}`).emit("bookingUpdate", {
      type: "RELEASED",
      bookingId: booking.id,
    });

    res.json({ message: "Booking released successfully", booking });
  } catch (err) {
    console.error("Release booking error:", err);
    res.status(500).json({ error: "Failed to release booking" });
  }
});

router.post("/checkin/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "checked_in";
    await booking.save();

    const io = req.app.get("io");
    io.to(`foodcourt_${booking.table_id}`).emit("bookingUpdate", {
      type: "CHECKED_IN",
      bookingId: booking.id,
    });

    res.json({ message: "Checked in successfully", booking });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ error: "Failed to check-in" });
  }
});

router.post("/:id/checkin", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "checked_in") {
      return res.json({ message: "Already checked in", booking });
    }

    booking.status = "checked_in";
    await booking.save();

    res.json({ message: "Checked in successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check in" });
  }
});


router.post("/cleanup/no-show", async (req, res) => {
  try {
    const now = new Date();

    const [count] = await Booking.update(
      { status: "no_show" },
      {
        where: {
          status: "booked",
          end_time: { [Op.lt]: now },
        },
      }
    );

    res.json({ message: "No-shows updated", updatedCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update no-shows" });
  }
});

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const activeBookings = await Booking.count({ 
      where: { status: { [Op.in]: ["booked", "checked_in"] } } 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReservations = await Booking.count({
      where: { 
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow },
        status: { [Op.in]: ["booked", "checked_in"] }
      },
    });

    res.json({ activeBookings, todayReservations });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/my/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Table,
          as: "table",
          include: [
            {
              model: FoodCourt,
              as: "foodcourt",
            },
          ],
        },
        {
          model: User,
          as: "customer", 
          attributes: ["id", "name", "email"], 
        },
      ],
      order: [["start_time", "DESC"]],
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/next", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const nowUTC = new Date(now.toISOString());

  
    const nextBooking = await Booking.findOne({
      where: {
        user_id: req.user.id,
        status: { [Op.in]: ["booked", "checked_in"] },
        start_time: { [Op.gt]: nowUTC },  
      },
      include: [
        {
          model: Table,
          as: "table",
          include: [{ model: FoodCourt, as: "foodcourt" }],
        },
      ],
      order: [["start_time", "ASC"]],
    });

    if (nextBooking) {
      return res.json({ type: "upcoming", booking: nextBooking });
    }

    res.status(404).json({ message: "No upcoming bookings" });
  } catch (err) {
    console.error("Next booking logic error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:id/qr", authMiddleware, generateBookingQR);

router.post("/verify-qr", authMiddleware, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: "QR data is required" });
    }

    const payload = JSON.parse(qrData);
    const decoded = jwt.verify(payload.checkinToken, process.env.JWT_SECRET);

    const booking = await Booking.findByPk(payload.bookingId, {
      include: [Table],
    });
    
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (new Date(booking.end_time) < new Date()) {
      return res.status(400).json({ error: "Booking expired" });
    }

    booking.status = "checked_in";
    await booking.save();

    const io = req.app.get("io");
    io.to(`foodcourt_${booking.table_id}`).emit("bookingUpdate", {
      type: "CHECKED_IN",
      bookingId: booking.id,
    });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("QR Verify error:", err);
    res.status(400).json({ error: "Invalid QR code" });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  if (req.user.usertype !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
        { 
          model: Table, 
          as: "table", 
          include: [{ model: FoodCourt, as: "foodcourt" }] 
        },
      ],
      order: [["start_time", "DESC"]],
    });
    
    res.json(bookings);
  } catch (err) {
    console.error("All bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (req.user.usertype !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not allowed to cancel this booking" });
    }

    if (["checked_in", "released"].includes(booking.status)) {
      return res.status(400).json({ error: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    const io = req.app.get("io");
    io.to(`foodcourt_${booking.table_id}`).emit("bookingUpdate", {
      type: "CANCELLED",
      bookingId: booking.id,
    });

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

router.get("/inactive/:foodcourtId", authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const bookings = await Booking.findAll({
      include: [
        {
          model: Table,
          as: "table",
          where: { foodcourt_id: req.params.foodcourtId },
          include: [{ model: FoodCourt, as: "foodcourt" }],
        },
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone"],
        },
      ],
      where: {
        [Op.or]: [
          { status: { [Op.in]: ["cancelled", "released"] } },
          { end_time: { [Op.lt]: now } },
        ],
      },
      order: [["end_time", "DESC"]],
    });

    res.json(bookings);
  } catch (err) {
    console.error("Inactive bookings error:", err);
    res.status(500).json({ error: "Failed to fetch inactive bookings" });
  }
});


router.put("/force-release/:id", authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Table, as: "table" }],
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

  
    if (!["booked", "checked_in"].includes(booking.status)) {
      return res
        .status(400)
        .json({ error: "Only active bookings can be force released" });
    }

   
    booking.status = "released";
    booking.end_time = new Date(); 
    await booking.save();

    
    if (booking.table) {
      booking.table.is_available = true;
      await booking.table.save();
    }

    res.json({ message: "Booking force released successfully", booking });
  } catch (err) {
    console.error("Force release error:", err);
    res.status(500).json({ error: "Server error during force release" });
  }
});

router.get("/all/:foodcourtId", authMiddleware, async (req, res) => {
  try {
    const { foodcourtId } = req.params;
    if (!foodcourtId || foodcourtId === 'undefined') {
        return res.status(400).json({ error: "Food court ID is required." });
    }

    const bookings = await Booking.findAll({
      include: [
        {
          model: Table,
          as: "table", 
          where: { foodcourt_id: foodcourtId },
          required: true, 
          attributes: ["id", "number"],
        },
        {
          model: User,
          as: "customer", 
          attributes: ["id", "name", "phone", "email"],
        },
      ],
      order: [["start_time", "DESC"]], 
    });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings for foodcourt:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;