const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    event: { type: String, required: true }, // Contest name
    host: { type: String, required: true }, // Platform (Codeforces, LeetCode, etc.)
    href: { type: String, required: true }, // Contest URL
    start: { type: Date, required: true }, // Start time
    end: { type: Date, required: true }, // End time
    duration: { type: Number, required: true }, // Duration in seconds
    resource_id: { type: Number, required: true }, // Platform ID from Clist API
    youtubeSolution: { type: String, default: null }, // YouTube solution link (fetched automatically)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);
