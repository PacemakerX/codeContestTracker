const User = require("../models/userModel");

// @desc Get note for a contest
// @route GET /api/notes/:contestId
// @access Private
const getNote = async (req, res) => {
  try {
    const { contestId } = req.params;
    const user = await User.findById(req.user.id);
    
    // Find note using string comparison for contestId
    const note = user.notes.find((n) => n.contestId === String(contestId));

    if (note && note.note.trim() !== '') {
      return res.status(200).json({
        note: note.note,
        createdAt: note.createdAt,
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
    
    // Validate input
    if (!contestId) {
      return res.status(400).json({ message: "Contest ID is required" });
    }

    const user = await User.findById(req.user.id);

    // Convert contestId to string to match schema
    const stringContestId = String(contestId);

    // Find the index of the existing note with the same contestId
    const existingNoteIndex = user.notes.findIndex((n) => n.contestId === stringContestId);

    // Handle empty or whitespace-only notes
    if (!note || note.trim() === '') {
      // If note exists, remove it
      if (existingNoteIndex !== -1) {
        user.notes.splice(existingNoteIndex, 1);
        await user.save();
        return res.status(200).json({ message: "Note removed successfully" });
      }
      return res.status(400).json({ message: "Cannot add empty note" });
    }

    // If note exists for this contestId, update it
    if (existingNoteIndex !== -1) {
      user.notes[existingNoteIndex].note = note;
      user.notes[existingNoteIndex].createdAt = Date.now();
    } else {
      // If no existing note, add a new note
      user.notes.push({ 
        contestId: stringContestId, 
        note,
        createdAt: Date.now()
      });
    }

    await user.save();
    res.status(200).json({ message: "Note saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving note", error });
  }
};

module.exports = { getNote, addOrUpdateNote };