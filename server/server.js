const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");

dotenv.config();

// Model Imports
const ChatMessage = require("./models/ChatMessage");
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");

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

/* MongoDB Connection with Smart Auto-Fallback */
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doctorApp";

async function seedDefaultDataIfEmpty() {
  try {
    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      console.log("🌱 Auto-seeding initial doctors and test accounts...");
      const hashedPassword = await bcrypt.hash("password123", 10);

      const doctorsList = [
        {
          name: "Dr. Satish Malia",
          email: "satish@doc.com",
          speciality: "General Physician",
          qualifications: "MBBS, MD (General Medicine)",
          experienceYears: 10,
          consultationFee: 500,
          location: "New Delhi",
          rating: 4.9,
          img: "/images/doc1.png"
        },
        {
          name: "Dr. Sarah Johnson",
          email: "sarah@doc.com",
          speciality: "Dermatologist",
          qualifications: "MBBS, MD (Dermatology)",
          experienceYears: 8,
          consultationFee: 600,
          location: "Mumbai",
          rating: 4.8,
          img: "/images/doc2.png"
        },
        {
          name: "Dr. David Miller",
          email: "david@doc.com",
          speciality: "Cardiologist",
          qualifications: "MBBS, MD, DM (Cardiology)",
          experienceYears: 14,
          consultationFee: 800,
          location: "Bengaluru",
          rating: 5.0,
          img: "/images/doc3.png"
        },
        {
          name: "Dr. Emma Wilson",
          email: "emma@doc.com",
          speciality: "Pediatrician",
          qualifications: "MBBS, MD (Pediatrics)",
          experienceYears: 9,
          consultationFee: 550,
          location: "Noida",
          rating: 4.9,
          img: "/images/doc4.png"
        },
        {
          name: "Dr. Michael Brown",
          email: "michael@doc.com",
          speciality: "Neurologist",
          qualifications: "MBBS, MD, DM (Neurology)",
          experienceYears: 12,
          consultationFee: 750,
          location: "Gurugram",
          rating: 4.7,
          img: "/images/doc5.png"
        },
        {
          name: "Dr. Olivia Taylor",
          email: "olivia@doc.com",
          speciality: "Gynecologist",
          qualifications: "MBBS, MS (OBG)",
          experienceYears: 7,
          consultationFee: 650,
          location: "New Delhi",
          rating: 4.9,
          img: "/images/doc6.png"
        }
      ];

      for (const doc of doctorsList) {
        const u = await User.create({
          name: doc.name,
          email: doc.email,
          password: hashedPassword,
          role: "doctor",
          phone: "+91 98765 43210"
        });
        await Doctor.create({
          userId: u._id,
          speciality: doc.speciality,
          qualifications: doc.qualifications,
          experienceYears: doc.experienceYears,
          consultationFee: doc.consultationFee,
          location: doc.location,
          rating: doc.rating,
          img: doc.img
        });
      }

      // Seed Patient test account
      const p = await User.create({
        name: "Rahul Sharma",
        email: "rahul@patient.com",
        password: hashedPassword,
        role: "patient",
        phone: "+91 98111 22334"
      });
      await Patient.create({
        userId: p._id,
        age: 32,
        gender: "Male",
        bloodGroup: "B+",
        medicalHistory: ["Mild hypertension"]
      });

      console.log("✓ Default database seeded successfully!");
    }
  } catch (seedErr) {
    console.log("Seeding note:", seedErr.message);
  }
}

async function connectDB() {
  if (process.env.NODE_ENV === "test") return;

  try {
    // Try connecting with a 4s timeout
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log("✓ Connected to MongoDB Atlas / Remote Cluster Successfully");
    await Appointment.syncIndexes();
    await seedDefaultDataIfEmpty();
  } catch (err) {
    console.warn("⚠️ MongoDB Atlas connection timed out (IP whitelist / network).");
    console.log("⚡ Seamlessly Activating Built-in In-Memory MongoDB Engine...");

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const memoryMongo = await MongoMemoryServer.create();
      const memoryUri = memoryMongo.getUri();

      await mongoose.connect(memoryUri);
      console.log("✓ In-Memory MongoDB Engine running seamlessly at:", memoryUri);
      await Appointment.syncIndexes();
      await seedDefaultDataIfEmpty();
    } catch (memErr) {
      console.error("Failed to start in-memory database:", memErr.message);
    }
  }
}

connectDB();

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

/* Server Startup */
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 iCom Pro Server running on http://localhost:${PORT}`);
    console.log(`💬 Socket.IO signaling ready for WebRTC & Chat`);
    console.log(`=================================================`);
  });
}

module.exports = { app, server };
