import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function FoodcourtList() {
  const [foodcourts, setFoodcourts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";


  const fetchFoodcourts = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const { data } = await axios.get(`${API_BASE}/api/foodcourts/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoodcourts(data);
    } catch (err) {
      console.error("Error fetching foodcourts", err);
      toast.error("Could not fetch foodcourts.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchFoodcourts();
  }, [fetchFoodcourts]);


  const startEdit = (fc) => {
    setEditingId(fc._id || fc.id);
    setForm({ name: fc.name, location: fc.location, city: fc.city });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", location: "", city: "" });
  };

  const saveEdit = async (id) => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(`${API_BASE}/api/foodcourts/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Foodcourt updated successfully!");
      cancelEdit();
      fetchFoodcourts(); 
    } catch (err) {
      console.error("Error updating foodcourt", err);
      toast.error("Failed to update foodcourt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFoodcourt = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>Are you sure you want to delete this foodcourt?</span>
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-3 py-1 rounded font-semibold"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded font-semibold"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = sessionStorage.getItem("adminToken");
                  await axios.delete(`${API_BASE}/api/foodcourts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  toast.success("Foodcourt deleted successfully!");
                  fetchFoodcourts(); 
                } catch (err) {
                  console.error("Error deleting foodcourt", err);
                  toast.error("Failed to delete foodcourt");
                }
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (foodcourts.length === 0)
      return <p className="text-center text-gray-500 mt-8">No foodcourts available.</p>;

    return foodcourts.map((fc) => {
      const fcId = fc._id || fc.id;
      return (
        <div
          key={fcId}
          className="p-4 border rounded-lg shadow-sm mb-3 bg-white hover:shadow-md transition-shadow"
        >
          {editingId === fcId ? (
            <div className="space-y-4 bg-gray-900 p-4 rounded-lg text-white">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 outline-none"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 outline-none"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => saveEdit(fcId)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white w-full"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{fc.name}</h3>
                <p className="text-gray-600">
                  {fc.location}, {fc.city}
                </p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => startEdit(fc)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteFoodcourt(fcId)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md sticky top-0 z-10">
          <span className="text-xl font-bold">EatEase Admin</span>
          <button
            type="button"
            className="text-gray-300 hover:text-white text-sm font-semibold"
            onClick={() => navigate("/admin-home")}
          >
            ← Back to Home
          </button>
        </nav>

       
        <main className="p-6 container mx-auto max-w-4xl flex-grow">
          <h2 className="text-4xl font-bold mb-6">Manage Your Foodcourts</h2>
          <div className="space-y-4">{renderContent()}</div>
        </main>
      </div>
    </>
  );
}

export default FoodcourtList;
