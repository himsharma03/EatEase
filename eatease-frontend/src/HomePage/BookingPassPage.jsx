import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function BookingPassPage() {
   const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const { id } = useParams();
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const token = sessionStorage.getItem("customerToken");
        const res = await axios.get(`${API_BASE}/api/bookings/${id}/qr`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQr(res.data.qr);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load QR");
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [id]);

  if (loading) return <p className="text-center mt-8">Loading QR...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Your Booking QR</h1>
      {qr ? (
        <img src={qr} alt="Booking QR" className="border p-2 rounded-lg shadow-lg" />
      ) : (
        <p>No QR available</p>
      )}
    </div>
  );
}

export default BookingPassPage;
