const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const roomsRoutes = require("./routes/roomsRoutes");

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/rooms", roomsRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const { roomId, userId, content } = data;

    await pool.execute(
      "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
      [roomId, userId, content]
    );

    const [[user]] = await pool.query(
      "SELECT username FROM users WHERE id = ?",
      [userId]
    );
    io.to(roomId).emit("receive_message", {
      roomId,
      userId,
      username: user.username,
      content,
      created_at: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("Server is running");
});
