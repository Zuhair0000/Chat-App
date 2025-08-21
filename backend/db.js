const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const startDB = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "chat_app",
  });
  console.log("Connected to MySQL");
};

module.exports = startDB;
