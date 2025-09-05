import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let storedUser = null;

    try {
      if (path.startsWith("/admin")) {
        storedUser = sessionStorage.getItem("adminUser");
      } else {
        storedUser = sessionStorage.getItem("customerUser");
      }

      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserName(userObj?.name || "Guest");
      } else {
        setUserName("Guest");
      }
    } catch (err) {
      console.error("Error reading user from sessionStorage:", err);
      setUserName("Guest");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    const path = location.pathname;

    if (path.startsWith("/admin")) {
      sessionStorage.removeItem("adminUser");
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("foodcourt");
      window.location.href = "/admin-login";
    } else {
      sessionStorage.removeItem("customerUser");
      sessionStorage.removeItem("customerToken");
      window.location.href = "/login";
    }
  };

  return (
    <nav className="bg-black text-white flex justify-between items-center px-8 py-4">
     
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">EatEase</span>
        </div>
        <Link to="/bookings" className="hover:text-gray-300">Bookings</Link>
        <Link to="/checkin" className="hover:text-gray-300">QR Check-in</Link>
      </div>


      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <FaUserCircle size={28} />
          <span>{userName}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
