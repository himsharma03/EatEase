import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Store, MapPin, X } from "lucide-react";

export default function SearchResults() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const handleBackHome = () => {
    const token = sessionStorage.getItem("customerToken");
    if (token) {
      navigate("/customer-home");
    } else {

        navigate("/");
    }
  };

  if (!state || !state.foodcourts) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col z-50">
        <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md">
          <span className="text-xl font-bold">EatEase</span>
          <button
            type="button"
            className="text-gray-300 hover:text-white text-sm font-semibold"
            onClick={handleBackHome} 
          >
            ← Back to Home
          </button>
        </nav>
        <p className="text-center mt-20 text-gray-600">
          No results found. Please try again.
        </p>
      </div>
    );
  }

  const { foodcourts } = state;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col z-50">
      <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md">
        <span className="text-xl font-bold">EatEase</span>
        <button
          type="button"
          className="text-gray-300 hover:text-white text-sm font-semibold"
          onClick={handleBackHome} // Apply the fix here
        >
          ← Back to Home
        </button>
      </nav>

      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white transition ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6">Choose the foodcourt</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodcourts.map((fc) => (
            <div
              key={fc.id}
              className="border rounded-lg p-5 bg-white shadow hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start mb-3">
                <div className="bg-gray-100 p-3 rounded-lg mr-3">
                  <Store className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{fc.name}</h3>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> {fc.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  showToast(`Booking for ${fc.name} selected`, "success");
                  navigate(`/booking/${fc.id}`);
                }}
                className="bg-black text-white px-4 py-2 rounded-md w-full hover:bg-gray-800 transition"
              >
                Book Table
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}