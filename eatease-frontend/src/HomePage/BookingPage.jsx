// src/pages/BookingPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Calendar, CheckCircle, UtensilsCrossed } from "lucide-react";
import { toast , Toaster } from "react-hot-toast";

function BookingPage() {
  const { foodcourtId } = useParams();
  const navigate = useNavigate();
   const API_BASE =import.meta.env.VITE_API_URL|| "http://localhost:5000";
  const [step, setStep] = useState(1);
  const [guestCount, setGuestCount] = useState(2);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  

  const token = sessionStorage.getItem("customerToken");


  const checkAvailability = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select both start and end time");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);


    if (start < new Date()) {
      toast.error("You cannot book for past times.");
      return;
    }


    if (start >= end) {
      toast.error("Start time must be earlier than end time.");
      return;
    }

    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours > 2) {
       toast.error("Booking duration cannot exceed 2 hours.");
      return;
    }

    const startHour = start.getHours();
    const endHour = end.getHours();
    if (
      startHour < 8 ||
      endHour >  22||
      (endHour ===  22 && end.getMinutes() > 0)
    ) {
       toast.error("Bookings are allowed only between 8:00 AM and 9:00 PM.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/api/bookings/available`,
        {
          foodcourt_id: foodcourtId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          guest_count: guestCount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableTables(res.data);
      setStep(3);
    } catch (err) {
      console.error("Availability error:", err);
      toast.error(err.response?.data?.error || "Error fetching availability.");
    }
  };


  const bookTable = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/bookings`,
        {
          table_id: selectedTable,
          start_time: startTime,
          end_time: endTime,
          guest_count: guestCount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStep(4);
      setTimeout(() => {
        navigate("/customer-home");
      }, 1500);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.error || "Failed to book table");
    }
  };

  const steps = [
    { id: 1, name: "Guests", icon: <Users className="w-5 h-5" /> },
    { id: 2, name: "Date & Time", icon: <Calendar className="w-5 h-5" /> },
    { id: 3, name: "Select Table", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 4, name: "Confirm", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col z-50">
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
    
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
       <Toaster position="top-right" /> 
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        {steps.map((s, i) => (
          <div key={s.id} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition
              ${step > s.id ? "bg-green-500 border-green-500 text-white" : ""}
              ${step === s.id ? "bg-black border-black text-white" : ""}
              ${step < s.id ? "bg-gray-200 border-gray-300 text-gray-600" : ""}`}
            >
              {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.icon}
            </div>
            <span className="text-xs mt-2 font-medium">{s.name}</span>

            {i < steps.length - 1 && (
              <div
                className={`absolute top-5 left-full w-full h-0.5 -ml-5 ${step > s.id ? "bg-green-500" : "bg-gray-300"
                  }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 p-6">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-[30px] font-bold mb-6 text-center">
              How many guests?
            </h2>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="px-6 py-2 bg-gray-200 rounded-full text-lg"
              >
                -
              </button>
              <span className="text-3xl font-bold">{guestCount}</span>
              <button
                onClick={() => setGuestCount(guestCount + 1)}
                className="px-6 py-2 bg-gray-200 rounded-full text-lg"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-8 w-48 bg-black text-white py-3 rounded-lg text-center"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[30px] font-bold mb-4 text-center">
              Pick Date & Time
            </h2>
            <label className="block mb-4">
              Start Time
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="p-3 border rounded w-full mt-1"
              />
            </label>
            <label className="block mb-4">
              End Time
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="p-3 border rounded w-full mt-1"
              />
            </label>
            <button
              onClick={checkAvailability}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Check Availability
            </button>
          </div>
        )}


        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Your Table</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableTables.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${selectedTable === t.id
                      ? "bg-black text-white border-black"
                      : "bg-white hover:border-gray-400"
                    }`}
                >
                  <h3 className="font-semibold">Table {t.number}</h3>
                  <p className="text-sm">Capacity: {t.capacity}</p>
                </div>
              ))}
            </div>
            <button
              disabled={!selectedTable}
              onClick={bookTable}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              Confirm Booking
            </button>
          </div>
        )}


        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">Redirecting to homepage...</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default BookingPage;
