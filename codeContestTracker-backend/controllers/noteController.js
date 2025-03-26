const User = require("../models/userModel");

// @desc Get note for a contest
// @route GET /api/notes/:contestId
// @access Private
const getNote = async (req, res) => {
  try {
    const { contestId } = req.params;
    const user = await User.findById(req.user.id);
    // Check if the note exists for the given contestId
    const note = user.notes.find((n) => n.contestId === contestId);

    if (note) {
      return res.status(200).json({
        note: note.note, // Send the note content
        createdAt: note.createdAt, // Send the createdAt timestamp
      });
    } else {
      return res
        .status(404)
        .json({ message: "No note found for this contest." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching note", error });
  }
};

// @desc Add or update note for a contest
// @route POST /api/notes
// @access Private
const addOrUpdateNote = async (req, res) => {
  try {
    const { contestId, note } = req.body;
    const user = await User.findById(req.user.id);

    // Check if the note already exists for this contest
    const existingNote = user.notes.find((n) => n.contestId === contestId);

    if (existingNote) {
      // Update existing note

      existingNote.note = note;
      if (note == "") {
      }
      existingNote.createdAt = Date.now();
    } else {
      // Add a new note
      user.notes.push({ contestId, note });
    }

    await user.save();
    res.status(200).json({ message: "Note saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving note", error });
  }
};

module.exports = { getNote, addOrUpdateNote };
