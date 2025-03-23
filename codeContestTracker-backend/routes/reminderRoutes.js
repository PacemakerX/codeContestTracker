const express = require("express");
const {
  addOrUpdateReminder,
  getAllReminders,
  deleteReminder,
} = require("../controllers/reminderController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/add", authenticate, addOrUpdateReminder);
router.delete("/:contestId", authenticate, deleteReminder);
router.get("/", authenticate, getAllReminders);

module.exports = router;
