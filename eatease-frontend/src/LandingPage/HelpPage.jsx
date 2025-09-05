import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Go to the signup page, fill in your name, email, phone, and password. Once created, you can log in anytime.",
  },
  {
    question: "How do I book a food court?",
    answer:
      "After logging in, click 'Find Food Courts', choose your preferred mall/restaurant, select time & seats, and confirm your booking.",
  },
  {
    question: "Where can I see my bookings?",
    answer:
      "All your active, past, and upcoming bookings are shown on the 'My Bookings' page in the navigation bar.",
  },
  {
    question: "How does QR check-in work?",
    answer:
      "A QR code will be available on the Check-in page shortly before your booking time. Show this at the counter for quick entry.",
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer:
      "Yes. Go to 'My Bookings', select the booking, and choose cancel or reschedule (if available).",
  },
  {
    question: "What if my QR code does not appear?",
    answer:
      "Please refresh the page. If it still doesn’t appear, contact support through the help page.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can email us at support@eatease.com or call +91-98765-43210. We’re happy to help!",
  },
];

function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
    
      <nav className="bg-black text-white flex justify-between items-center px-8 py-4 w-full shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">EatEase</span>
        </div>
        <button
          type="button"
          className="text-gray-300 hover:text-white text-sm font-semibold"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </nav>

  
      <div className="flex-1 overflow-y-auto py-10 px-6">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Help & Support</h1>
          <p className="text-gray-600 text-center mb-8">
            Find answers to common questions or contact support if you’re stuck.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-xl shadow-sm bg-gray-50">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center font-medium text-gray-800"
                >
                  {faq.question}
                  <span className="ml-2">{openIndex === index ? "−" : "+"}</span>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;