import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [showSignUpDropdown, setShowSignUpDropdown] = useState(false);

  return (
    <nav className="bg-black text-white flex justify-between items-center px-8 py-4 shadow-md">
      
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold cursor-pointer">
          <Link to="/">EatEase</Link>
        </span>
      </div>

       
      <div className="flex items-center gap-6 relative">
        <Link to="/help" className="hover:text-gray-300 transition-colors">
          Help
        </Link>

        <Link to="/login" className="hover:text-gray-300 transition-colors">
          Log in
        </Link>

         
        <div className="relative">
          <button
            onClick={() => setShowSignUpDropdown(!showSignUpDropdown)}
            className="bg-white text-black px-4 py-2 rounded-md transition-colors"
          >
            Sign up
          </button>

          {showSignUpDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link
                to="/customer-signup"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowSignUpDropdown(false)}
              >
                Customer
              </Link>
              <Link
                to="/admin-signup"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowSignUpDropdown(false)}
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
