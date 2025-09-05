import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, QrCode, Calendar, Users } from "lucide-react";
import Eatease from "./Eatease.png";
import { toast , Toaster} from "react-hot-toast";

function CustomerHomepage() {
  const [userName, setUserName] = useState(null);
  const [nextBooking, setNextBooking] = useState(null);
  const [location, setLocation] = useState("");
  const [foodCourts, setFoodCourts] = useState([]);
  const [searchNoResults, setSearchNoResults] = useState(false);
  const [loading, setLoading] = useState(true); 

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const getToken = () => sessionStorage.getItem("customerToken");

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name || data.username || data.fullName);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false); 
      }
    }

    async function fetchNextBooking() {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/bookings/next`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const booking = data.booking || data;

          setNextBooking({
            id: booking.id,
            date: booking.start_time
              ? new Date(booking.start_time).toLocaleString()
              : "N/A",
            foodCourt: booking.table?.foodcourt?.name || "Unknown",
            table: booking.table?.number || "N/A",
            seats: booking.guest_count || "N/A",
            type: data.type || "upcoming",
          });
        } else {
          setNextBooking(null);
        }
      } catch (error) {
        console.error("Error fetching next booking:", error);
        setNextBooking(null);
      }
    }

    fetchUser();
    fetchNextBooking();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-black border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchNoResults(false);

   if (!location.trim()) {
  toast.error("Please enter mall name");
  return;
}

    try {
      const [mallName, cityName] = location.split(",").map((s) => s.trim());
      const url = `${API_BASE}/api/foodcourts/search?mall=${encodeURIComponent(
        mallName
      )}&city=${encodeURIComponent(cityName || "")}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        if (data.foodcourts.length > 0) {
          navigate("/search-results", {
            state: { mallName, foodcourts: data.foodcourts },
          });
        } else {
          setFoodCourts([]);
          setSearchNoResults(true);
        }
      } else {
        setFoodCourts([]);
        setSearchNoResults(true);
      }
    } catch (err) {
      console.error("Error fetching foodcourts:", err);
      setFoodCourts([]);
      setSearchNoResults(true);
    }
  };

  const handleBookTable = (foodCourtId) => {
    navigate(`/booking/${foodCourtId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userName={userName} />
       <Toaster position="top-right" />
      <main className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 py-16 bg-gray-50">
        <div className="md:w-2/3 mb-12 md:mb-0">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome {userName}
          </h1>

          <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-md">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter Food court name"
              className="p-4 rounded-md border border-gray-300"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 w-full"
            >
              Find Food Courts
            </button>
          </form>

          {searchNoResults && (
            <p className="mt-4 text-red-500 font-semibold">
              No food courts found for your search.
            </p>
          )}

          {foodCourts.length > 0 && (
            <div className="mt-6 bg-white shadow-md rounded-lg p-4 border">
              <h3 className="font-bold mb-3">Available Food Courts:</h3>
              <ul className="space-y-2">
                {foodCourts.map((fc, i) => (
                  <li
                    key={i}
                    className="border p-3 rounded-md flex justify-between items-center"
                  >
                    <span>{fc.name}</span>
                    <button
                      onClick={() => handleBookTable(fc.id)}
                      className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                    >
                      Book
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nextBooking ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-black p-6 rounded-lg shadow-md border border-gray-200 max-w-md"
            >
              <h3 className="font-semibold text-white text-lg mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-white" />
                Your Next Booking
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <Clock className="w-4 h-4 mr-2 text-white" />
                  <span>{nextBooking.date}</span>
                </div>
                <div className="flex items-center text-white">
                  <MapPin className="w-4 h-4 mr-2 text-white" />
                  <span>{nextBooking.foodCourt}</span>
                </div>
                <div className="flex items-center text-white">
                  <span className="w-4 h-4 mr-2 text-white font-bold">#</span>
                  <span>Table {nextBooking.table}</span>
                </div>
                <div className="flex items-center text-white">
                  <Users className="w-4 h-4 mr-2 text-white" />
                  <span>
                    {nextBooking.seats}{" "}
                    {nextBooking.seats === 1 ? "seat" : "seats"}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="mt-8 bg-white p-6 rounded-lg border shadow max-w-md">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Bookings
              </h3>
              <p className="text-gray-700 mb-4">No upcoming bookings.</p>
            </div>
          )}
        </div>

        <div className="md:w-1/3 flex justify-center md:justify-start">
          <img
            src={Eatease}
            alt="EatEase"
            className="w-full h-auto max-h-[500px] object-contain ml-[-40px]"
          />
        </div>
      </main>

      {/* Why EatEase Section */}
      <section className="px-8 py-16 bg-black text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Why EatEase?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            <Clock className="w-10 h-10 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Save Time</h3>
            <p className="text-gray-300 text-sm">
              Reserve in minutes and skip waiting lines at your favorite food courts.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="w-10 h-10 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Nearby Dining</h3>
            <p className="text-gray-300 text-sm">
              Easily browse food courts around your location and get the best seats.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <QrCode className="w-10 h-10 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Seamless Access</h3>
            <p className="text-gray-300 text-sm">
              Get instant QR codes for easy entry and enjoy hassle-free dining.
            </p>
          </div>
        </div>
      </section>

      {/* Reserve Steps Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-16">
            Reserve with EatEase
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {["Browse", "Choose", "Confirm", "Enjoy"].map((step, i) => (
              <div key={i} className="flex flex-col items-center p-6">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full text-xl font-bold mb-4">
                  {i + 1}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step}</h3>
                <p className="text-gray-600">
                  {step === "Browse"
                    ? "Nearby food courts"
                    : step === "Choose"
                    ? "Seats, date & time"
                    : step === "Confirm"
                    ? "And get QR code"
                    : "Seamless dining"}
                </p>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="border-2 border-black text-black font-semibold py-4 px-10 rounded-md hover:bg-black hover:text-white transition-all duration-300 text-lg"
          >
            Start Booking Now
          </motion.button>
        </div>
      </section>

      <footer className="bg-black text-white px-8 py-6 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2025 EatEase. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-400">
              Terms
            </a>
            <a href="#" className="hover:text-gray-400">
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CustomerHomepage;
