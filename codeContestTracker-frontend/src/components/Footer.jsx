import { Link } from "react-router-dom";
function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold">CodeContest Tracker</h3>
            <p className="text-gray-400 mt-1">
              Stay updated with coding competitions
            </p>
          </div>

          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link
              to="/contact"
              className="hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} CodeContest Tracker. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
