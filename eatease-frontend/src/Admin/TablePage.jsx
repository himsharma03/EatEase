import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Users,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";

function TablePage({ foodcourtId }) {
   const id = foodcourtId;
  const [tables, setTables] = useState([]);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [foodcourtName, setFoodcourtName] = useState("");
  const [activeBookings, setActiveBookings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const API_BASE =import.meta.env.VITE_API_URL|| "http://localhost:5000";

  const token = sessionStorage.getItem("adminToken");

  useEffect(() => {
    fetchFoodcourtDetails();
    fetchTables();
    fetchActiveBookings();
  }, [id, token]);

  const fetchFoodcourtDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/foodcourts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoodcourtName(res.data.name);
    } catch (err) {
      console.error("Failed to fetch foodcourt details:", err);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(res.data);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    }
  };

 const fetchActiveBookings = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/bookings/currently-active/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveBookings(res.data);
    } catch {
      setActiveBookings([]);
    }
  };


  const addTable = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE}/api/tables`,
        { foodcourt_id: id, number, capacity: Number(capacity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTables([...tables, res.data]);
      setNumber("");
      setCapacity("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add table:", err);
    }
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;
    try {
      await axios.delete(`${API_BASE}/api/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(tables.filter((t) => t.id !== tableId));
    } catch (err) {
      console.error("Failed to delete table:", err);
    }
  };


  const startEditing = (table) => {
    setEditingTable(table.id);
    setEditNumber(table.number);
    setEditCapacity(table.capacity);
  };

  const cancelEditing = () => {
    setEditingTable(null);
    setEditNumber("");
    setEditCapacity("");
  };

  const saveTable = async (tableId) => {
    try {
      const res = await axios.put(
        `${API_BASE}/${tableId}`,
        { number: editNumber, capacity: Number(editCapacity) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTables(tables.map((t) => (t.id === tableId ? res.data : t)));
      cancelEditing();
    } catch (err) {
      console.error("Failed to update table:", err);
    }
  };

  const groupedTables = tables.reduce((groups, table) => {
    const group = table.number?.charAt(0) || "#";
    if (!groups[group]) groups[group] = [];
    groups[group].push(table);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
  
        <h1 className="text-2xl font-bold mb-6">{foodcourtName} - Tables</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  
          <div className="lg:col-span-2">
            <div className="bg-white w-[250px] lg:w-full rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Tables</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-black text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-800 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Table
                </button>
              </div>

      
              {showAddForm && (
                <form
                  onSubmit={addTable}
                  className="mb-6 bg-gray-50 p-4 rounded-lg border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="e.g. A1"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-2 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {Object.keys(groupedTables).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedTables).map(([group, groupTables]) => (
                    <div key={group} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">
                        Section {group}
                      </h3>
                      <div className="space-y-3">
                        {groupTables.map((table) => {
                          const isOccupied = activeBookings.some(
                            (b) => b.table_id === table.id
                          );

                          return (
                            <div
                              key={table.id}
                              className={`p-3 rounded-md border flex justify-between items-center ${
                                isOccupied
                                  ? "bg-yellow-200 border-yellow-400"
                                  : "bg-green-200 border-green-400"
                              }`}
                            >
                              {editingTable === table.id ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editNumber}
                                      onChange={(e) =>
                                        setEditNumber(e.target.value)
                                      }
                                      className="p-1 border rounded w-16"
                                    />
                                    <input
                                      type="number"
                                      value={editCapacity}
                                      onChange={(e) =>
                                        setEditCapacity(Number(e.target.value))
                                      }
                                      className="p-1 border rounded w-16"
                                    />
                                  </div>
                      
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded w-fit ${
                                      isOccupied
                                        ? "bg-yellow-600 text-white"
                                        : "bg-green-600 text-white"
                                    }`}
                                  >
                                    {isOccupied ? "Occupied" : "Available"}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="font-medium">
                                    {table.number}
                                  </span>
                                  <div className="flex items-center text-sm text-gray-700">
                                    <Users className="h-3 w-3 mr-1" />{" "}
                                    {table.capacity}p
                                  </div>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${
                                      isOccupied
                                        ? "bg-yellow-600 text-white"
                                        : "bg-green-600 text-white"
                                    }`}
                                  >
                                    {isOccupied ? "Occupied" : "Available"}
                                  </span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                {editingTable === table.id ? (
                                  <>
                                    <button
                                      onClick={() => saveTable(table.id)}
                                      className="text-green-600"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="text-gray-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditing(table)}
                                      className="text-blue-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteTable(table.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No tables yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TablePage;
