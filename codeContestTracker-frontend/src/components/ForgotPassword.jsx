import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = "https://apicodecontesttrackerbackend.onrender.com";

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/users/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setError("");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      localStorage.setItem("tempToken", data.emailVerificationToken);
      if (response.ok) {
        setStep("reset");
        setError("");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tempToken")}`,
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("tempToken");
        navigate("/login");
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <form
            onSubmit={handleSendOTP}
            className="space-y-4 animated-fadeIn"
            style={{ animation: "fadeIn 1s ease-out" }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition duration-300"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        );

      case "otp":
        return (
          <form
            onSubmit={handleVerifyOTP}
            className="space-y-4 animated-fadeIn"
            style={{ animation: "fadeIn 1s ease-out" }}
          >
            <p className="text-gray-400 text-center mb-4">
              We've sent a 6-digit OTP to{" "}
              <span className="text-blue-400">{email}</span>. Please enter it
              below.
            </p>

            {/* Refactored OTP Input */}
            <div className="flex justify-center space-x-2">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`} // Add unique ID to each input
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp[index] || ""}
                  onChange={(e) => {
                    // Validate only numbers
                    const value = e.target.value.replace(/[^0-9]/g, "");

                    const newOtp = otp.split("");
                    newOtp[index] = value;
                    setOtp(newOtp.join(""));

                    // Move focus to the next input if filled
                    if (value && index < 5) {
                      document.getElementById(`otp-${index + 1}`).focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Move focus to the previous input on backspace
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index - 1}`).focus();
                    }
                  }}
                  className="w-12 h-12 text-center bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition duration-300"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => handleSendOTP()}
                disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold p-3 rounded-md transition duration-300"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-blue-400 hover:text-blue-300 text-sm mt-2"
              >
                Change Email
              </button>
            </div>
          </form>
        );

      case "reset":
        return (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4 animated-fadeIn"
            style={{ animation: "fadeIn 1s ease-out" }}
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition duration-300"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Forgot Password
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {renderStep()}

        <p
          className="text-gray-400 text-sm text-center mt-4 animated-fadeIn"
          style={{ animation: "fadeIn 1s ease-out" }}
        >
          Remember your password?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>

      {/* Custom fade-in animation */}
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

export default ForgotPassword;
