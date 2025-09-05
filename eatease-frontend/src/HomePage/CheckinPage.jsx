import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {toast ,  Toaster} from "react-hot-toast";

function CheckinPage() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [booking, setBooking] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchBooking = async () => {
    const token = sessionStorage.getItem("customerToken");
    if (!token) {
      setError("You must be logged in to check in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/bookings/my/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      const now = new Date();
      const activeBooking = data.find((b) => {
        if (b.status !== "booked") return false;
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        const diffMinutes = (start - now) / 1000 / 60;
        return diffMinutes <= 10 && end >= now;
      });

      if (!activeBooking) {
        setError("No active bookings available for check-in yet.");
        setLoading(false);
        return;
      }

      setBooking(activeBooking);
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError("Failed to fetch booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQR = async (bookingId) => {
    try {
      const token = sessionStorage.getItem("customerToken");
      const res = await axios.get(`${API_BASE}/api/bookings/${bookingId}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQr(res.data.qr);
    } catch (err) {
      console.error("Error fetching QR:", err);
      toast.error("QR code not available yet");
    }
  };

  useEffect(() => {
    fetchBooking();
  }, []);

  useEffect(() => {
    if (booking) {
      fetchQR(booking.id);
    }
  }, [booking]);

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col z-50 overflow-y-auto">
       <Toaster position="top-right" />
      <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md">
        <span className="text-xl font-bold">EatEase</span>
        <button
          onClick={() => navigate("/customer-home")}
          className="text-gray-300 hover:text-white text-sm font-semibold"
        >
          ← Back to Home
        </button>
      </nav>

      <div className="p-6 flex flex-col items-center min-h-screen bg-gray-50">
        <h1 className="text-[40px] text-center font-bold mb-8">Check-in</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {booking && (
          <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">
              Table {booking.table?.number || "N/A"}
            </h2>
            <p className="mb-2">
              <strong>Time:</strong>{" "}
              {new Date(booking.start_time).toLocaleString()} –{" "}
              {new Date(booking.end_time).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>Guests:</strong> {booking.guest_count}
            </p>
            <p>
              <strong>Foodcourt:</strong> {booking.table?.foodcourt?.name || "N/A"}
            </p>


            {qr ? (
              <img
                src={qr}
                alt="Booking QR"
                className="w-64 h-64 object-contain border rounded-lg shadow-md mx-auto"
              />
            ) : (
              <p className="text-gray-500">QR code not available yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckinPage;
