const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", getUserProfile);

module.exports = router;
