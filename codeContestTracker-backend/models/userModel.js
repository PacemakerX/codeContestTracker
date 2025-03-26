const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

/**
 * User Schema Definition
 * Defines the structure and validation rules for user documents in MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    // Username field - required and must be unique
    username: {
      type: String,
      required: true,
      trim: true, // Removes whitespace from both ends
    },
    // Email field - required, unique, and must be valid email format
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    // Password field - required with minimum length of 6 characters
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Optional phone number field with validation
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, "any", { strictMode: false });
        },
        message: "Invalid phone number",
      },
    },
    // Array of bookmarked contest IDs
    bookmarkedContests: [
      {
        type: Number,
        ref: "Contest", // References the Contest model
      },
    ],
    // Array of reminder settings for contests
    reminderPreferences: [
      {
        contestId: {
          type: Number,
          required: true,
        },
        platform: {
          type: String,
          enum: ["Codeforces", "Codechef", "Leetcode"],
          required: true,
        },
        method: {
          type: String,
          enum: ["email", "sms"],
          default: "email",
        },
        timeBefore: {
          type: Number,
          default: 60, // Minutes before contest to send reminder
        },
        contestTime: {
          type: Date,
          required: true,
        },
      },
    ],
    // Array of user notes for contests
    notes: [
      {
        contestId: {
          type: String,
          required: true,
        },
        note: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

/**
 * Static method to register a new user
 * @param {string} username - User's chosen username
 * @param {string} email - User's email address
 * @param {string} password - User's password (will be hashed)
 * @param {string} phoneNumber - Optional phone number
 * @param {Array} reminderPreferences - Optional initial reminder settings
 * @returns {Promise<Object>} Newly created user object
 * @throws {Error} If validation fails or user creation fails
 */
userSchema.statics.register = async function (
  username,
  email,
  password,
  phoneNumber,
  reminderPreferences
) {
  try {
    // Email validation
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format.");
    }

    // Password strength validation
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      throw new Error(
        "Weak password. It must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
    }

    // Phone number validation (if provided)
    if (
      phoneNumber &&
      !validator.isMobilePhone(phoneNumber, "any", { strictMode: false })
    ) {
      throw new Error("Invalid phone number format.");
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance
    const user = new this({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      reminderPreferences,
    });

    return await user.save();
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

/**
 * Static method to fetch user by ID
 * @param {string} userId - MongoDB _id of the user
 * @returns {Promise<Object>} User object without password
 * @throws {Error} If user not found or fetch fails
 */
userSchema.statics.getUserById = async function (userId) {
  try {
    const user = await this.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

/**
 * Static method to authenticate user login
 * @param {string} emailOrUsername - User's email or username
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object without password
 * @throws {Error} If authentication fails
 */
userSchema.statics.login = async function (emailOrUsername, password) {
  try {
    // Check if input is email or username
    const isEmail = validator.isEmail(emailOrUsername);

    // Find user in database
    const user = await this.findOne(
      isEmail ? { email: emailOrUsername } : { username: emailOrUsername }
    );

    if (!user) {
      throw new Error("User not found.");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  } catch (error) {
    throw new Error("Login failed: " + error.message);
  }
};

/**
 * Static method to update user profile
 * @param {string} userId - MongoDB _id of the user
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If update fails
 */
userSchema.statics.updateProfile = async function (userId, updates) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Update only provided fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    await user.save();
    return user;
  } catch (error) {
    throw new Error("Profile update failed: " + error.message);
  }
};

// Create and export the User model
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
