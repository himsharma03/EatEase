import React, { useState, useCallback } from "react";
import QrScanner from "react-qr-barcode-scanner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ScanLine, RotateCcw } from "lucide-react";

function QRScannerPage() {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = process.env.VITE_API_URL || "http://localhost:5000";


  const handleCheckin = useCallback(async (payload) => {

    if (!payload || !payload.bookingId || !payload.checkinToken) {
      setError("Invalid QR Code. Please scan a valid EatEase booking QR.");
      setIsLoading(false);
      return;
    }
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      setError("Admin authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
   
      const res = await axios.post(
        `${API_BASE}/api/bookings/checkin`,
        {
          bookingId: payload.bookingId,
          checkinToken: payload.checkinToken,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(res.data.message || "Booking successfully checked in!");
    } catch (err) {
      setError(err.response?.data?.error || "Check-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  const handleScan = (err, result) => {
    if (result && result.text && !isLoading && !success) {
      try {

        const parsedData = JSON.parse(result.text);
        setScannedData(parsedData);
        handleCheckin(parsedData);
      } catch (e) {
        setError("Invalid QR code format.");
        setScannedData({ text: result.text }); 
      }
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setError("");
    setSuccess("");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="bg-black text-white flex justify-between items-center px-4 sm:px-8 py-4 w-full shadow-md">
        <h1 className="text-xl font-bold">EatEase Admin</h1>
        <button
          type="button"
          className="text-gray-300 hover:text-white text-sm font-semibold"
          onClick={() => navigate("/admin/home")}
        >
          ← Back to Home
        </button>
      </nav>

      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-4">Scan to Check-in</h1>

          <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gray-200 rounded-lg overflow-hidden relative border-4 border-gray-300">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full bg-green-50">
                <CheckCircle className="w-24 h-24 text-green-500" />
              </div>
            ) : (
              <QrScanner
                delay={300}
                onUpdate={handleScan}
                constraints={{ video: { facingMode: "environment" } }}
              />
            )}
          </div>

          <div className="mt-6 min-h-[6rem] w-full flex flex-col justify-center items-center">
            {isLoading && (
              <div className="flex items-center text-blue-600">
                <ScanLine className="animate-ping w-6 h-6 mr-2" />
                <p className="font-semibold">Verifying booking...</p>
              </div>
            )}
            {success && (
              <div className="text-green-600 font-bold flex flex-col items-center">
                <CheckCircle className="w-8 h-8 mb-2" />
                <p>{success}</p>
              </div>
            )}
            {error && (
              <div className="text-red-500 font-bold flex flex-col items-center">
                <XCircle className="w-8 h-8 mb-2" />
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !success && !error && (
              <p className="text-gray-500">Point the camera at a booking QR code.</p>
            )}
          </div>

          <button
            onClick={resetScanner}
            className="mt-4 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-transform duration-200 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Reset Scanner
          </button>
        </div>
      </main>
    </div>
  );
}

export default QRScannerPage;
