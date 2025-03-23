const User = require("../models/userModel");

// Add or Update a Reminder
const addOrUpdateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId, platforms, method, timeBefore } = req.body;

    if (!contestId || !platforms || !method || !timeBefore) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const existingReminderIndex = user.reminderPreferences.findIndex(
      (reminder) => reminder.contestId === contestId
    );

    if (existingReminderIndex !== -1) {
      // Update existing reminder
      user.reminderPreferences[existingReminderIndex] = {
        contestId,
        platforms,
        method,
        timeBefore,
      };
    } else {
      // Add new reminder
      user.reminderPreferences.push({
        contestId,
        platforms,
        method,
        timeBefore,
      });
    }

    await user.save();
    res.status(200).json({ message: "Reminder updated successfully.", user });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to update reminder." });
  }
};

// Delete a Reminder by Contest ID
const deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.reminderPreferences = user.reminderPreferences.filter(
      (reminder) => reminder.contestId !== parseInt(contestId)
    );

    await user.save();
    res.status(200).json({ message: "Reminder deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder." });
  }
};

// Get All Reminders
const getAllReminders = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("reminderPreferences");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ reminders: user.reminderPreferences });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders." });
  }
};

module.exports = {
  addOrUpdateReminder,
  deleteReminder,
  getAllReminders,
};
