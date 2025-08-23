import React, { useState, useEffect } from "react";
import socket from "../socket";
import Navbar from "./Navbar";

const ChatRoom = () => {
  const [roomId, setRoomId] = useState("general");
  const [user, setUser] = useState(null); // replace with real user id from auth
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user");
    if (userId) {
      setUser(JSON.parse(userId));
    }
  }, []);
  // Join room when mounted
  useEffect(() => {
    socket.emit("join_room", roomId);

    // Listen for messages
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [roomId]);

  // Send a message
  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", {
        roomId: 1,
        userId: user.id,
        content: message,
      });
      setMessage("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Room: {roomId}</h2>

        <div className="border p-3 h-64 overflow-y-auto mb-3 rounded">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <span className="font-semibold">{msg.userId}: </span>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
