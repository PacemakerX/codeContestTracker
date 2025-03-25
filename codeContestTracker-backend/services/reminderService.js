const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

/**
 * Environment variables for email authentication
 */
const userEmail = process.env.EMAIL_USER;
const userPass = process.env.EMAIL_PASS;

/**
 * Nodemailer transport configuration
 * Uses Gmail as the email service provider
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: userPass,
  },
});

/**
 * Sends an email reminder to a user about an upcoming contest
 * @param {string} email - Recipient's email address
 * @param {string} contestId - Unique identifier for the contest
 * @param {string} platform - The platform hosting the contest (e.g., CodeForces, LeetCode)
 * @param {Date} contestTime - Start time of the contest
 */
const sendEmailReminder = async (email, contestId, platform, contestTime) => {
  const mailOptions = {
    from: userEmail,
    to: email,
    subject: `🚨 Reminder: Upcoming ${platform} Contest (ID: ${contestId}) Starts Soon!`,
    text: `Hello Champion! 🎯
  
  This is a reminder that your contest on **${platform}** (Contest ID: ${contestId}) is scheduled to begin at:
  
  🕒 **Date & Time:** ${contestTime.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  })}
  
  Make sure you're ready to give it your best shot! 💡
  
  ✅ **Pro Tip:** Double-check your internet connection and login credentials before the contest starts.
  
  Best of luck! 🍀
  Team PacemakerX
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${email} for contest ${contestId}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error.message);
  }
};

/**
 * Main function to process reminders for all users
 * Runs periodically to check and send reminders based on user preferences
 */
const processReminders = async () => {
  console.log("🔔 Running reminder cron job...");

  // Get current time in IST (Indian Standard Time)
  const nowIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  try {
    // Fetch all users who have reminder preferences set
    const users = await User.find({ reminderPreferences: { $exists: true } });

    // Iterate through each user and their reminder preferences
    for (const user of users) {
      for (const reminder of user.reminderPreferences) {
        const { contestId, platform, method, timeBefore, contestTime } = reminder;

        // Skip if contest time is not set
        if (!contestTime) continue;

        // Convert contest time to IST for comparison
        const contestTimeIST = new Date(
          new Date(contestTime).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          })
        );

        // Calculate when the reminder should be sent
        const reminderTimeIST = new Date(contestTimeIST);
        reminderTimeIST.setMinutes(reminderTimeIST.getMinutes() - timeBefore);

        // Check if current time falls within the reminder window
        if (nowIST >= reminderTimeIST && nowIST < contestTimeIST) {
          console.log(`✅ Time to send a reminder for ${user.username}!`);
          
          // Send email reminder if method is email and user has email
          if (method === "email" && user.email) {
            await sendEmailReminder(
              user.email,
              contestId,
              platform,
              contestTimeIST
            );
          } 
          // SMS reminder functionality (placeholder for future implementation)
          else if (method === "sms" && user.phoneNumber) {
            await sendSMSReminder(
              user.phoneNumber,
              contestId,
              platform,
              contestTimeIST
            );
          }
        }
      }
    }
    console.log("✅ Reminders processed successfully.");
  } catch (error) {
    console.error("❌ Error processing reminders:", error.message);
  }
};

/**
 * Cron job configuration
 * Runs every minute to check and send reminders
 * Pattern: * * * * *
 * Format: Minute Hour Day Month WeekDay
 */
cron.schedule("* * * * *", () => {
  processReminders();
  // Uncomment this to test email separately
  // testEmail();
});

module.exports = { processReminders };
