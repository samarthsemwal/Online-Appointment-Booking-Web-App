const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

// Model Imports
const ChatMessage = require("./models/ChatMessage");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO Server Configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* MongoDB Connection (Only auto-connect if not running Jest tests) */
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doctorApp";

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("✓ MongoDB Connected Successfully");
      try {
        const Appointment = require("./models/Appointment");
        await Appointment.syncIndexes();
        console.log("✓ Database-level Compound Unique Indexes Synced");
      } catch (idxErr) {
        console.log("Index sync notice:", idxErr.message);
      }
    })
    .catch((err) => {
      console.error("MongoDB Connection Warning:", err.message);
      console.log("Server will run; please ensure MongoDB is running at", MONGO_URI);
    });
}

/* Health Check API */
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "iCom Pro Telemedicine API",
    version: "2.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

/* Socket.IO Real-Time Communication & WebRTC Signaling */
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // User joins consultation room
  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`[Socket] ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("user-connected", { socketId: socket.id });
  });

  // Real-time chat message with MongoDB Persistence
  socket.on("send-message", async ({ roomId, appointmentId, message, sender, senderId, senderRole }) => {
    try {
      let savedMsg = null;
      if (appointmentId || roomId) {
        savedMsg = await ChatMessage.create({
          appointmentId: appointmentId || (roomId && roomId.startsWith("room_") ? roomId.replace("room_", "") : undefined),
          roomId: roomId || `room_${appointmentId}`,
          senderId: senderId || null,
          senderName: sender || "Participant",
          senderRole: senderRole || "patient",
          message: message
        });
      }

      const msgPayload = {
        _id: savedMsg ? savedMsg._id : Date.now().toString(),
        roomId,
        appointmentId,
        message,
        sender: sender || "Participant",
        senderRole: senderRole || "patient",
        timestamp: savedMsg ? savedMsg.createdAt : new Date()
      };

      io.to(roomId).emit("receive-message", msgPayload);
    } catch (err) {
      console.error("[Socket] Failed to persist chat message:", err);
      io.to(roomId).emit("receive-message", {
        message,
        sender,
        senderRole,
        timestamp: new Date()
      });
    }
  });

  // WebRTC Signaling: Offer
  socket.on("offer", ({ offer, roomId }) => {
    socket.to(roomId).emit("offer", offer);
  });

  // WebRTC Signaling: Answer
  socket.on("answer", ({ answer, roomId }) => {
    socket.to(roomId).emit("answer", answer);
  });

  // WebRTC Signaling: ICE Candidate
  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // Media toggles
  socket.on("media-toggle", ({ roomId, type, enabled, sender }) => {
    socket.to(roomId).emit("media-toggle", { type, enabled, sender });
  });

  // Consultation Ended
  socket.on("end-call", ({ roomId }) => {
    io.to(roomId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

/* Global Error Handler */
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

/* Server Startup (Only when not in test mode) */
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 iCom Pro Server running on http://localhost:${PORT}`);
    console.log(`💬 Socket.IO signaling ready for WebRTC & Chat`);
    console.log(`=================================================`);
  });
}

module.exports = { app, server };
