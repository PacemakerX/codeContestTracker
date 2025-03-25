/**
 * Express router configuration for reminder-related endpoints
 */
const express = require("express");
const {
  addOrUpdateReminder,
  getAllReminders,
  deleteReminder,
} = require("../controllers/reminderController");
const authenticate = require("../middleware/authMiddleware");

// Initialize Express router
const router = express.Router();

/**
 * @route   POST /api/reminders/add
 * @desc    Creates a new reminder or updates existing one
 * @access  Private (requires authentication)
 * @param   req.body should contain reminder details
 */
router.post("/add", authenticate, addOrUpdateReminder);

/**
 * @route   DELETE /api/reminders/:contestId
 * @desc    Deletes a specific reminder by contest ID
 * @access  Private (requires authentication)
 * @param   contestId - The ID of the contest to remove reminder for
 */
router.delete("/:contestId", authenticate, deleteReminder);

/**
 * @route   GET /api/reminders
 * @desc    Retrieves all reminders for the authenticated user
 * @access  Private (requires authentication)
 * @returns Array of reminder objects
 */
router.get("/", authenticate, getAllReminders);

// Export the router
module.exports = router;
