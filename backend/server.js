const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
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
    credentials: true, // ✅ match client
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

app.get("/", (req, res) => {
  res.send("Chat app is running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const defaultRoomId = 1; // 👈 the ID of your 'general' room
  socket.join(defaultRoomId.toString()); // rooms in Socket.IO are strings

  socket.on("send_message", async (data) => {
    const { userId, content } = data;

    // Save to DB
    await pool.execute(
      "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
      [defaultRoomId, userId, content]
    );

    // Broadcast to everyone in room
    io.to(defaultRoomId.toString()).emit("receive_message", {
      userId,
      content,
      roomId: defaultRoomId,
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

//   io.on("connection", (socket) => {
//     console.log("User connected", socket.id);

//     socket.on("send_message", async (data) => {
//       const { roomId, userId, content } = data;
//       await db.execute(
//         "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
//         [roomId, userId, content]
//       );

//       io.to(roomId).emit("receive_message", {
//         userId,
//         content,
//         roomId,
//         created_at: new Date(),
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected", socket.id);
//     });
//   });
