const pool = require("../db");

exports.getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [messages] = await pool.execute(
      `
      SELECT msg.id, msg.content, u.username, r.name
      FROM messages msg
      JOIN users u ON msg.user_id = u.id
      JOIN rooms r ON msg.room_id = r.id
      WHERE msg.room_id = ?
      ORDER BY msg.created_at ASC
      `,
      [roomId]
    );
    if (messages.length === 0) {
      return res.json([]);
    }
    res.json(messages);
  } catch (err) {
    console.log(err);
  }
};
