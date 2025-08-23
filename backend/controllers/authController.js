const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.json("Username and Password are requiered");
  }

  try {
    const hahedPassword = await bcrypt.hash(password, 10);

    const [results] = await pool.execute(
      "INSERT INTO users(username, password) VALUES (?, ?)",
      [username, hahedPassword]
    );

    res.status(201).json("User registered successfully");
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.json("Username and Password are requiered");
  }

  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid Username" });
    }

    const user = users[0];

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
