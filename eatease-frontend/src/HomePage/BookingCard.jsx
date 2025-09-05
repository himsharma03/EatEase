import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BookingCard = ({ booking, tab, API_BASE, token, setBookings }) => {
  const navigate = useNavigate();
  const bookingStart = new Date(booking.start_time);
  const bookingEnd = new Date(booking.end_time);

  const cancelBooking = async () => {
    const confirm = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <p>Are you sure you want to cancel this booking?</p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                No
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${booking.id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "cancelled" } : b
        )
      );

      toast.success(data.message || "Booking cancelled successfully");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="w-full lg:w-2/3 mx-auto p-5 border rounded-lg shadow-md bg-white mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg">
          Table {booking.table?.number || "N/A"}
        </p>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            booking.status === "booked"
              ? "bg-green-600 text-white"
              : booking.status === "checked_in"
              ? "bg-blue-600 text-white"
              : booking.status === "cancelled"
              ? "bg-gray-500 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {booking.status}
        </span>
      </div>

      <p className="text-gray-700">
        <strong>Date:</strong>{" "}
        {bookingStart.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-gray-700">
        <strong>Time:</strong> {bookingStart.toLocaleTimeString()} →{" "}
        {bookingEnd.toLocaleTimeString()}
      </p>
      <p className="text-gray-700">
        <strong>Guests:</strong> {booking.guest_count}
      </p>
      <p className="text-gray-700">
        <strong>Foodcourt:</strong> {booking.table.foodcourt?.name || "N/A"}
      </p>

      {tab === "current" && booking.status === "booked" && (
        <button
          onClick={() => navigate(`/booking-pass/${booking.id}`)}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
        >
          View QR
        </button>
      )}

      {booking.status === "booked" && (
        <button
          onClick={cancelBooking}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cancel Booking
        </button>
      )}

      {booking.status === "no_show" && (
        <p className="mt-3 text-red-600 font-semibold">No Show </p>
      )}
      {booking.status === "checked_in" && (
        <p className="mt-3 text-blue-600 font-semibold">Checked In </p>
      )}
    </div>
  );
};

export default BookingCard;
