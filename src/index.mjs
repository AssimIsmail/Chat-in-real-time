import express from "express";
import session from "express-session";
import passport from "./config/passport.mjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes/routes.mjs";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
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
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/teste3", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Routes
app.use(routes);

const saveMessageToDatabase = async (senderId, groupId, content, messageType = 'text') => {
  // Import your model here if not already
  const Message = require('./models/convergroup.mjs'); // Assuming convergroup.mjs is the model file
  const newMessage = new Message({
    sender: senderId,
    group: groupId,
    messageType: messageType,
    content: content,
  });
  await newMessage.save();
  return newMessage.populate('sender');
};

// Serveur Node.js avec Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a group
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  // Handle group messages
  socket.on('groupMessage', async (data) => {
    const { senderId, groupId, content } = data;

    try {
      const newMessage = await saveMessageToDatabase(senderId, groupId, content); // Function to save message to database

      io.to(groupId).emit('groupMessage', newMessage); // Emit the new message to all clients in the group
    } catch (error) {
      console.error('Error handling group message:', error);
    }
  });

  // Handle conversation messages
  socket.on('message', async (data) => {
    const { senderId, conversationId, content } = data;

    try {
      const newMessage = await saveMessageToDatabase(senderId, conversationId, content); // Function to save message to database

      io.to(conversationId).emit('message', newMessage); // Emit the new message to all clients in the conversation
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
