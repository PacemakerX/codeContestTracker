const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, "any", { strictMode: false });
        },
        message: "Invalid phone number",
      },
    },
    bookmarkedContests: [
      {
        type: Number,
        ref: "Contest",
      },
    ],
    reminderPreferences: [
      {
        contestId: {
          type: Number,
          required: true,
        },
        platform: {
          type: String,
          enum: ["Codeforces", "CodeChef", "Leetcode"],
          required: true,
        },
        method: {
          type: String,
          enum: ["email", "sms"],
          default: "email",
        },
        timeBefore: {
          type: Number,
          default: 60, // Default: 60 minutes before the contest
        },
        contestTime: {
          type: Date, // Stores contest start time as Date object
          required: true,
        },
      },
    ],    
  },    
  { timestamps: true }
);

// Static method to register a new user
userSchema.statics.register = async function (
  username,
  email,
  password,
  phoneNumber,
  reminderPreferences
) {
  try {
    // Validate email format
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format.");
    }

    // Validate password strength
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

    // Validate phone number (if provided)
    if (
      phoneNumber &&
      !validator.isMobilePhone(phoneNumber, "any", { strictMode: false })
    ) {
      throw new Error("Invalid phone number format.");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = new this({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      reminderPreferences,
    });

    // Save to database
    return await user.save();
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

userSchema.statics.getUserById = async function (userId) {
  try {
    const user = await this.findById(userId).select("-password"); // Exclude password
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

userSchema.statics.login = async function (emailOrUsername, password) {
  try {
    // Determine if input is an email or username
    const isEmail = validator.isEmail(emailOrUsername);

    // Find user by email or username
    const user = await this.findOne(
      isEmail ? { email: emailOrUsername } : { username: emailOrUsername }
    );

    if (!user) {
      throw new Error("User not found.");
    }

    // Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  } catch (error) {
    throw new Error("Login failed: " + error.message);
  }
};

userSchema.statics.updateProfile = async function (userId, updates) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

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

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
