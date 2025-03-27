const userModels = require("../models/userModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user details
 * @param {string} req.body.username - User's username
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {string} req.body.phoneNumber - User's phone number
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error message
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;
    const newUser = await userModels.register(
      username,
      email,
      password,
      phoneNumber
    );
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Authenticate and login a user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.emailOrUsername - User's email or username
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with JWT token and user data or error message
 */
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      throw new Error("Invalid login credentials");
    }

    // Authenticate user and get user data
    const user = await userModels.login(emailOrUsername, password);

    // Generate JWT token valid for 1 hour
    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return user data and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bookmarks: user.bookmarkedContests,
        reminders: user.reminderPreferences.map(reminder => ({
          contestId: reminder.contestId,
          platform: reminder.platform,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user profile information using JWT token
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token for authentication
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user profile data or error message
 */
const getUserProfile = async (req, res) => {
  try {
    // Validate Bearer token format
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing or invalid token format." });
    }

    // Extract and verify JWT token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Fetch user profile data
    const user = await userModels.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "User profile fetched successfully", user });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token." });
  }
};

/**
 * Update user profile information
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from JWT authentication middleware
 * @param {string} req.user.id - User ID
 * @param {Object} req.body - Request body containing profile updates
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user data or error message
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updatedUser = await userModels.updateProfile(userId, updates);

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reset user password using OTP verification
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing reset details
 * @param {string} req.body.email - User's email
 * @param {string} req.body.newPassword - New password to set
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate if email and newPassword are provided
    if (!email || !newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Check if the user exists in the database
    const user = await userModels.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset the password for the found user
    await userModels.resetPassword(email, newPassword);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, resetPassword };
