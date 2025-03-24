import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Profile = () => {

  const isAuthenticated = useSelector((state) => !!state.auth.token);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect if no user is found
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  });

  if (!user) {
    return null; // Prevent rendering if not authenticated
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="w-full max-w-4xl p-14 text-center opacity-0 animate-fadeIn"
        style={{ animation: "fadeIn 1s ease-out forwards" }}
      >
        <h1 className="text-6xl font-extrabold mb-12 tracking-wide text-blue-500">
          Welcome, {user?.username}!
        </h1>
        <div className="text-xl space-y-8 bg-gray-800/40 p-12 rounded-3xl shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xl">👤 Username:</span>
            <span className="font-medium text-2xl">{user?.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xl">📧 Email:</span>
            <span className="font-medium text-2xl">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xl">📞 Phone:</span>
            <span className="font-medium text-2xl">{`+91 ${user?.phoneNumber}`}</span>
          </div>
        </div>
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

export default Profile;
