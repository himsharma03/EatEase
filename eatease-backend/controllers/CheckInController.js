import jwt from "jsonwebtoken";
import { Booking } from "../models/index.js";

export const processCheckin = async (req, res) => {
  const { bookingId, checkinToken } = req.body;

  if (!bookingId || !checkinToken) {
    return res.status(400).json({ error: "Missing booking ID or token." });
  }

  try {
    const decoded = jwt.verify(checkinToken, process.env.JWT_SECRET);
    if (decoded.bookingId !== bookingId) {
      return res.status(401).json({ error: "Token-Booking mismatch. Invalid QR Code." });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }
    

    if (booking.status === 'checked-in') {
      return res.status(409).json({ error: "This booking has already been checked in." });
    }

    booking.status = 'checked-in';
    await booking.save();

    res.status(200).json({ message: `Booking for Table ${booking.table_id} confirmed!` });

  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid or expired QR Code." });
    }
    console.error("Check-in error:", err);
    res.status(500).json({ error: "Server error during check-in." });
  }
};
