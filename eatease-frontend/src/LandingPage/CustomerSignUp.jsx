import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerSignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!name || !email || !phone || !password) {
      setMessage("Please fill out all fields.");
      setIsLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setMessage(" Phone number must be 10 digits.");
      setIsLoading(false);
      return;
    }

    const userData = { name, email, phone, password, usertype: "customer" };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);

        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.error || "An error occurred during signup.");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setMessage("Server error. Please try again later.");
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

      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="bg-white p-8 w-full max-w-md shadow rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Sign up to book, view, or manage your food court visits.
          </h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-md bg-[#eeeeee] hover:bg-[#dddddd]"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-[#eeeeee] hover:bg-[#dddddd]"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-md bg-[#eeeeee] hover:bg-[#dddddd]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-[#eeeeee] hover:bg-[#dddddd]"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-[#eeeeee] hover:bg-[#dddddd]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white py-3 rounded-md mt-4 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
              }`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {message && (
            <div
              className={`text-center mt-4 font-medium ${
                message.startsWith("") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center mt-6 text-gray-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-400 font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSignUp;
