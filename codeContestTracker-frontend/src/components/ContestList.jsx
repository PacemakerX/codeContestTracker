import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import CodeforcesLogo from "../assets/codeforces.svg";
import LeetcodeLogo from "../assets/leetcode.svg";
import CodechefLogo from "../assets/codechef.svg";
import BookmarkIcon from "../assets/bookmark.svg";
import { useNotification } from "../components/ToastNotification"; // Import notification hook

const BASE_URL = "https://apicodecontesttrackerbackend.onrender.com";
export default function ContestList() {
  const { token } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const hasFetchedData = useRef(false);
  const { addNotification } = useNotification();

  // Update bookmarks in localStorage after API call
  const updateBookmarksInLocalStorage = (bookmarks) => {
    if (user) {
      const updatedUser = { ...user, bookmarks };
      setUser(updatedUser); // Update state after changes
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Toggle bookmark for a contest
  const toggleBookmark = async (contestId) => {
    if (!token) return;

    const isBookmarked = user?.bookmarks?.includes(contestId);
    try {
      const response = await fetch(`${BASE_URL}/api/bookmarks/${contestId}`, {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedBookmarks = isBookmarked
          ? user.bookmarks.filter((id) => id !== contestId)
          : [...user.bookmarks, contestId];

        addNotification(
          isBookmarked
            ? "Bookmark removed successfully!"
            : "Bookmark added successfully!",
          "info"
        );
        // Update localStorage with new bookmarks
        updateBookmarksInLocalStorage(updatedBookmarks);
      }
    } catch (err) {
      // Handle errors silently
      addNotification(
        err.message || "Login failed. Please try again.",
        "error"
      );
    }
  };

  // Check if a contest is bookmarked
  const isContestBookmarked = (contestId) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser?.bookmarks?.includes(contestId);
  };
  const updateRemindersInLocalStorage = (reminders) => {
    if (user) {
      const updatedUser = { ...user, reminders };
      setUser(updatedUser); // Update state after changes
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const toggleReminder = async (
    contestId,
    platform,
    method,
    timeBefore,
    contestTime
  ) => {
    if (!token) return;

    // Check if the reminder already exists
    const isReminderSet = user?.reminders?.some(
      (reminder) => reminder.contestId === contestId
    );

    try {
      let response;
      if (isReminderSet) {
        // DELETE Request to Remove Reminder
        response = await fetch(`${BASE_URL}/api/reminders/${contestId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Remove reminder from local state
          const updatedReminders = user.reminders.filter(
            (reminder) => reminder.contestId !== contestId
          );
          updateRemindersInLocalStorage(updatedReminders);
          addNotification("Reminder removed successfully!", "info");
        }
      } else {
        const requestBody = {
          contestId,
          platform,
          method,
          timeBefore,
          contestTime,
        };

        // POST Request to Add/Update Reminder
        response = await fetch(`${BASE_URL}/api/reminders/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedReminders = data.user.reminderPreferences;
          updateRemindersInLocalStorage(updatedReminders);
          addNotification("Reminder added successfully!", "info");
        }
      }
    } catch (err) {
      console.error("Error updating reminder:", err);
      addNotification(
        err.message || "Failed to update reminder. Please try again.",
        "error"
      );
    }
  };

  const isReminderSet = (contestId, platform) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser?.reminders?.some(
      (reminder) =>
        reminder.contestId === contestId && reminder.platform === platform
    );
  };

  // Platform filter state
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    "codeforces.com": true,
    "leetcode.com": true,
    "codechef.com": true,
    bookmark: true,
  });

  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchContests();
      hasFetchedData.current = true;
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchContests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/contests`);
      const data = await response.json();

      // Process the contests data to adjust timezone information
      const processedData = data.map((contest) => {
        const adjustedContest = { ...contest };
        const originalDate = new Date(contest.start);
        originalDate.setTime(originalDate.getTime() + 5.5 * 60 * 60 * 1000);
        adjustedContest.start = originalDate.toISOString();

        return adjustedContest;
      });

      setContests(processedData);
    } catch {
      // Error handling without console.log
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to show in Indian format with IST label
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

  // Handle platform selection toggle
  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  // Handle "Select All" toggle
  const toggleAllPlatforms = () => {
    const allSelected = Object.values(selectedPlatforms).every((value) => value);
  
    // If all are selected, uncheck all, otherwise check all
    if (allSelected) {
      setSelectedPlatforms({
        "codeforces.com": false,
        "leetcode.com": false,
        "codechef.com": false,
        bookmark: false,
      });
    } else {
      setSelectedPlatforms({
        "codeforces.com": true,
        "leetcode.com": true,
        "codechef.com": true,
        bookmark: true,
      });
    }
  };  

  const filteredContests = contests.filter((contest) => {
    // Get the contest ID (try both _id and id to be safe)
    const contestId = contest._id || contest.id;

    // Check if "bookmark" filter is selected and contest is bookmarked
    if (
      selectedPlatforms["bookmark"] &&
      user?.bookmarks?.includes(Number(contestId))
    ) {
      return true; // Show bookmarked contests
    }

    // Otherwise, filter based on selected platforms
    return selectedPlatforms[contest.host] === true;
  });

  const now = new Date();
  const pastContests = filteredContests.filter(
    (contest) => new Date(contest.start) < now
  );
  const upcomingContests = filteredContests.filter(
    (contest) => new Date(contest.start) >= now
  );

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Coding Contests</h2>

      {/* Platform selection */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">
          Filter by Platform {token ? "/ Bookmarks" : ""}
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toggleAllPlatforms()}
            className={`px-4 py-2 rounded-md transition-colors ${
              Object.values(selectedPlatforms).every((value) => value)
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => togglePlatform("codeforces.com")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedPlatforms["codeforces.com"]
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <img src={CodeforcesLogo} alt="Codeforces" className="w-5 h-5" />
            Codeforces
          </button>
          <button
            onClick={() => togglePlatform("leetcode.com")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedPlatforms["leetcode.com"]
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <img src={LeetcodeLogo} alt="Leetcode" className="w-5 h-5" />
            LeetCode
          </button>
          <button
            onClick={() => togglePlatform("codechef.com")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedPlatforms["codechef.com"]
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <img src={CodechefLogo} alt="Codechef" className="w-5 h-5" />
            CodeChef
          </button>
          {token && (
            <button
              onClick={() => togglePlatform("bookmark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                selectedPlatforms["bookmark"]
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <img src={BookmarkIcon} alt="Codechef" className="w-5 h-5" />
              BookMarked
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
      )}

      {!isLoading && pastContests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">
            Past Contests
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Start Time (IST)</th>
                  <th className="p-3 text-left">Contest Name</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastContests.map((contest) => (
                  <tr
                    key={contest.id}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="p-3 text-gray-300">
                      {new Date(contest.start) > now ? "Ongoing" : "Finished"}
                    </td>
                    <td className="p-3 text-gray-300">
                      {formatDate(contest.start)}
                    </td>
                    <td className="p-3 text-white font-medium">
                      <a
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                      >
                        <span className="text-xl" title={contest.host}>
                          {getPlatformLogo(contest.host)}
                        </span>
                        {contest.event}
                      </a>
                    </td>
                    <td className="p-3 flex justify-center">
                      {/* YouTube solution button - visible to all users */}
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          contest.event + " solutions"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                      >
                        <span>▶️</span> Watch Solutions
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && upcomingContests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Upcoming Contests
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-3 text-left w-40">Countdown</th>
                  <th className="p-3 text-left w-48">Start Time (IST)</th>
                  <th className="p-3 text-left">Contest Name</th>
                  {token && <th className="p-3 text-center w-64">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {upcomingContests.map((contest) => (
                  <tr
                    key={contest.id}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="p-3 text-green-400 font-mono w-40">
                      <div className="w-32">{getCountdown(contest.start)}</div>
                    </td>
                    <td className="p-3 text-gray-300 w-48">
                      {formatDate(contest.start)}
                    </td>
                    <td className="p-3 text-white font-medium">
                      <a
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                      >
                        <span className="text-xl" title={contest.host}>
                          {getPlatformLogo(contest.host)}
                        </span>
                        {contest.event}
                      </a>
                    </td>
                    {token && (
                      <td className="p-3 flex justify-center gap-4 w-64">
                        <button
                          onClick={() =>
                            toggleReminder(
                              contest.id,
                              contest.host
                                .replace(".com", "")
                                .replace(/^\w/, (c) => c.toUpperCase()),
                              "email", // or "sms"
                              60, // Time before contest in minutes
                              contest.start // Contest start time in ISO format
                            )
                          }
                          className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                            isReminderSet(
                              contest.id,
                              contest.host
                                .replace(".com", "")
                                .replace(/^\w/, (c) => c.toUpperCase())
                            )
                              ? "bg-yellow-500 hover:bg-yellow-700 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          {isReminderSet(
                            contest.id,
                            contest.host
                              .replace(".com", "")
                              .replace(/^\w/, (c) => c.toUpperCase())
                          ) ? (
                            <>⏰ Remove Reminder</>
                          ) : (
                            <>⏰ Set Reminder</>
                          )}
                        </button>

                        <button
                          onClick={() => toggleBookmark(contest.id)}
                          // disabled={bookmarkLoading}
                          className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                            isContestBookmarked(contest.id)
                              ? "bg-yellow-500 hover:bg-yellow-700 text-white"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {isContestBookmarked(contest.id) ? (
                            <>🔖 Remove Bookmark</>
                          ) : (
                            <>⭐ Bookmark</>
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

      {!isLoading && filteredContests.length === 0 && (
        <div className="bg-gray-800 p-6 rounded-lg text-center text-white">
          <p className="text-xl">
            No contests found for the selected platforms.
          </p>
          <p className="text-gray-400 mt-2">
            Try selecting different platforms or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
