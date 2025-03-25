const User = require("../models/userModel");

// API configuration constants
const API_URL = "https://clist.by/api/v4/contest/";
const API_KEY = process.env.CLIST_API_KEY;

/**
 * Bookmarks a contest for a specific user
 * @param {Object} req - Express request object containing:
 *   - params.contestId: ID of the contest to bookmark
 *   - user.id: ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success/error message
 */
const bookmarkContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add contestId to bookmarks if not already present
    if (!user.bookmarkedContests.includes(contestId)) {
      user.bookmarkedContests.push(contestId);
      await user.save();
    }
    res.status(200).json({ message: "Contest bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Removes a contest bookmark for a specific user
 * @param {Object} req - Express request object containing:
 *   - params.contestId: ID of the contest to remove
 *   - user.id: ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success/error message
 */
const removeBookmark = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter out the specified contest ID
    user.bookmarkedContests = user.bookmarkedContests.filter(
      (id) => id.toString() !== contestId
    );
    await user.save();

    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves all bookmarked contests for a user within a specific time range
 * @param {Object} req - Express request object containing user.id
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of bookmarked contests or error message
 * 
 * Time Range: Past 7 days to upcoming 30 days
 * Supported Platforms: CodeForces, LeetCode, CodeChef
 */
const getBookmarkedContests = async (req, res) => {
    try {
      const userId = req.user.id;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      // Return empty array if no bookmarks exist
      if (!user.bookmarkedContests.length) {
        return res.status(200).json({ bookmarkedContests: [] });
      }

      // Create Set of bookmarked contest IDs for efficient lookup
      console.log(user.bookmarkedContests);
      const bookmarkedIds = new Set(user.bookmarkedContests.map(Number));

      // Calculate time range for contest fetch
      const currentDate = new Date();
      const past7Days = new Date(currentDate);
      past7Days.setDate(currentDate.getDate() - 7);
      
      const upcoming30Days = new Date(currentDate);
      upcoming30Days.setDate(currentDate.getDate() + 30);

      // Convert dates to ISO format for API query
      const startTimestamp = past7Days.toISOString();
      const endTimestamp = upcoming30Days.toISOString();

      // Fetch contests from CLIST API with specified parameters
      const response = await fetch(
        `${API_URL}?start__gte=${startTimestamp}&end__lte=${endTimestamp}&resource__in=codeforces.com,leetcode.com,codechef.com&orderby=start`,
        {
          headers: {
            Authorization: `ApiKey ${API_KEY}`,
          },
        }
      );  

      if (!response.ok) {
        throw new Error("Failed to fetch contests from CLIST API");
      }

      const data = await response.json();

      // Filter response to only include bookmarked contests
      const bookmarkedContests = data.objects.filter((contest) =>
        bookmarkedIds.has(contest.id)
      );

      res.status(200).json({ bookmarkedContsts : bookmarkedContests });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Export controller functions
module.exports = { bookmarkContest, removeBookmark, getBookmarkedContests };
