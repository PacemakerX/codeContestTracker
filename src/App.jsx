import React from "react";

import ContestList from "./components/contestList"; // Adjust path if needed
import Navbar from "./components/Navbar"; // Adjust path if needed
import Footer from "./components/Footer"; // Adjust path if needed

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            CodeContest Tracker
          </h1>
          <p className="text-xl text-gray-300">
            Stay updated with the latest coding competitions
          </p>
        </section>

        <ContestList />
      </main>

      <Footer />
    </div>
  );
}

export default App;
