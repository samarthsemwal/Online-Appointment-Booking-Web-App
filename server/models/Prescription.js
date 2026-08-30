const mongoose = require("mongoose");

const MedicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "Twice a day (After food)"
  duration: { type: String, required: true }, // e.g. "5 days"
  instructions: { type: String, default: "" }
});

const PrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"]
    },
    symptoms: {
      type: String,
      default: ""
    },
    medicines: [MedicineItemSchema],
    clinicalAdvice: {
      type: String,
      default: "Drink plenty of water and get adequate rest."
    },
    followUpDate: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
