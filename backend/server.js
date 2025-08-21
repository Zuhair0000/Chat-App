const express = requrie("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const startDB = require("./db");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

const startServer = async () => {
  const db = await startDB();

  app.get("/", (req, res) => {
    res.send("Chat app is running");
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
  });

  socket.on("send_message", async (data) => {
    const { roomId, userId, content } = data;
    await db.execute(
      "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
      [roomId, userId, content]
    );

    io.to(roomId).emit("receive_message", {
      userId,
      content,
      roomId,
      created_at: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
};

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("Server is running");
});

startServer().catch((err) => {
  console.error("Failed to start server");
});
