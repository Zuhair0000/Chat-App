const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "chat_app",
});

pool
  .getConnection()
  .then(() => console.log("MySQL pool connected"))
  .catch((err) => console.error("DB connection failed: ", err.message));

module.exports = pool;
