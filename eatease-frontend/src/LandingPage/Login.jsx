import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone || !password) {
      setMessage("Please enter both fields.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const { user, token, foodcourt } = data;

        if (user.usertype === "admin") {
          sessionStorage.setItem("adminToken", token);
          sessionStorage.setItem("adminUser", JSON.stringify(user));
          if (foodcourt) sessionStorage.setItem("foodcourt", JSON.stringify(foodcourt));
          navigate("/admin-home");
        } else {
          sessionStorage.setItem("customerToken", token);
          sessionStorage.setItem("customerUser", JSON.stringify(user));
          sessionStorage.removeItem("foodcourt");
          navigate("/customer-home");
        }
      } else {
        setMessage(data.error || "Login failed. Check credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col z-50">
      <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md">
        <span className="text-xl font-bold">EatEase</span>
        <button
          type="button"
          className="text-gray-300 hover:text-white text-sm font-semibold"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </nav>

      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>

          {message && (
            <p
              className={`text-center mb-4 ${
                message.includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email or phone"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your password"
            />
            <button
              type="submit"
              disabled={isLoading || !emailOrPhone || !password}
              className={`w-full text-white py-2 rounded-md transition-colors ${
                isLoading || !emailOrPhone || !password
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-600">Don’t have an account?</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/customer-signup" className="text-black font-medium hover:underline">
              Customer Sign Up
            </Link>
            <Link to="/admin-signup" className="text-black font-medium hover:underline">
              Admin Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
