// Core React and Routing Imports
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 

// Component Imports
// Authentication related components
import Login from "./components/Login";
import Signup from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import UserProfile from "./components/UserProfile";

// Core layout components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ContestList from "./components/ContestList";

// Information pages
import About from "./components/About";
import Contact from "./components/Contact";

// Context Providers
import { NotificationProvider } from "./components/ToastNotification";

/**
 * App Component
 * -------------
 * Root component of the application that sets up:
 * 1. Routing configuration
 * 2. Global layout structure
 * 3. Toast notifications system
 * 
 * Layout Structure:
 * - NotificationProvider (Toast notifications)
 *   - Router (Hash-based routing)
 *     - Navbar (Top navigation)
 *     - Hero Section
 *     - Main Content (Routes)
 *     - Footer
 */
function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Hero Section - Application Title and Description */}
          <section className="mb-3 text-center px-4 py-5">
            <h1 className="text-4xl font-bold text-white mb-4">
              CodeContest Tracker
            </h1>
            <p className="text-xl text-gray-300">
              Stay updated with the latest coding competitions
            </p>
          </section>

          {/* Main Content Area - Route Configuration 
              Contains all application routes and their corresponding components */}
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Main Features */}
              <Route path="/" element={<ContestList />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<UserProfile />} />
              
              {/* Information Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>

          {/* Application Footer */}
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
