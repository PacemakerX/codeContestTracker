const User = require("../models/userModel");

/**
 * Controller to add a new reminder or update an existing one
 * @route POST /api/reminders
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing reminder details
 * @param {string} req.body.contestId - Unique identifier for the contest
 * @param {string} req.body.platform - Platform where contest is hosted
 * @param {string} req.body.method - Notification method (email, SMS, etc.)
 * @param {number} req.body.timeBefore - Time before contest to send reminder
 * @param {string} req.body.contestTime - Time when contest starts
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated user data or error message
 */
const addOrUpdateReminder = async (req, res) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user.id;
    // Destructure required fields from request body
    const { contestId, platform, method, timeBefore, contestTime } = req.body;

    // Validate that all required fields are present
    if (!contestId || !platform || !method || !timeBefore || !contestTime) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if reminder already exists for this contest
    const existingReminderIndex = user.reminderPreferences.findIndex(
      (reminder) => reminder.contestId === contestId
    );

    if (existingReminderIndex !== -1) {
      // Update existing reminder with new values
      user.reminderPreferences[existingReminderIndex] = {
        contestId,
        platform,
        method,
        timeBefore,
        contestTime,
      };
    } else {
      // Add new reminder to user's preferences
      user.reminderPreferences.push({
        contestId,
        platform,
        method,
        timeBefore,
        contestTime,
      });
    }

    // Save updated user document
    await user.save();
    res.status(200).json({ message: "Reminder updated successfully.", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update reminder." });
  }
};

/**
 * Controller to delete a specific reminder by contest ID
 * @route DELETE /api/reminders/:contestId
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.contestId - ID of contest to delete reminder for
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error response
 */
const deleteReminder = async (req, res) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user.id;
    // Get contest ID from URL parameters
    const { contestId } = req.params;

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Filter out the reminder with matching contestId
    user.reminderPreferences = user.reminderPreferences.filter(
      (reminder) => reminder.contestId !== parseInt(contestId)
    );

    // Save updated user document
    await user.save();
    res.status(200).json({ message: "Reminder deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder." });
  }
};

/**
 * Controller to retrieve all reminders for a user
 * @route GET /api/reminders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Array of user's reminder preferences
 */
const getAllReminders = async (req, res) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user.id;

    // Find user and select only reminder preferences
    const user = await User.findById(userId).select("reminderPreferences");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return reminder preferences array
    res.status(200).json({ reminders: user.reminderPreferences });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders." });
  }
};

// Export controller functions
module.exports = {
  addOrUpdateReminder,
  deleteReminder,
  getAllReminders,
};
