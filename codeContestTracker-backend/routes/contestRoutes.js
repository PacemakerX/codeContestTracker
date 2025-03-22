const express = require("express");
const { getContests } = require("../controllers/contestController");

const router = express.Router();

// Route to fetch past 7 days and upcoming 30 days contests
router.get("/", getContests);

module.exports = router;
