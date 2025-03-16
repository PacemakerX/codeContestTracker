import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContestList from "./components/contestList"; // Adjust path if needed
import Navbar from "./components/Navbar"; // Adjust path if needed
import Footer from "./components/Footer"; // Adjust path if needed

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Navbar />
        <section className="mb-3 text-center  px-4 py-5">
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
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
