import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import { Booking } from "../models/index.js";

const generateBookingQR = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const now = new Date();

 
    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
 
    console.log("Now:", now);
    console.log("Booking start:", start);
    console.log("Booking end:", end);
 
    if (now > end) {
      return res.status(403).json({ error: "Booking already ended. QR unavailable." });
    }
 
    const qrAvailableTime = new Date(start);
    qrAvailableTime.setMinutes(qrAvailableTime.getMinutes() - 10);

    if (now < qrAvailableTime) {
      return res.status(403).json({
        error: "QR not available yet. Please try 10 minutes before start time.",
      });
    }

    const payload = {
      bookingId: booking.id,
      userId: booking.user_id,
      checkinToken: jwt.sign(
        { bookingId: booking.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      ),
    };

    const qr = await QRCode.toDataURL(JSON.stringify(payload));

    res.json({ qr });
  } catch (err) {
    console.error("QR Generation error:", err);
    res.status(500).json({ error: "Failed to generate QR" });
  }
};

export default generateBookingQR;
