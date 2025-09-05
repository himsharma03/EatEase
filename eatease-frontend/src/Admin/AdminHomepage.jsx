import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  LogOut,
  Calendar,
  Users,
  Home,
  Edit,
  Store,
  QrCode,
} from "lucide-react";

export default function AdminHomepage() {
  const [foodcourts, setFoodcourts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFc, setNewFc] = useState({ name: "", location: "", city: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ activeBookings: 0, todayReservations: 0 });
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL|| "http://localhost:5000";
  const token = sessionStorage.getItem("adminToken");
  const adminName = sessionStorage.getItem("adminName") || "Admin";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFoodcourts();
    fetchStats();
  }, []);
  const fetchFoodcourts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/api/foodcourts/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoodcourts(res.data);
    } catch (err) {
      console.error("Error fetching foodcourts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const addFoodcourt = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/foodcourts`, newFc, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddForm(false);
      setNewFc({ name: "", location: "", city: "" });
      fetchFoodcourts();
    } catch (err) {
      console.error("Failed to add foodcourt:", err);
    }
  };

  const handleLogout = () => {
    // 👉 clear session keys
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminName");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="bg-black text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">EatEase Admin</h1>
        <div className="hidden md:flex items-center space-x-1">
          <a href="/admin/home" className="flex items-center p-3 hover:bg-gray-800 rounded-md">
            <Home className="h-4 w-4 mr-2" />
            Home
          </a>

          <Link to="/admin/qr-scanner" className="flex items-center p-3 hover:bg-gray-800 rounded-md">
            <QrCode className="h-4 w-4 mr-2" />
            QR Scanner
          </Link>

          <Link to="/manage-foodcourt" className="flex items-center p-3 hover:bg-gray-800 rounded-md">
            <Edit className="h-4 w-4 mr-2" />
            Manage Your Foodcourt
          </Link>
        </div>

        <button
          className="bg-white text-black px-4 py-2 rounded-md flex items-center hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </button>
      </nav>

      <div className="flex flex-1">

        <div className="flex-1 p-6 max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl md:text-7xl font-bold mb-2">
              Welcome {adminName}
            </h1>
            <p className="text-gray-600 text-2xl pt-2">
              Manage your food courts and bookings
            </p>
          </div>

          <div className="w-1/2 rounded-lg p-6 mb-8 text-black">
            <Store className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">Your Foodcourts : {foodcourts.length}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow border p-6 flex items-center">
              <Users className="h-8 w-8 mr-4 text-black" />
              <div>
                <h3 className="text-2xl font-bold">{stats.activeBookings}</h3>
                <p className="text-gray-600">All Bookings</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border p-6 flex items-center">
              <Calendar className="h-8 w-8 mr-4 text-black" />
              <div>
                <h3 className="text-2xl font-bold">{stats.todayReservations}</h3>
                <p className="text-gray-600">Today's Reservations</p>
              </div>
            </div>
          </div>

          <div id="foodcourts" className="bg-black rounded-lg shadow-sm p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Your Food Courts</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
              >
                {showAddForm ? "Cancel" : "Add Foodcourt"}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={addFoodcourt} className="bg-gray-900 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Foodcourt Name</label>
                    <input
                      type="text"
                      placeholder="Enter Foodcourt Name"
                      value={newFc.name}
                      onChange={(e) => setNewFc({ ...newFc, name: e.target.value })}
                      className="p-3 rounded-md w-full bg-white text-black border border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Area</label>
                    <input
                      type="text"
                      placeholder="Enter Area"
                      value={newFc.location}
                      onChange={(e) => setNewFc({ ...newFc, location: e.target.value })}
                      className="p-3 rounded-md w-full bg-white text-black border border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Enter City"
                      value={newFc.city}
                      onChange={(e) => setNewFc({ ...newFc, city: e.target.value })}
                      className="p-3 rounded-md w-full bg-white text-black border border-gray-300"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-white text-black px-6 py-2 rounded-md border hover:bg-gray-100"
                >
                  Save
                </button>
              </form>
            )}

            {isLoading ? (
              <p>Loading...</p>
            ) : foodcourts.length === 0 ? (
              <p>No food courts yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foodcourts.map((fc) => (
                  <div
                    key={fc.id}
                    className="bg-gray-900 rounded-lg p-5 hover:bg-gray-800 cursor-pointer"
                    onClick={() => (window.location.href = `/admin/foodcourt/${fc.id}`)}
                  >
                    <h4 className="text-lg font-bold">{fc.name}</h4>
                    <p className="flex items-center mt-1 text-gray-300">
                      <MapPin className="h-4 w-4 mr-1" /> {fc.location}, {fc.city}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-black text-white px-8 py-6 mt-auto">
        <div className="flex justify-between items-center">
          <p>&copy; 2025 EatEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
