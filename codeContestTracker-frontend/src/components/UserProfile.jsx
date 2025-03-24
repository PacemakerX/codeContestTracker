import React, { useEffect, useState } from "react";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from API using fetch
  const fetchUserData = async () => {
    try {
      const res = await fetch("http://localhost:3030/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load user data.");
      }

      const data = await res.json();
      console.log(data);
      setUser(data.user);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-900 to-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-lg text-center mt-10">{error}</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
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
        <button
          onClick={fetchUserData}
          className="mt-12 px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:scale-105 hover:shadow-2xl transform transition duration-300 rounded-full"
        >
          🔄 Refresh Profile
        </button>
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

export default UserProfile;
