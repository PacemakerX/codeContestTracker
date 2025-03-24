import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContestList from "./components/ContestList"; // Adjust path if needed
import Navbar from "./components/Navbar"; // Adjust path if needed
import Footer from "./components/Footer"; // Adjust path if needed
import Login from "./components/Login";
import Signup from "./components/SignUp";
import UserProfile from "./components/UserProfile";
import About from "./components/About";
import { NotificationProvider } from "./components/ToastNotification"; // Import the provider

function App() {
  return (
    <NotificationProvider> {/* Wrap everything with NotificationProvider */}
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
          <Navbar />
          <section className="mb-3 text-center px-4 py-5">
            <h1 className="text-4xl font-bold text-white mb-4">
              CodeContest Tracker
            </h1>
            <p className="text-xl text-gray-300">
              Stay updated with the latest coding competitions
            </p>
          </section>
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<ContestList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<UserProfile/>} />
              <Route path="/about" element={<About/>} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;