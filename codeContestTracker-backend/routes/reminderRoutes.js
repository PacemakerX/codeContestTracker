const express = require("express");
const { checkUpcomingContests } = require("../services/reminderService");

const router = express.Router();

// Test route to manually trigger reminders
router.get("/test-reminders", async (req, res) => {
  try {
    await checkUpcomingContests();
    res
      .status(200)
      .json({ message: "Reminders checked and sent successfully!" });
  } catch (error) {
    console.error("Error testing reminders:", error);
    res.status(500).json({ message: "Error sending reminders", error });
  }
});

module.exports = router;
