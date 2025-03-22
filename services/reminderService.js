const cron = require("node-cron");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const User = require("../models/userModel");
const fetch = require("node-fetch");
require("dotenv").config();

const API_URL = "https://clist.by/api/v4/contest/";
const API_KEY = process.env.CLIST_API_KEY;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Twilio client setup
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// Utility function to send email reminders
const sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject,
      text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Utility function to send SMS reminders
const sendSMS = async (phoneNumber, message) => {
  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

// Track sent notifications (prevent duplicate reminders)
const notifiedUsers = new Set();

const checkUpcomingContests = async () => {
  try {
    const currentTime = new Date();

    // Get maximum `timeBefore` from all users
    const users = await User.find({ "reminderPreferences.platforms": { $exists: true, $not: { $size: 0 } } });

    if (users.length === 0) return;

    const maxTimeBefore = Math.max(...users.map(user => user.reminderPreferences.timeBefore));

    // Fetch contests starting within the max reminder time
    const upcomingTime = new Date(currentTime.getTime() + maxTimeBefore * 60 * 1000).toISOString();

    const response = await fetch(
      `${API_URL}?start__gte=${currentTime.toISOString()}&start__lte=${upcomingTime}&resource__in=codeforces.com,leetcode.com,codechef.com&orderby=start`,
      { headers: { Authorization: `ApiKey ${API_KEY}` } }
    );

    if (!response.ok) throw new Error("Failed to fetch contests");

    const data = await response.json();
    const upcomingContests = data.objects;

    if (upcomingContests.length === 0) return;

    for (const user of users) {
      for (const contest of upcomingContests) {
        const contestStart = new Date(contest.start).getTime();
        const timeBefore = user.reminderPreferences.timeBefore * 60 * 1000;

        if (contestStart - currentTime.getTime() <= timeBefore) {
          const uniqueKey = `${user._id}-${contest.id}`;
          if (notifiedUsers.has(uniqueKey)) continue; // Prevent duplicate reminders

          const message = `Reminder: ${contest.event} is starting soon! Visit: ${contest.href}`;

          if (user.reminderPreferences.method === "email") {
            await sendEmail(user.email, "Contest Reminder", message);
          } else if (user.phoneNumber) {
            await sendSMS(user.phoneNumber, message);
          }

          notifiedUsers.add(uniqueKey);
        }
      }
    }
  } catch (error) {
    console.error("Error checking upcoming contests:", error);
  }
};

// Schedule the cron job every 10 minutes
cron.schedule("*/10 * * * *", checkUpcomingContests);

module.exports = { checkUpcomingContests };
