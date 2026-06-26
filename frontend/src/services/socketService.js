import { io } from "socket.io-client";

const SOCKET_URL =  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

let socket = null;

export function connectSocket(userId) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });
  }

  if (userId) {
    socket.emit("user:join", Number(userId));
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function sendChatMessage(senderId, receiverId, content, callback) {
  if (!socket) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(
    "chat:send",
    {
      senderId: Number(senderId),
      receiverId: Number(receiverId),
      content
    },
    callback
  );
}

export function notifyTripShareResponse(payload) {
  if (!socket) {
    return;
  }

  socket.emit("trip_share:respond", payload);
}