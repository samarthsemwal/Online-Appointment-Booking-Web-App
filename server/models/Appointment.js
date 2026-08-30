const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"]
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor ID is required"]
    },
    doctorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor"
    },
    date: {
      type: String,
      required: [true, "Appointment date is required (YYYY-MM-DD)"]
    },
    timeSlot: {
      type: String,
      required: [true, "Appointment time slot is required (e.g. 10:00 AM)"]
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed"
    },
    symptoms: {
      type: String,
      default: "General consultation"
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 500
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending"
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription"
    },
    meetingRoomId: {
      type: String,
      default: function () {
        return `room_${this._id}`;
      }
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// DATABASE-LEVEL COMPOUND UNIQUE INDEX TO PREVENT DOUBLE BOOKING
// Enforces that no doctor can have two active (non-cancelled) appointments for the same date and time slot.
// Uses MongoDB $in operator supported by partialFilterExpression.
AppointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed", "completed"] } }
  }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);