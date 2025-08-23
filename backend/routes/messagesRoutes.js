const express = require("express");
const { getMessagesByRoom } = require("../controllers/messagesController");
const router = express.Router();

router.get("/:roomName", getMessagesByRoom);

module.exports = router;
