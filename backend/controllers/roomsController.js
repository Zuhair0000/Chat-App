const pool = require("../db");

exports.getRooms = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM rooms");
    res.json(results);
  } catch (err) {
    console.log(err);
  }
};
