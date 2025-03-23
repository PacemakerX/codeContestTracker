const userModels = require("../models/userModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

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

const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      throw new Error("Invalid login credentials");
    }

    // Fetch user by either email or username
    const user = await userModels.login(emailOrUsername, password);

    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bookmarks: user.bookmarkedContests,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing or invalid token format." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      // Fix: Use decoded.id instead of decoded.email
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await userModels.getUserById(decoded.id); // Fix: Call the correct method
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

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated via JWT
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

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
