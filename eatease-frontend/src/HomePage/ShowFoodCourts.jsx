import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ShowFoodCourts() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFoodCourts = async (query) => {
    setLoading(true);
    try {
      let url = "";
      if (query.lat && query.lng) {
        url = `/api/foodcourts/search?mall=${query.lat},${query.lng}`;
      } else if (query.location) {
        url = `/api/foodcourts/search?mall=${query.location}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      navigate("/search-results", {
        state: { mallName: data.foundMall, foodcourts: data.foodcourts },
      });
    } catch (err) {
      console.error("Error fetching food courts:", err);
      showToast("No food courts found. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!location) return;
    fetchFoodCourts({ location });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        fetchFoodCourts({ lat: latitude, lng: longitude });
      });
    } else {
      showToast("Geolocation not supported by your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white transition ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Choose Your Location</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleUseCurrentLocation}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Use Current Location
        </button>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter Location"
            className="p-3 border rounded-lg w-64"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <p>Loading food courts...</p>}
    </div>
  );
}

export default ShowFoodCourts;
