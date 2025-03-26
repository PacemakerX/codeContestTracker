const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const router = express.Router();
const OTPController = require("../controllers/otpController.js");
const ContactController = require("../controllers/contactController");

const authenticate = require("../middleware/authMiddleware");
// Route for user registration
// POST /api/users/register
// Public access - allows new users to create an account
router.post("/register", registerUser);

// Route for user authentication/login
// POST /api/users/login
// Public access - allows existing users to login and receive JWT token
router.post("/login", loginUser);

// Route to get user profile information
// GET /api/users/profile
// Private access - requires authentication token
// Uses authenticate middleware to verify JWT token
router.get("/profile", authenticate, getUserProfile);

// Route to send OTP (One-Time Password)
// POST /api/users/send-otp
// Public access - sends verification code to user's email/phone
router.post("/send-otp", OTPController.sendOTP);

// Route to verify OTP entered by user
// POST /api/users/verify-otp
// Public access - validates the OTP entered by user
router.post("/verify-otp", OTPController.verifyOTP);

// Route to contact form submission
// POST /api/users/contact
// Public access - sends user's message to site admin
router.post("/contact", ContactController.submitContactForm);

module.exports = router;
