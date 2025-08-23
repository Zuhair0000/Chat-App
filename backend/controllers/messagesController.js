const pool = require("../db");

exports.getMessagesByRoom = async (req, res) => {
  const { roomName } = req.params;

  try {
    const [messages] = await pool.execute(
      `
      SELECT msg.id, msg.content, u.username, r.name
      FROM messages msg
      JOIN users u ON msg.user_id = u.id
      JOIN rooms r ON msg.room_id = r.id
      WHERE r.name = ?
      ORDER BY msg.created_at ASC
      `,
      [roomName]
    );
    if (messages.length === 0) {
      res.json({ message: "failed to fetch messages" });
    }
    res.json(messages);
  } catch (err) {
    console.log(err);
  }
};
