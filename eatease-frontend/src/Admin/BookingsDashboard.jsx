import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookingsDashboard({ foodcourtId }) {
  const [bookings, setBookings] = useState({ active: [], inactive: [], all: [] });
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchBookings();
  }, [foodcourtId]);

  const fetchBookings = async () => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [activeRes, inactiveRes, allRes] = await Promise.all([
        axios.get(`${API_BASE}/api/bookings/currently-active/${foodcourtId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/bookings/inactive/${foodcourtId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/bookings/all/${foodcourtId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBookings({
        active: activeRes.data,
        inactive: inactiveRes.data,
        all: allRes.data,
      });
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceRelease = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to force release this table? This will end the booking immediately."
      )
    ) {
      return;
    }

    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    try {
       await axios.put(`${API_BASE}/api/bookings/force-release/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchBookings();
    } catch (err) {
      console.error("Error force releasing booking:", err);
      setError(err.response?.data?.error || "Failed to release the booking.");
    }
  };

  const renderTable = (data) => (
    <table className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg">
      <thead className="bg-gray-800">
        <tr>
          <th className="p-2 text-left">Customer</th>
          <th className="p-2 text-left">Table</th>
          <th className="p-2 text-left">Party Size</th>
          <th className="p-2 text-left">Time Slot</th>
          <th className="p-2 text-left">Status</th>
          {tab === "active" && <th className="p-2 text-left">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((b, index) => (
            <tr
              key={b.id || b._id || index}
              className="border-t border-gray-700 hover:bg-gray-800"
            >
              <td className="p-2">{b.customer?.name || "N/A"}</td>
              <td className="p-2">{b.table?.number || "N/A"}</td>
              <td className="p-2">{b.party_size || "-"}</td>
              <td className="p-2">
                {b.start_time && b.end_time
                  ? `${new Date(b.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${new Date(b.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "N/A"}
              </td>
              <td className="p-2 capitalize">{b.status}</td>
              {tab === "active" && (
                <td className="p-2">
                  <button
                    onClick={() => handleForceRelease(b.id || b._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Force Release
                  </button>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={tab === "active" ? 6 : 5}
              className="p-4 text-center text-gray-400"
            >
              No bookings found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Bookings</h2>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <div className="flex gap-4 mb-4">
        {["active", "inactive", "all"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg transition ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading bookings...</p>
      ) : (
        <>
          {tab === "active" && renderTable(bookings.active)}
          {tab === "inactive" && renderTable(bookings.inactive)}
          {tab === "all" && renderTable(bookings.all)}
        </>
      )}
    </div>
  );
}