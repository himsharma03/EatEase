import React from "react";
import { useNavigate } from "react-router-dom";

function RegisterStepsSection() {
  const navigate = useNavigate();

  return (
    <section id="register-steps" className="bg-white py-20 px-8">
      <div className="max-w-6xl mx-auto">
         
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Elevate Your Dining Experience with EatEase
          </h2>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
           
          <div className="hidden md:block absolute top-10 bottom-10 left-1/2 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>

           
          <div className="pr-6">
            <div className="flex items-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold">
                Reserve Your Table in Minutes
              </h3>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">1</span>
                <span className="text-lg">Sign up with your details</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">2</span>
                <span className="text-lg">Browse nearby food courts</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">3</span>
                <span className="text-lg">Choose seats, date & time</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">4</span>
                <span className="text-lg">Confirm and get QR code</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">5</span>
                <span className="text-lg">Enjoy seamless dining</span>
              </li>
            </ul>
            <button
              onClick={() => navigate("/customer-signup")}
              className="mt-10 border-2 border-black text-black font-semibold py-3 px-8 hover:bg-black hover:text-white transition-all duration-300"
            >
              Start Booking Now
            </button>
          </div>

          
          <div className="pl-6">
            <div className="flex items-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold">
                Manage Your Food Court
              </h3>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">1</span>
                <span className="text-lg">Create your admin account</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">2</span>
                <span className="text-lg">Add food court details</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">3</span>
                <span className="text-lg">Manage tables & availability</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">4</span>
                <span className="text-lg">Track customer bookings</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-black text-white rounded-full text-center text-sm leading-6 mr-4 flex-shrink-0 mt-1">5</span>
                <span className="text-lg">Improve dining experience</span>
              </li>
            </ul>
            <button
              onClick={() => navigate("/admin-signup")}
              className="mt-10 border-2 border-black text-black font-semibold py-3 px-8 hover:bg-black hover:text-white transition-all duration-300"
            >
              Register Your Business
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterStepsSection;
