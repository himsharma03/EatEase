import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./LandingPage/Home";
import CustomerHomepage from "./HomePage/CustomerHomepage";
import AdminHomepage from "./Admin/AdminHomepage";
import Login from "./LandingPage/Login";
import CustomerSignUp from "./LandingPage/CustomerSignUp";
import AdminSignUp from "./LandingPage/AdminSignUp";
import ShowFoodCourts from "./HomePage/ShowFoodCourts";
import AddFoodcourt from "./Admin/AddFoodCourt";
import BookingPage from "./HomePage/BookingPage.jsx";
import SearchResults from "./HomePage/SearchResults.jsx";
import MyBookingsPage from "./HomePage/MyBookingsPage.jsx";
import Checkin from "./HomePage/CheckinPage.jsx";
import HelpPage from "./LandingPage/HelpPage.jsx";
import QRScannerPage from "./Admin/QRScannerPage";
import FoodcourtList from "./Admin/FoodcourtList.jsx";
import BookingPassPage from "./HomePage/BookingPassPage.jsx";
import BookingsDashboard from "./Admin/BookingsDashboard";
import TablePage from "./Admin/TablePage";
import FoodcourtDashboard from "./Admin/FoodcourtDashboard";



function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-inter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customer-home" element={<CustomerHomepage />} />

           
          <Route path="/admin/foodcourt/:id" element={<FoodcourtDashboard />} />

         
          <Route path="/admin/add-foodcourt" element={<AddFoodcourt />} />
          <Route path="/manage-foodcourt" element={<FoodcourtList />} />
          <Route path="/admin-home" element={<AdminHomepage />} />
          <Route path="/admin/qr-scanner" element={<QRScannerPage />} />

        <Route path="/bookings/:foodcourtId" element={<BookingsDashboard />} />

          
          <Route path="/foodcourts" element={<ShowFoodCourts />} />
          <Route path="/foodcourt/:id" element={<TablePage />} />
          <Route path="/booking/:foodcourtId" element={<BookingPage />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route
  path="/bookings"
  element={<MyBookingsPage token={sessionStorage.getItem("customerToken")} />}
/>


          <Route path="/booking-pass/:id" element={<BookingPassPage />} />
          <Route path="/checkin" element={<Checkin />} />

           
          <Route path="/login" element={<Login />} />
          <Route path="/signup/customer" element={<CustomerSignUp />} />
          <Route path="/signup/admin" element={<AdminSignUp />} />
          <Route path="/customer-signup" element={<CustomerSignUp />} />
          <Route path="/admin-signup" element={<AdminSignUp />} />

          <Route path="/help" element={<HelpPage />} />

          
          <Route
            path="*"
            element={<h1 className="text-center text-4xl mt-20">404 Not Found</h1>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
