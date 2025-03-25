const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/**
 * Authentication Middleware
 * Validates JWT tokens and authenticates users for protected routes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract the JWT token from the Authorization header
    // Expected format: "Bearer <token>"
    const token = req.header("Authorization")?.split(" ")[1];

    // Check if token exists in the request header
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied: No token provided" });
    }

    // Verify the token using the JWT_SECRET from environment variables
    // This will throw an error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the decoded token
    // Exclude the password field from the returned user object
    req.user = await User.findById(decoded.id).select("-password");

    // Check if the user still exists in the database
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    // If everything is valid, proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle invalid tokens, expired tokens, or other JWT-related errors
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Export the middleware for use in other parts of the application
module.exports = authenticate;
