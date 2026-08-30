const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/authMiddleware");

// =========================================================================
// GET PERSISTED CHAT HISTORY FOR APPOINTMENT / ROOM
// GET /api/chat/:appointmentId
// =========================================================================
router.get("/:appointmentId", protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment consultation room not found."
      });
    }

    // Verify participant authorization
    const isAuthorized =
      appointment.patientId.toString() === req.user._id.toString() ||
      appointment.doctorId.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this consultation chat history."
      });
    }

    const messages = await ChatMessage.find({
      $or: [{ appointmentId }, { roomId: appointment.meetingRoomId }]
    })
      .sort({ createdAt: 1 })
      .limit(200);

    const formattedMessages = messages.map((m) => ({
      _id: m._id,
      roomId: m.roomId,
      sender: m.senderName,
      senderId: m.senderId,
      senderRole: m.senderRole,
      message: m.message,
      timestamp: m.createdAt
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (err) {
    console.error("Chat History Retrieval Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch consultation chat history",
      details: err.message
    });
  }
});

// =========================================================================
// POST MESSAGE TO PERSISTED CHAT (REST Fallback)
// POST /api/chat/:appointmentId
// =========================================================================
router.post("/:appointmentId", protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message content cannot be empty."
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found."
      });
    }

    const chatMsg = await ChatMessage.create({
      appointmentId,
      roomId: appointment.meetingRoomId || `room_${appointmentId}`,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: {
        _id: chatMsg._id,
        roomId: chatMsg.roomId,
        sender: chatMsg.senderName,
        senderId: chatMsg.senderId,
        senderRole: chatMsg.senderRole,
        message: chatMsg.message,
        timestamp: chatMsg.createdAt
      }
    });
  } catch (err) {
    console.error("Save Chat Message Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to persist chat message",
      details: err.message
    });
  }
});

module.exports = router;
