const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const cron = require("node-cron");

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Email Configuration using Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sparsh.sociallife@gmail.com",
    pass: "tine prqd vxik bycc",
  },
});

// Twilio Client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Send Email Reminder
const sendEmailReminder = async (email, contestId, platform, contestTime) => {
  const mailOptions = {
    from: "sparsh.sociallife@gmail.com",
    to: email,
    subject: `Reminder for Contest ${contestId}`,
    text: `Your contest on ${platform} is starting at ${contestTime.toLocaleString()}. Best of luck!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} for contest ${contestId}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error.message);
  }
};

const formatPhoneNumber = (number) => {
  if (!number.startsWith("+")) {
    return `+91${number}`; // Add +91 if not already included
  }
  return number;
};
// Send SMS Reminder
const sendSMSReminder = async (phoneNumber, contestId, platform, contestTime) => {
  const messageBody = `Reminder: Your contest on ${platform} is starting at ${contestTime.toLocaleString()}. Best of luck!`;

  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    await twilioClient.messages.create({
      body: messageBody,
      from: TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });
    console.log(`✅ SMS sent successfully to ${phoneNumber}. SID: ${response.sid}`);
  } catch (error) {
    console.error(`❌ Error sending SMS to ${phoneNumber}:`, error.message);
  }
};

// Process Reminders
const processReminders = async () => {
  console.log("🔔 Running reminder cron job...");

  const now = new Date();

  try {
    const users = await User.find({ "reminderPreferences.0": { $exists: true } });

    for (const user of users) {
      for (const reminder of user.reminderPreferences) {
        const { contestId, platform, method, timeBefore, contestTime } = reminder;

        if (!contestTime) continue;

        const reminderTime = new Date(contestTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - timeBefore);

        console.log(user.username);
        console.log(now, reminderTime, contestTime);
        if (now >= reminderTime && now < contestTime) {
          if (method === "email" && user.email) {
            console.log("Sending email reminder...");
            await sendEmailReminder(user.email, contestId, platform, contestTime);
          } else if (method === "sms" && user.phoneNumber) {
            await sendSMSReminder(user.phoneNumber, contestId, platform, contestTime);
          }
        }
      }
    }

    console.log("✅ Reminders processed successfully.");
  } catch (error) {
    console.error("Error processing reminders:", error.message);
  }
};

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: "sparsh.sociallife@gmail.com",
      to: "sparsh.officialwork@gmail.com",
      subject: "Test Email",
      text: "This is a test email from your reminder service!",
    });
    console.log("Test email sent:", info.response);
  } catch (error) {
    console.error("Error sending test email:", error.message);
  }
}


// Schedule Cron Job to Run Every Minute
cron.schedule("* * * * *", () => {
  processReminders();
  // testEmail();
});

module.exports = { processReminders };
