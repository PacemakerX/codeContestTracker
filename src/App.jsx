import "./App.css";
import Navbar from "./components/Navbar"; // Capital 'N'
import Home from "./components/Home"; // Capital 'H'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <Home />

      {/* Footer */}
      <footer className="bg-gray-800 py-6 text-center text-gray-400">
        &copy; 2025 Contest Tracker. All Rights Reserved.
      </footer>
    </div>
  );
}

export default App;
