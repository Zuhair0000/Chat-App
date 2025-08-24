import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import Navbar from "./Navbar";

const ChatRoom = () => {
  const [roomId, setRoomId] = useState("general");
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("user");
    if (userId) {
      setUser(JSON.parse(userId));
    }
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch("http://localhost:3001/api/rooms");
      const data = await res.json();
      setRooms(data);

      if (data.length > 0) {
        setRoomId(data[0].id);
        setRoomName(data[0].name);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    socket.emit("join_room", roomId);

    const fetchMessages = async () => {
      const res = await fetch(`http://localhost:3001/api/messages/${roomId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    };
    fetchMessages();

    socket.on("receive_message", (data) => {
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      const msgData = {
        roomId,
        userId: user.id,
        username: user.username,
        content: message,
      };
      socket.emit("send_message", msgData);
      setMessage("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r shadow-lg p-4 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-gray-700">Rooms</h3>
          <ul className="space-y-2 flex-1 overflow-y-auto">
            {rooms.map((r) => (
              <li
                key={r.id}
                onClick={() => {
                  setRoomId(r.id);
                  setRoomName(r.name);
                }}
                className={`cursor-pointer px-3 py-2 rounded-lg transition ${
                  roomId === r.id
                    ? "bg-blue-500 text-white shadow"
                    : "hover:bg-gray-200 text-gray-700"
                }`}
              >
                {r.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b p-4 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Room: {roomName}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${
                    msg.username === user?.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm max-w-xs ${
                      msg.username === user?.username
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold">{msg.username}</p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t p-4 flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
