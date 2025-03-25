import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useNotification } from "../components/ToastNotification"; // Import notification hook

export default function SignupFlow() {
  const { addNotification } = useNotification();
  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    otp: "",
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, and optional special characters
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return re.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      addNotification("Please enter a valid email address", "error");
      return;
    }

    try {
      // Call OTP send endpoint
      const response = await fetch("http://localhost:3030/api/users/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setStep("otp");
      } else {
        const data = await response.json();
        addNotification(
          data.message || "Failed to send OTP. Please try again.",
          "error"
        );
      }
    } catch (err) {
      addNotification(
        err.message || "Login failed. Please try again.",
        "error"
      );
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3030/api/users/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
          }),
        }
      );

      if (response.ok) {
        setStep("details");
      } else {
        const data = await response.json();
        addNotification(data.message || "OTP verification failed", "error");
      }
    } catch (err) {
      addNotification(err.message || "OTP verification failed", "error");
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (!validatePassword(formData.password)) {
      addNotification(
        "Password must be at least 8 characters long and contain one uppercase, one lowercase letter, and one number",
        "error"
      );
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      addNotification("Passwords do not match", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:3030/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        const data = await response.json();
        addNotification(data.message || "Signup failed", "error");
      }
    } catch (err) {
      addNotification(err.message || "Signup failed", "error");
    }
  };

  const renderEmailStep = () => (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Enter Your Email
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form
          onSubmit={handleEmailSubmit}
          className="space-y-4 animated-fadeIn"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Verify OTP</h2>
        <p className="text-gray-400 mb-4">
          We've sent a 6-digit OTP to{" "}
          <span className="text-blue-400">{formData.email}</span>. Please enter
          it below.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleOTPVerify} className="space-y-4 animated-fadeIn">
          <div className="flex justify-center space-x-2">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                id={`otp-${index}`} // Add unique ID to each input
                type="text"
                maxLength="1"
                inputMode="numeric"
                pattern="[0-9]*"
                name="otp"
                value={formData.otp[index] || ""}
                onChange={(e) => {
                  // Validate only numbers
                  const value = e.target.value.replace(/[^0-9]/g, "");

                  const newOtp = formData.otp.split("");
                  newOtp[index] = value;
                  setFormData({ ...formData, otp: newOtp.join("") });

                  // Move focus to the next input if filled
                  if (value && index < 5) {
                    document.getElementById(`otp-${index + 1}`).focus();
                  }
                }}
                onKeyDown={(e) => {
                  // Move focus to previous input on backspace
                  if (
                    e.key === "Backspace" &&
                    !formData.otp[index] &&
                    index > 0
                  ) {
                    document.getElementById(`otp-${index - 1}`).focus();
                  }
                }}
                className="w-12 h-12 text-center bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-blue-400 hover:text-blue-300"
            >
              Change Email
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition"
            >
              Verify OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Complete Your Profile
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form
          onSubmit={handleFinalSubmit}
          className="space-y-4 animated-fadeIn"
        >
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md"
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              readOnly
              className="w-full p-3 bg-gray-600 text-gray-400 border border-gray-600 rounded-md cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition"
          >
            Sign Up
          </button>
        </form>
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
          .animated-fadeIn {
            animation: fadeIn 1s ease-out;
          }
        `}
      </style>
    </div>
  );

  // Render the appropriate step based on current state
  switch (step) {
    case "email":
      return renderEmailStep();
    case "otp":
      return renderOTPStep();
    case "details":
      return renderDetailsStep();
    default:
      return renderEmailStep();
  }
}
