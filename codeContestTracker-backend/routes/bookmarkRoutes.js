/**
 * Express router configuration for bookmark-related endpoints
 */
const express = require("express");
const {
  bookmarkContest,
  removeBookmark,
  getBookmarkedContests,
} = require("../controllers/bookmarkController");
const authenticate = require("../middleware/authMiddleware");

// Initialize express router
const router = express.Router();

/**
 * POST /bookmarks/:contestId
 * Adds a contest to user's bookmarks
 * @requires authentication
 * @param {string} contestId - The ID of the contest to bookmark
 */
router.post("/:contestId", authenticate, bookmarkContest);

/**
 * DELETE /bookmarks/:contestId
 * Removes a contest from user's bookmarks
 * @requires authentication
 * @param {string} contestId - The ID of the contest to remove from bookmarks
 */
router.delete("/:contestId", authenticate, removeBookmark);

/**
 * GET /bookmarks
 * Retrieves all bookmarked contests for the authenticated user
 * @requires authentication
 * @returns {Array} List of bookmarked contests
 */
router.get("/", authenticate, getBookmarkedContests);

// Export the router for use in the main application
module.exports = router;
