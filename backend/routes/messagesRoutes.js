const express = require("express");
const { getMessagesByRoom } = require("../controllers/messagesController");
const router = express.Router();

router.get("/:roomId", getMessagesByRoom);

module.exports = router;
