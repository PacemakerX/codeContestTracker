// Import React and routing dependencies
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import components
import ContestList from "./components/ContestList";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import UserProfile from "./components/UserProfile";
import About from "./components/About";
import Contact from "./components/Contact";
import ForgotPassword from "./components/ForgotPassword";

// Import context providers
import { NotificationProvider } from "./components/ToastNotification";

/**
 * App Component
 * Main component that handles routing and layout structure
 * Wrapped with NotificationProvider for toast notifications
 */
function App() {
  return (
    <NotificationProvider>
      <Router>
        {/* Main layout container with gradient background */}
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
          {/* Navigation bar */}
          <Navbar />

          {/* Hero section */}
          <section className="mb-3 text-center px-4 py-5">
            <h1 className="text-4xl font-bold text-white mb-4">
              CodeContest Tracker
            </h1>
            <p className="text-xl text-gray-300">
              Stay updated with the latest coding competitions
            </p>
          </section>

          {/* Main content area with routes */}
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<ContestList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;