const express = require("express");
const { getRooms } = require("../controllers/roomsController");
const router = express.Router();

router.get("/", getRooms);

module.exports = router;
