const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const { protect, authorize } = require("../middleware/authMiddleware");

// =========================================================================
// CREATE PRESCRIPTION (DOCTOR ONLY)
// POST /api/prescriptions
// =========================================================================
router.post("/", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const {
      appointmentId,
      diagnosis,
      symptoms,
      medicines = [],
      clinicalAdvice,
      followUpDate
    } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        error: "Appointment ID and Diagnosis are required."
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found."
      });
    }

    // Verify doctor role
    if (req.user.role !== "doctor" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only registered doctors can issue prescriptions."
      });
    }

    // Create or update prescription
    let prescription = await Prescription.findOne({ appointmentId });

    if (prescription) {
      prescription.diagnosis = diagnosis;
      prescription.symptoms = symptoms || prescription.symptoms;
      prescription.medicines = medicines;
      prescription.clinicalAdvice = clinicalAdvice || prescription.clinicalAdvice;
      prescription.followUpDate = followUpDate || prescription.followUpDate;
      await prescription.save();
    } else {
      prescription = await Prescription.create({
        appointmentId,
        doctorId: req.user._id,
        patientId: appointment.patientId,
        diagnosis,
        symptoms,
        medicines,
        clinicalAdvice: clinicalAdvice || "Take medications on time and stay well hydrated.",
        followUpDate: followUpDate || ""
      });

      // Link to appointment and set status to completed
      appointment.prescriptionId = prescription._id;
      appointment.status = "completed";
      await appointment.save();
    }

    res.status(201).json({
      success: true,
      message: "Prescription issued successfully",
      prescription
    });
  } catch (err) {
    console.error("Prescription Creation Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create prescription",
      details: err.message
    });
  }
});

// =========================================================================
// GET PRESCRIPTION FOR AN APPOINTMENT
// GET /api/prescriptions/appointment/:appointmentId
// =========================================================================
router.get("/appointment/:appointmentId", protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({ appointmentId })
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: "No prescription found for this appointment."
      });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch prescription",
      details: err.message
    });
  }
});

module.exports = router;
