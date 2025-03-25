const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const userEmail = process.env.EMAIL_USER;
const userPass = process.env.EMAIL_PASS;
// Email Configuration using Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: userPass,
  },
});

// Send Email Reminder
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
    console.log(
      `📧 Email sent successfully to ${email} for contest ${contestId}`
    );
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error.message);
  }
};

// Process Reminders
const processReminders = async () => {
  console.log("🔔 Running reminder cron job...");

  // Get current time in IST
  const nowIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  try {
    const users = await User.find({ reminderPreferences: { $exists: true } });

    for (const user of users) {
      for (const reminder of user.reminderPreferences) {
        const { contestId, platform, method, timeBefore, contestTime } =
          reminder;

        if (!contestTime) continue;

        // Convert contestTime to IST
        const contestTimeIST = new Date(
          new Date(contestTime).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          })
        );

        // Calculate Reminder Time
        const reminderTimeIST = new Date(contestTimeIST);
        reminderTimeIST.setMinutes(reminderTimeIST.getMinutes() - timeBefore);

        // Check if it's time to send the reminder
        if (nowIST >= reminderTimeIST && nowIST < contestTimeIST) {
          console.log(`✅ Time to send a reminder for ${user.username}!`);
          if (method === "email" && user.email) {
            await sendEmailReminder(
              user.email,
              contestId,
              platform,
              contestTimeIST
            );
          } else if (method === "sms" && user.phoneNumber) {
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

// Schedule Cron Job to Run Every Minute
cron.schedule("* * * * *", () => {
  processReminders();
  // Uncomment this to test email separately
  // testEmail();
});

module.exports = { processReminders };
