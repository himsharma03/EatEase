import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomersPage({ foodcourtId }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
   const API_BASE =import.meta.env.VITE_API_URL|| "http://localhost:5000";

  useEffect(() => {
    fetchCustomers();
  }, [foodcourtId]);

  const fetchCustomers = async () => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");


      const res = await axios.get(
        `${API_BASE}/api/bookings/all/${foodcourtId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const unique = {};
      res.data.forEach((b) => {
        const c = b.customer || b.user;
        if (c?.phone || c?.email) {
          const key = c.phone || c.email; 
          unique[key] = {
            id: key,
            name: c.name || "Unknown",
            phone: c.phone || "N/A",
            email: c.email || "N/A",
          };
        }
      });

      setCustomers(Object.values(unique));
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to fetch customers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Customers</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="text-gray-400">No customers yet</p>
      ) : (
        <table className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
