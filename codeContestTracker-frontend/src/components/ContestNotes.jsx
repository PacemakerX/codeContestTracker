// Import required dependencies
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./ToastNotification";
// Import animation libraries (framer-motion)
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

// API base URL
const BASE_URL = "https://apicodecontesttrackerbackend.onrender.com";
// const BASE_URL = "http://localhost:3030";

/**
 * ContestNotesModal Component
 * Displays a modal for managing contest-specific notes
 * @param {string} contestId - The ID of the contest
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close the modal
 */
const ContestNotesModal = ({ contestId, isOpen, onClose }) => {
  // State management
  const [noteContent, setNoteContent] = useState(""); // Stores the note content
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const [noteCreatedAt, setNoteCreatedAt] = useState(
    new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    })
  ); // Stores note creation time in IST

  const { addNotification } = useNotification();
  const navigate = useNavigate();

  /**
   * Fetches existing note when modal opens
   * Triggered when contestId or isOpen changes
   */
  useEffect(() => {
    const fetchExistingNote = async () => {
      if (isOpen) {
        try {
          // Get authentication token
          const token = localStorage.getItem("token");

          // API call to fetch existing note
          const response = await fetch(
            `${BASE_URL}/api/users/note/${contestId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Handle token expiry or unauthorized access
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            addNotification("Session expired. Please login again.", "error");
            navigate("/login");
            return;
          }

          if (response.ok) {
            const data = await response.json();
            setNoteContent(data.note || ""); // Set note content or empty string
            setNoteCreatedAt(data.createdAt); // Set note creation time
          } else {
            console.error("Failed to fetch note:", response.statusText);
          }
        } catch (error) {
          console.error("Failed to fetch note:", error);
        }
      }
    };

    fetchExistingNote();
  }, [contestId, isOpen, addNotification, navigate]);
  /**
   * Handles saving the note content to the server
   * Makes a POST request to the API endpoint with contest ID and note content
   * Updates loading state and handles success/error cases
   */
  const handleSaveNote = async () => {
    // Set loading state while saving
    setIsLoading(true);

    try {
      // Retrieve authentication token from localStorage
      const token = localStorage.getItem("token");

      // Make API request to save note
      const response = await fetch(`${BASE_URL}/api/users/note`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Request payload
        body: JSON.stringify({
          contestId,
          note: noteContent,
        }),
      });

      // Handle token expiry or unauthorized access
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        addNotification("Session expired. Please login again.", "error");
        navigate("/login");
        return;
      }
      // Handle successful response
      if (response.ok) {
        onClose(); // Close the modal
      } else {
        // Handle error response
        const errorData = await response.json();
        console.error("Save failed:", errorData);
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Save note error:", error);
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{
              y: 50,
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 50,
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              type: "tween",
              duration: 0.25,
              ease: "easeInOut",
            }}
            className="relative w-full max-w-2xl h-[85vh] mx-4 bg-gray-800/90 rounded-2xl 
            shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-900/50 p-6 border-b border-gray-700">
              <h2 className="text-2xl font-semibold text-white">
                Contest Notes
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Add your personal notes for this contest
              </p>
            </div>

            {/* Textarea */}
            <div className="p-6 flex-grow">
              <textarea
                placeholder="Write your notes here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full h-full p-4 text-white bg-gray-700/50 
                rounded-xl border border-gray-600 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 
                transition duration-200 resize-y overflow-auto"
                style={{ minHeight: "200px" }}
              />
            </div>

            {/* Footer Buttons */}
            <div className="bg-gray-900/50 p-6 flex items-center justify-between border-t border-gray-700">
              {noteContent && (
                <div className="text-md text-gray-400">
                  <p className="truncate">
                    Last saved:{" "}
                    {new Date(noteCreatedAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={isLoading}
                  className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
                    isLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white 
              bg-gray-700/50 hover:bg-gray-600/50 rounded-full p-2 transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContestNotesModal;
