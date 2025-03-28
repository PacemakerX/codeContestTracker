import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Profile = () => {
  // Redux and Router hooks
  const isAuthenticated = useSelector((state) => !!state.auth.token);
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Authentication check effect
  useEffect(() => {
    if (!isAuthenticated || !localStorage.user) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Early return if no user data is found
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {/* Profile Container with responsive adjustments */}
      <div
        className="w-full max-w-md mx-auto p-6 sm:p-10 text-center opacity-0 animate-fadeIn"
        style={{ animation: "fadeIn 1s ease-out forwards" }}
      >
        {/* Welcome Header with responsive text size */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 tracking-wide text-blue-500">
          Welcome, {user?.username}!
        </h1>

        {/* User Information Card with responsive layout */}
        <div className="text-base sm:text-xl space-y-6 sm:space-y-8 bg-gray-800/40 p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-700">
          {/* Username Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <span className="text-gray-400 text-base sm:text-xl">
              👤 Username:
            </span>
            <span className="font-medium text-lg sm:text-2xl">
              {user?.username}
            </span>
          </div>

          {/* Email Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <span className="text-gray-400 text-base sm:text-xl">
              📧 Email:
            </span>
            <span className="font-medium text-lg sm:text-2xl break-words max-w-full">
              {user?.email}
            </span>
          </div>

          {/* Phone Number Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <span className="text-gray-400 text-base sm:text-xl">
              📞 Phone:
            </span>
            <span className="font-medium text-lg sm:text-2xl">{`+91 ${user?.phoneNumber}`}</span>
          </div>
        </div>
      </div>

      {/* CSS Animation Definition */}
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

export default Profile;
