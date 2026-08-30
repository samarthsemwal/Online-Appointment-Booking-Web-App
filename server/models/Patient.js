const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    age: {
      type: Number,
      default: 30
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male"
    },
    bloodGroup: {
      type: String,
      default: "O+"
    },
    medicalHistory: {
      type: [String],
      default: []
    },
    allergies: {
      type: [String],
      default: []
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" }
    },
    address: {
      city: { type: String, default: "Delhi" },
      state: { type: String, default: "Delhi" },
      pincode: { type: String, default: "110001" }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Patient", PatientSchema);
