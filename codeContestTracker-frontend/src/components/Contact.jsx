import React, { useState } from "react";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import { useNotification } from "../components/ToastNotification";

const BASE_URL = "https://apicodecontesttrackerbackend.onrender.com";
// const BASE_URL = "http://localhost:3030";


const ContactComponent = () => {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({
    submitting: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, message } = formData;

    if (!name.trim()) {
      addNotification("Name is required", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addNotification("Invalid email address", "error");

      return false;
    }

    if (!message.trim()) {
      addNotification("Message is required", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    // Set submitting state
    setStatus({ submitting: true });

    try {
      const response = await fetch(`${BASE_URL}/api/users/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        addNotification("Your message has been sent successfully!", "success");

        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        addNotification(
          result.message || "Something went wrong. Please try again.",
          "error"
        );
      }
    } catch (error) {
      addNotification(
        `Network error: ${error.message}. Please try again.`,
        "error"
      );
    } finally {
      setStatus({ submitting: false });
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center px-4 py-12 aninmated-fadeIn"
      style={{ animation: "fadeIn 1s ease-out" }}
    >
      <div className="shadow-xl rounded-xl p-8 w-full max-w-md ">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Contact Me</h2>
          <p className="text-gray-400">
            Have a question or want to collaborate?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="text-gray-500" size={20} />
            </div>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="text-gray-500" size={20} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <MessageSquare className="text-gray-500" size={20} />
            </div>
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status.submitting}
            className="w-full flex justify-center items-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300 disabled:opacity-50"
          >
            {status.submitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="mr-2" size={20} /> Send Message
              </>
            )}
          </button>
        </form>

        {/* Direct Contact Info */}
        <div className="mt-6 text-center text-gray-400">
          <p>Or reach me directly at:</p>
          <a
            href="mailto:sparsh.officialwork@gmail.com"
            className="text-blue-400 hover:underline"
          >
            sparsh.officialwork@gmail.com
          </a>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ContactComponent;
