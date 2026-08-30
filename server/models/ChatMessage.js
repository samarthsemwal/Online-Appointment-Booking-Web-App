const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true
    },
    roomId: {
      type: String,
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ["patient", "doctor", "system"],
      default: "patient"
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ["text", "system", "file"],
      default: "text"
    }
  },
  {
    timestamps: true
  }
);

// Index for high-speed chronological history retrieval
ChatMessageSchema.index({ appointmentId: 1, createdAt: 1 });
ChatMessageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
