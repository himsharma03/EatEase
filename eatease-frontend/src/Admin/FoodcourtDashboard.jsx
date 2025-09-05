import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import TablePage from "./TablePage";
import BookingsDashboard from "./BookingsDashboard";
import CustomersPage from "./CustomerPage";

function FoodcourtDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tables");
  const [foodcourtName, setFoodcourtName] = useState("");
   const API_BASE =import.meta.env.VITE_API_URL|| "http://localhost:5000";

  const token = sessionStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFoodcourtDetails = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/foodcourts/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFoodcourtName(res.data.name);
      } catch (err) {
        console.error("Failed to fetch foodcourt details:", err);
      }
    };

    fetchFoodcourtDetails();
  }, [id, token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="bg-black text-white w-full p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-1 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">
          {foodcourtName || `Foodcourt #${id}`}
        </h1>
      </div>

      <div className="p-6 w-full max-w-5xl flex flex-col items-center">
        <div className="flex space-x-4 mb-6">
          {[
            { key: "tables", label: "Manage Tables" },
            { key: "bookings", label: "Manage Bookings" },
            { key: "customers", label: "Manage Customers" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded cursor-pointer transition ${
                activeTab === tab.key
                  ? "bg-black text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl">
            {activeTab === "tables" && <TablePage foodcourtId={id} />}
            {activeTab === "bookings" && <BookingsDashboard foodcourtId={id} />}
            {activeTab === "customers" && <CustomersPage foodcourtId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodcourtDashboard;
