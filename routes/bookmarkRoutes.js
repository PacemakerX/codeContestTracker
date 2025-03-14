const express = require("express");
const {
  bookmarkContest,
  removeBookmark,
  getBookmarkedContests,
} = require("../controllers/bookmarkController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:contestId", authenticate, bookmarkContest);
router.delete("/:contestId", authenticate, removeBookmark);
router.get("/", authenticate, getBookmarkedContests);

module.exports = router;
