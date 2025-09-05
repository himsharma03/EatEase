import React, { useState, useEffect } from "react";
import Navbar from "./NavBar";
import RegisterStepsSection from "./RegisterStepsSection";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [tripVisible, setTripVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const tripSection = document.getElementById("trip-section");
      const adminSection = document.getElementById("admin-section");

      if (tripSection) {
        const rect = tripSection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 150) {
          setTripVisible(true);
        }
      }

      if (adminSection) {
        const rect = adminSection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 150) {
          setAdminVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert("Please enter a location or mall name.");
      return;
    }
    navigate("/login", { state: { searchQuery } });
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      <Navbar />

     
      <main className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 py-16 bg-gray-50">
        
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Reserve Tables in Seconds with EatEase
          </h1>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 max-w-md"
          >
            <input
              type="text"
              placeholder="Search Food Court Location"
              aria-label="Search for a food court location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-black"
            />

            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 w-full transition"
            >
              Find Food Courts
            </button>
          </form>
        </div>

       
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://www.gaurcitycenternoida.co.in/images/Food-Court.jpeg"
            alt="Food Court"
            className="rounded-lg shadow-lg w-full max-w-md"
          />
        </div>
      </main>

     
      <RegisterStepsSection tripVisible={tripVisible} adminVisible={adminVisible} />

      
      <footer className="bg-black text-white px-8 py-6 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} EatEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
