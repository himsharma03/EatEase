import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingCard from "./BookingCard";
import { Toaster, toast } from "react-hot-toast";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("current");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = sessionStorage.getItem("customerToken");

  useEffect(() => {
    if (!token) {
      toast.error("You must be logged in to view bookings.");
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        await fetch(`${API_BASE}/api/bookings/cleanup/no-show`, { method: "POST" });
        const res = await fetch(`${API_BASE}/api/bookings/my/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        toast.error("Failed to fetch bookings. Try again later.");
      }
    };

    fetchBookings();
  }, [token, navigate]);

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    if (tab === "current") return start <= now && end >= now && b.status === "booked";
    if (tab === "upcoming") return start > now && b.status === "booked";
    if (tab === "past") return end < now || b.status === "cancelled";
    return false;
  });

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50 overflow-y-auto">
      <Toaster position="top-right" />
      <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md">
        <span className="text-xl font-bold">EatEase</span>
        <button
          type="button"
          className="text-gray-300 hover:text-white text-sm font-semibold"
          onClick={() => navigate("/customer-home")}
        >
          ← Back to Home
        </button>
      </nav>

      <div className="flex justify-center gap-3 my-6">
        {["current", "upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === t ? "bg-black text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">
          {tab.charAt(0).toUpperCase() + tab.slice(1)} Bookings
        </h1>

        {filtered.length > 0 ? (
          filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              tab={tab}
              API_BASE={API_BASE}
              token={token}
              setBookings={setBookings}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center text-lg">
            No {tab} bookings found.
          </p>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;
