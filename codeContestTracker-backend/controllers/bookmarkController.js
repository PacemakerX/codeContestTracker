const User = require("../models/userModel");

const API_URL = "https://clist.by/api/v4/contest/";
const API_KEY = process.env.CLIST_API_KEY;

// Bookmark a contest
const bookmarkContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.bookmarkedContests.includes(contestId)) {
      user.bookmarkedContests.push(contestId);
      await user.save();
    }
    res.status(200).json({ message: "Contest bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a bookmark
const removeBookmark = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bookmarkedContests = user.bookmarkedContests.filter(
      (id) => id.toString() !== contestId
    );
    await user.save();

    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookmarked contests
const getBookmarkedContests = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      if (!user.bookmarkedContests.length) {
        return res.status(200).json({ bookmarkedContests: [] });
      }
  
      console.log(user.bookmarkedContests);
      // Convert stored contest IDs (strings) into a Set for fast lookup
      const bookmarkedIds = new Set(user.bookmarkedContests.map(Number));
  
      const currentDate = new Date();
      
      // Calculate past 7 days and upcoming 30 days timestamps
      const past7Days = new Date(currentDate);
      past7Days.setDate(currentDate.getDate() - 7);
  
      const upcoming30Days = new Date(currentDate);
      upcoming30Days.setDate(currentDate.getDate() + 30);
  
      const startTimestamp = past7Days.toISOString();
      const endTimestamp = upcoming30Days.toISOString();
  
      // API call to fetch contests
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
  
      // Filter contests to only include bookmarked ones
      const bookmarkedContests = data.objects.filter((contest) =>
        bookmarkedIds.has(contest.id) // Convert contest ID to string for comparison
      );
  
      res.status(200).json({ bookmarkedContsts : bookmarkedContests });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

module.exports = { bookmarkContest, removeBookmark, getBookmarkedContests };
