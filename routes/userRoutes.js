const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/userController");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", authenticate,getUserProfile);

router.put("/update", authenticate,updateUserProfile);

module.exports = router;
