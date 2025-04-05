import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const About = () => {
  const [user, setUser] = useState(null);
  const isAuthenticated = useSelector((state) => !!state.auth.token);

  useEffect(() => {
    // Simulating fetching user data (replace with actual API if needed)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

return (
  <div className="min-h-screen flex flex-col items-center text-white px-4 py-8 md:px-6">
    <div className="text-base md:text-xl space-y-6 md:space-y-8 bg-gray-800/40 p-6 md:p-12 rounded-xl md:rounded-3xl shadow-2xl border border-gray-700 w-full max-w-4xl animated-fadeIn" style={{ animation: "fadeIn 1s ease-out" }}>
      {/* Dynamic Welcome Statement */}
      <h1 className="text-3xl md:text-6xl font-extrabold mb-6 md:mb-12 tracking-wide text-blue-500 text-center md:text-left">
        Welcome, {isAuthenticated && user ? user.username : "Coding God"}! 🤖
      </h1>
      {/* About Section Content */}
      <p className="leading-relaxed text-gray-300 text-sm md:text-base">
        🚀{" "}
        <span className="text-blue-400 font-semibold">
          CodeContest Tracker
        </span>{" "}
        is your go-to platform to stay updated with the latest programming
        competitions. Whether you're aiming to level up your coding skills,
        stay on top of contest schedules, or prepare for your next big
        challenge, we've got you covered.
      </p>
      <p className="leading-relaxed text-gray-300 text-sm md:text-base">
        🧠 Designed for passionate coders and competitive programmers, our
        platform fetches contest data from{" "}
        <span className="text-green-400 font-semibold">Codeforces</span>,
        <span className="text-orange-400 font-semibold"> CodeChef</span>, and{" "}
        <span className="text-yellow-400 font-semibold">LeetCode</span>. You
        can set reminders, bookmark contests, and even track YouTube solution
        videos!
      </p>
      <p className="leading-relaxed text-gray-300 text-sm md:text-base">
        🎯 Whether you're a seasoned coder or a beginner aiming to sharpen
        your problem-solving skills, our tracker keeps you informed and
        motivated. Ready to become a{" "}
        <span className="text-purple-400 font-semibold">Contest Legend</span>?
        Let the coding battles begin! 💥
      </p>
      {/* Funny / Pun Section */}
      <div className="mt-6 md:mt-8">
        <p className="text-base md:text-lg text-blue-400 font-semibold italic">
          💡 Fun Fact: Debugging is like being the detective in a crime movie
          where *you* are also the murderer. 🕵️‍♂️
        </p>
        <p className="text-base md:text-lg text-green-400 font-semibold italic mt-3 md:mt-4">
          🔥 Remember: There's no place like 127.0.0.1 when you need comfort.
          😅
        </p>
      </div>
      {/* Call-to-Action */}
      <button
        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg mt-6 md:mt-8 w-full transition duration-200 text-sm md:text-base"
        onClick={() => alert("Happy Coding, Legend!")}
      >
        Ready to Rule the Coding World? 🌐
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
}
export default About;
