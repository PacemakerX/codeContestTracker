import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// Import logos and icons
import CodeforcesLogo from "../assets/codeforces.svg";
import LeetcodeLogo from "../assets/leetcode.svg";
import CodechefLogo from "../assets/codechef.png";
import BookmarkIcon from "../assets/bookmark.svg";
// Import components and utilities
import { useNotification } from "../components/ToastNotification";
import ContestNotesModal from "./ContestNotes";

// API base URL
// const BASE_URL = "https://apicodecontesttrackerbackend.onrender.com";
const BASE_URL = "http://localhost:3030";


export default function ContestList() {
  // Redux state
  const { token } = useSelector((state) => state.auth);

  // State management
  const [user, setUser] = useState(null);
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs
  const hasFetchedData = useRef(false);

  // Custom hooks
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContestId, setSelectedContestId] = useState(null);

  // Modal handlers
  const handleAddNote = (contestId) => {
    setSelectedContestId(contestId);
    setIsModalOpen(true);
  };
  // Modal Management
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContestId(null);
  };

  // Local Storage Management Functions
  const updateBookmarksInLocalStorage = (bookmarks) => {
    if (user) {
      const updatedUser = { ...user, bookmarks };
      setUser(updatedUser); // Update state
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  /**
   * Toggles bookmark status for a contest
   * @param {number} contestId - The ID of the contest to bookmark/unbookmark
   */
  const toggleBookmark = async (contestId) => {
    // Return early if user is not authenticated
    if (!token) return;

    const isBookmarked = user?.bookmarks?.includes(contestId);

    try {
      // Make API request to toggle bookmark
      const response = await fetch(`${BASE_URL}/api/bookmarks/${contestId}`, {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle token expiry or unauthorized access
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid → Clear token and redirect to login
        localStorage.removeItem("token");
        addNotification("Session expired. Please login again.", "warning");
        navigate("/login");
        return; // Stop further execution
      }

      if (response.ok) {
        // Update bookmarks locally
        const updatedBookmarks = isBookmarked
          ? user.bookmarks.filter((id) => id !== contestId)
          : [...user.bookmarks, contestId];

        // Show success notification
        const message = isBookmarked
          ? "Bookmark removed successfully!"
          : "Bookmark added successfully!";
        addNotification(message, "info");

        // Update local storage
        updateBookmarksInLocalStorage(updatedBookmarks);
      } else {
        // Handle other errors
        const errorData = await response.json();
        addNotification(
          errorData.message || "Failed to update bookmark.",
          "error"
        );
      }
    } catch (err) {
      // Show error notification for network or unexpected errors
      addNotification(err.message || "Something went wrong.", "error");
    }
  };

  // Check if a contest is bookmarked
  // Helper Functions for Local Storage
  const updateRemindersInLocalStorage = (reminders) => {
    if (user) {
      const updatedUser = { ...user, reminders };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  /**
   * Check if a contest is bookmarked by the current user
   * @param {number} contestId - The ID of the contest to check
   * @returns {boolean} - True if the contest is bookmarked, false otherwise
   */
  const isContestBookmarked = (contestId) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser?.bookmarks?.includes(contestId);
  };

  /**
   * Check if a reminder is set for a specific contest
   * @param {number} contestId - The ID of the contest
   * @param {string} platform - The platform name (e.g., "Codeforces", "Leetcode")
   * @returns {boolean} - True if a reminder exists, false otherwise
   */
  const isReminderSet = (contestId, platform) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser?.reminders?.some(
      (reminder) =>
        reminder.contestId === contestId && reminder.platform === platform
    );
  };

  /**
   * Toggle reminder status for a contest
   * @param {number} contestId - The ID of the contest
   * @param {string} platform - Platform name
   * @param {string} method - Notification method ("email" or "sms")
   * @param {number} timeBefore - Minutes before contest to send reminder
   * @param {string} contestTime - Contest start time in ISO format
   */
  const toggleReminder = async (
    contestId,
    platform,
    method,
    timeBefore,
    contestTime
  ) => {
    if (!token) return;

    const isReminderSet = user?.reminders?.some(
      (reminder) => reminder.contestId === contestId
    );

    try {
      let response;

      if (isReminderSet) {
        // Remove reminder if already set
        response = await fetch(`${BASE_URL}/api/reminders/${contestId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Handle token expiry or unauthorized access
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          addNotification("Session expired. Please login again.", "warning");
          navigate("/login");
          return;
        }

        if (response.ok) {
          // Update reminders locally after removing
          const updatedReminders = user.reminders.filter(
            (reminder) => reminder.contestId !== contestId
          );
          updateRemindersInLocalStorage(updatedReminders);
          addNotification("Reminder removed successfully!", "info");
        } else {
          // Handle errors if removal fails
          const errorData = await response.json();
          addNotification(
            errorData.message || "Failed to remove reminder.",
            "error"
          );
        }
      } else {
        // Add new reminder
        const requestBody = {
          contestId,
          platform,
          method,
          timeBefore,
          contestTime,
        };

        response = await fetch(`${BASE_URL}/api/reminders/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // Handle token expiry or unauthorized access
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          addNotification("Session expired. Please login again.", "warning");
          navigate("/login");
          return;
        }

        if (response.ok) {
          // Update reminders after adding
          const data = await response.json();
          updateRemindersInLocalStorage(data.user.reminderPreferences);
          addNotification("Reminder added successfully!", "info");
        } else {
          // Handle errors if adding fails
          const errorData = await response.json();
          addNotification(
            errorData.message || "Failed to add reminder.",
            "error"
          );
        }
      }
    } catch (err) {
      // Show error notification for network or unexpected errors
      addNotification(
        err.message || "Failed to update reminder. Please try again.",
        "error"
      );
    }
  };

  // Platform filter state
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    "codeforces.com": true,
    "leetcode.com": true,
    "codechef.com": true,
    ...(token && { bookmark: true }),
  });

  // Date formatting utilities
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("en-IN", options) + " IST";
  };

  const getCountdown = (startTime) => {
    const startDate = new Date(startTime);
    const diff = startDate - currentTime;

    if (diff <= 0) return "Starting now";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let countdown = "";
    if (days > 0) countdown += `${days}d `;
    if (hours > 0 || days > 0) countdown += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) countdown += `${minutes}m `;
    countdown += `${seconds}s`;

    return countdown;
  };

  // API fetch function
  const fetchContests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/contests`);
      const data = await response.json();

      // Adjust timezone to IST (+5:30)
      const processedData = data.map((contest) => {
        const adjustedContest = { ...contest };
        const originalDate = new Date(contest.start);
        originalDate.setTime(originalDate.getTime() + 5.5 * 60 * 60 * 1000);
        adjustedContest.start = originalDate.toISOString();
        return adjustedContest;
      });

      setContests(processedData);
    } catch {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };
  // =================== Effect Hooks ===================

  // Initial contest data fetch on component mount
  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchContests();
      hasFetchedData.current = true;
    }
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // =================== UI Helper Functions ===================

  /**
   * Returns the appropriate logo component for a given platform
   * @param {string} host - The platform hostname
   * @returns {JSX.Element} - Logo component or default icon
   */
  const getPlatformLogo = (host) => {
    const platformLogos = {
      "codeforces.com": (
        <img src={CodeforcesLogo} alt="Codeforces" className="w-6 h-6" />
      ),
      "leetcode.com": (
        <img src={LeetcodeLogo} alt="Leetcode" className="w-6 h-6" />
      ),
      "codechef.com": (
        <img src={CodechefLogo} alt="Codechef" className="w-6 h-6" />
      ),
    };
    return platformLogos[host] || <span className="text-xl">🖥️</span>;
  };

  // =================== Platform Filter Functions ===================

  /**
   * Toggles the selection state of a single platform
   * @param {string} platform - Platform to toggle
   */
  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  /**
   * Toggles all platforms selection state
   */
  const toggleAllPlatforms = () => {
    const allSelected = Object.values(selectedPlatforms).every(
      (value) => value
    );

    const newState = {
      "codeforces.com": !allSelected,
      "leetcode.com": !allSelected,
      "codechef.com": !allSelected,
      ...(token && { bookmark: !allSelected }), // Include bookmark if logged in
    };

    setSelectedPlatforms(newState);
  };

  // =================== Contest Filtering Logic ===================

  /**
   * Filter contests based on selected platforms and bookmarks
   */
  const filteredContests = contests.filter((contest) => {
    const contestId = contest._id || contest.id;

    // Show bookmarked contests if bookmark filter is selected
    if (
      selectedPlatforms["bookmark"] &&
      user?.bookmarks?.includes(Number(contestId))
    ) {
      return true;
    }

    // Filter by platform selection
    return selectedPlatforms[contest.host] === true;
  });

  // Separate contests into past and upcoming
  const now = new Date();
  const pastContests = filteredContests.filter(
    (contest) => new Date(contest.start) < now
  );
  const upcomingContests = filteredContests.filter(
    (contest) => new Date(contest.start) >= now
  );
  return ( 
    // Main container
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Coding Contests
      </h2>

      {/* Platform selection filter */}
      <div className="mb-8 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Filter by Platform {token ? "/ Bookmarks" : ""}
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => toggleAllPlatforms()}
            className={`px-6 py-3 rounded-lg transition-all duration-300
              ${
                Object.values(selectedPlatforms).every((value) => value)
                  ? "bg-blue-500/20 backdrop-blur-md text-white shadow-lg hover:bg-blue-500/30"
                  : "bg-gray-800/50 backdrop-blur-md text-gray-300 hover:bg-gray-700/50 hover:text-white"
              }
              font-medium text-sm`}
          >
            All Platforms
          </button>
          <button
            onClick={() => togglePlatform("codeforces.com")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${
                selectedPlatforms["codeforces.com"]
                  ? "bg-blue-500/20 backdrop-blur-md text-white shadow-lg hover:bg-blue-500/30"
                  : "bg-gray-800/50 backdrop-blur-md text-gray-300 hover:bg-gray-700/50 hover:text-white"
              }
              font-medium text-sm`}
          >
            <img src={CodeforcesLogo} alt="Codeforces" className="w-6 h-6" />
            Codeforces
          </button>
          <button
            onClick={() => togglePlatform("leetcode.com")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${
                selectedPlatforms["leetcode.com"]
                  ? "bg-blue-500/20 backdrop-blur-md text-white shadow-lg hover:bg-blue-500/30"
                  : "bg-gray-800/50 backdrop-blur-md text-gray-300 hover:bg-gray-700/50 hover:text-white"
              }
              font-medium text-sm`}
          >
            <img src={LeetcodeLogo} alt="Leetcode" className="w-6 h-6" />
            LeetCode
          </button>
          <button
            onClick={() => togglePlatform("codechef.com")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${
                selectedPlatforms["codechef.com"]
                  ? "bg-blue-500/20 backdrop-blur-md text-white shadow-lg hover:bg-blue-500/30"
                  : "bg-gray-800/50 backdrop-blur-md text-gray-300 hover:bg-gray-700/50 hover:text-white"
              }
              font-medium text-sm`}
          >
            <img src={CodechefLogo} alt="Codechef" className="w-6 h-6" />
            CodeChef
          </button>
          {token && (
            <button
              onClick={() => togglePlatform("bookmark")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
                ${
                  selectedPlatforms["bookmark"]
                    ? "bg-blue-500/20 backdrop-blur-md text-white shadow-lg hover:bg-blue-500/30"
                    : "bg-gray-800/50 backdrop-blur-md text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }
                font-medium text-sm`}
            >
              <img src={BookmarkIcon} alt="Bookmark" className="w-6 h-6" />
              Bookmarked
            </button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}

      {/* Past Contests Section */}
      {!isLoading && pastContests.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-200 mb-4 bg-gradient-to-r from-gray-400 to-gray-600 text-transparent bg-clip-text">
            Past Contests
          </h3>
          <div className="overflow-x-auto bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-800">
            <table className="w-full">
              <thead className="bg-gray-800/90">
                <tr className="text-white">
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Start Time (IST)</th>
                  <th className="p-4 text-left font-semibold">Contest Name</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastContests.map((contest) => (
                  <tr
                    key={contest.id}
                    className="border-b border-gray-800 hover:bg-gray-800/80 transition-colors duration-200"
                  >
                    <td className="p-4 text-gray-300">
                      {new Date(contest.start) > now ? "Ongoing" : "Finished"}
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(contest.start)}</td>
                    <td className="p-4 text-white font-medium">
                      <a
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                      >
                        <span
                          className="inline-flex justify-center items-center min-w-10 min-h-10 text-2xl"
                          title={contest.host}
                        >
                          {getPlatformLogo(contest.host)}
                        </span>
                        <span className="text-lg">{contest.event}</span>
                      </a>
                    </td>
                    <td className="p-4 flex justify-center items-center gap-4">
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.youtube.com/results?search_query=${encodeURIComponent(
                              contest.event + " solutions"
                            )}`,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-800/50 backdrop-blur-md text-white transition-all duration-300 hover:bg-gray-700/50 hover:shadow-lg transform hover:scale-105
                                   font-medium text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                        <span className="text-sm">Solutions</span>
                      </button>
                      {token && (
                        <button
                          onClick={() => handleAddNote(contest.id)}
                          className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-800/50 backdrop-blur-md text-white transition-all duration-300 hover:bg-gray-700/50 hover:shadow-lg transform hover:scale-105
                                     font-medium text-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          <span className="text-sm">Add Note</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Contests Section */}
      {!isLoading && upcomingContests.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-200 mb-4 bg-gradient-to-r from-gray-400 to-gray-600 text-transparent bg-clip-text">
            Upcoming Contests
          </h3>
          <div className="overflow-x-auto bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-800">
            <table className="w-full">
              <thead className="bg-gray-800/90">
                <tr className="text-white">
                  <th className="p-4 text-left font-semibold">Countdown</th>
                  <th className="p-4 text-left font-semibold">Start Time (IST)</th>
                  <th className="p-4 text-left font-semibold">Contest Name</th>
                  {token && <th className="p-4 text-center font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {upcomingContests.map((contest) => (
                  <tr
                    key={contest.id}
                    className="border-b border-gray-800 hover:bg-gray-800/80 transition-colors duration-200"
                  >
                    <td className="p-4 text-green-400 font-mono text-lg">
                      <div className="w-32">{getCountdown(contest.start)}</div>
                    </td>
                    <td className="p-4 text-gray-300 text-lg">{formatDate(contest.start)}</td>
                    <td className="p-4 text-white font-medium text-lg">
                      <a
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                      >
                        <span
                          className="inline-flex justify-center items-center min-w-10 min-h-10 text-2xl"
                          title={contest.host}
                        >
                          {getPlatformLogo(contest.host)}
                        </span>
                        <span className="text-lg">{contest.event}</span>
                      </a>
                    </td>
                    {token && (
                      <td className="p-4 flex justify-center items-center gap-4">
                        <button
                          onClick={() =>
                            toggleReminder(
                              contest.id,
                              contest.host
                                .replace(".com", "")
                                .replace(/^\w/, (c) => c.toUpperCase()),
                              "email",
                              60,
                              contest.start
                            )
                          }
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all duration-300
                                    hover:shadow-lg transform hover:scale-105 font-medium text-sm
                                    ${
                                      isReminderSet(
                                        contest.id,
                                        contest.host
                                          .replace(".com", "")
                                          .replace(/^\w/, (c) => c.toUpperCase())
                                      )
                                        ? "bg-yellow-500/20 backdrop-blur-md hover:bg-yellow-600/30 text-yellow-100"
                                        : "bg-green-500/20 backdrop-blur-md hover:bg-green-600/30 text-green-100"
                                    }`}
                        >
                          {isReminderSet(
                            contest.id,
                            contest.host
                              .replace(".com", "")
                              .replace(/^\w/, (c) => c.toUpperCase())
                          ) ? (
                            <>
                              <span>⏰</span> <span className="text-sm">Remove</span>
                            </>
                          ) : (
                            <>
                              <span>⏰</span> <span className="text-sm">Set</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleBookmark(contest.id)}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all duration-300
                                    hover:shadow-lg transform hover:scale-105 font-medium text-sm
                                    ${
                                      isContestBookmarked(contest.id)
                                        ? "bg-yellow-500/20 backdrop-blur-md hover:bg-yellow-600/30 text-yellow-100"
                                        : "bg-blue-500/20 backdrop-blur-md hover:bg-blue-600/30 text-blue-100"
                                    }`}
                        >
                          {isContestBookmarked(contest.id) ? (
                            <>
                              <span>🔖</span> <span className="text-sm">Remove</span>
                            </>
                          ) : (
                            <>
                              <span>⭐</span> <span className="text-sm">Bookmark</span>
                            </>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Contests Message */}
      {!isLoading && filteredContests.length === 0 && (
        <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-xl text-center text-gray-200 shadow-lg border border-gray-800">
          <p className="text-2xl font-semibold mb-3">
            No contests found for the selected platforms.
          </p>
          <p className="text-gray-400 text-lg">
            Try selecting different platforms or check back later.
          </p>
        </div>
      )}

      {/* Contest Notes Modal */}
      {isModalOpen && (
        <ContestNotesModal
          contestId={selectedContestId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
