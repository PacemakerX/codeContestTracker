const express = require("express");
/**
 * @fileoverview Route module for contest-related endpoints
 * @module contestRoutes
 * @requires ../controllers/contestController
 * 
 * @description This file handles the routing for contest-related operations
 * by importing the necessary controller functions from contestController.
 * The getContests function is destructured from the contestController module
 * to handle requests for fetching contest data.
 * 
 * @see {@link ../controllers/contestController}
 */
const { getContests } = require("../controllers/contestController");

const router = express.Router();

// Route to fetch past 7 days and upcoming 30 days contests
router.get("/", getContests);

module.exports = router;
