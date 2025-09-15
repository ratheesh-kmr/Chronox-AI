// src/socket.js
import { io } from "socket.io-client";


const socket = io("https://chronox-server.xicsolutions.in/", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
    