import React, { useState } from "react";

function AddFoodcourt() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleAddFoodcourt = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("adminToken"); 

    if (!token) {
      setIsSuccess(false);
      setMessage("Authentication token is missing. Please login again.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}api/foodcourts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location, city }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsSuccess(false);
        setMessage(data.error || "Failed to add foodcourt");
        return;
      }

      setIsSuccess(true);
      setMessage("Foodcourt added successfully!");
      setName("");
      setLocation("");
      setCity("");
    } catch (err) {
      console.error("Error adding foodcourt:", err);
      setIsSuccess(false);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Foodcourt</h2>

      {message && (
        <p
          className={`mb-4 p-2 rounded ${
            isSuccess
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleAddFoodcourt} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foodcourt Name
          </label>
          <input
            type="text"
            placeholder="Enter foodcourt name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:border-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <input
            type="text"
            placeholder="Enter area / locality"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:border-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:border-black"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition"
        >
          Add Foodcourt
        </button>
      </form>
    </div>
  );
}

export default AddFoodcourt;
