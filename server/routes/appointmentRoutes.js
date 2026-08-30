const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// =========================================================================
// BOOK APPOINTMENT
// POST /api/appointments
// Enforces database-level compound unique index to prevent double-booking
// Uses authenticated req.user.id for patientId (prevents identity spoofing)
// =========================================================================
router.post("/", protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, fee } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: "Doctor ID, date, and time slot are required."
      });
    }

    // Verify doctor exists
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== "doctor") {
      return res.status(404).json({
        success: false,
        error: "Doctor not found or user is not a registered doctor."
      });
    }

    // Fetch doctor profile for consultation fee
    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    const consultationFee = fee || (doctorProfile ? doctorProfile.consultationFee : 500);

    // Create new appointment document
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      doctorProfileId: doctorProfile ? doctorProfile._id : null,
      date,
      timeSlot,
      symptoms: symptoms || "General Consultation",
      consultationFee,
      status: "confirmed",
      paymentStatus: "pending"
    });

    // Save with Mongoose (triggers Mongo compound unique index check)
    await newAppointment.save();

    // Populate for clean response
    const populated = await Appointment.findById(newAppointment._id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name email phone");

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: populated
    });
  } catch (err) {
    // Catch Mongo 11000 Duplicate Key Error (Double-Booking Race Condition)
    if (err.code === 11000 || (err.name === "MongoServerError" && err.code === 11000)) {
      return res.status(409).json({
        success: false,
        error: "Double-booking prevented: This doctor is already booked for the selected date and time slot. Please choose another slot.",
        code: "SLOT_ALREADY_BOOKED"
      });
    }

    console.error("Booking Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to book appointment",
      details: err.message
    });
  }
});

// =========================================================================
// GET PATIENT'S APPOINTMENTS (MY APPOINTMENTS)
// GET /api/appointments/my (or GET /api/appointments)
// Closes URL-parameter identity spoofing vulnerability
// =========================================================================
router.get("/my", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate("doctorId", "name email phone")
      .populate("doctorProfileId", "speciality location img consultationFee hospital")
      .populate("paymentId")
      .populate("prescriptionId")
      .sort({ createdAt: -1 });

    // Format output with fallbacks for legacy/new frontend compatibility
    const formatted = appointments.map((app) => {
      const doc = app.doctorId || {};
      const profile = app.doctorProfileId || {};
      return {
        _id: app._id,
        doctor: doc.name || "Doctor",
        doctorId: doc._id || app.doctorId,
        speciality: profile.speciality || "Specialist",
        location: profile.location || "Online",
        img: profile.img || "/images/doc1.png",
        date: app.date,
        time: app.timeSlot,
        timeSlot: app.timeSlot,
        status: app.status,
        symptoms: app.symptoms,
        consultationFee: app.consultationFee,
        paymentStatus: app.paymentStatus,
        paymentId: app.paymentId,
        prescriptionId: app.prescriptionId,
        meetingRoomId: app.meetingRoomId || `room_${app._id}`,
        createdAt: app.createdAt
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointments",
      details: err.message
    });
  }
});

// =========================================================================
// GET DOCTOR'S APPOINTMENTS (DOCTOR DASHBOARD)
// GET /api/appointments/doctor
// Enforces that only the authenticated doctor can retrieve their schedule
// =========================================================================
router.get("/doctor", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Only doctors can view doctor appointments."
      });
    }

    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate("patientId", "name email phone")
      .populate("paymentId")
      .populate("prescriptionId")
      .sort({ date: 1, timeSlot: 1 });

    const formatted = appointments.map((app) => {
      const patient = app.patientId || {};
      return {
        _id: app._id,
        patient: patient.name || "Patient",
        patientEmail: patient.email || "",
        patientPhone: patient.phone || "",
        patientId: patient._id || app.patientId,
        date: app.date,
        time: app.timeSlot,
        timeSlot: app.timeSlot,
        status: app.status,
        symptoms: app.symptoms,
        consultationFee: app.consultationFee,
        paymentStatus: app.paymentStatus,
        paymentId: app.paymentId,
        prescriptionId: app.prescriptionId,
        meetingRoomId: app.meetingRoomId || `room_${app._id}`,
        createdAt: app.createdAt
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctor appointments",
      details: err.message
    });
  }
});

// =========================================================================
// GET ALL APPOINTMENTS (COMPATIBILITY FALLBACK ROUTE)
// GET /api/appointments
// Checks req.query or defaults to req.user's role
// =========================================================================
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "doctor") {
      query.doctorId = req.user._id;
    } else {
      query.patientId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate("doctorId", "name email phone")
      .populate("doctorProfileId", "speciality location img")
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });

    const formatted = appointments.map((app) => {
      const doc = app.doctorId || {};
      const profile = app.doctorProfileId || {};
      const patient = app.patientId || {};
      return {
        _id: app._id,
        doctor: doc.name || "Doctor",
        doctorId: doc._id || app.doctorId,
        patient: patient.name || "Patient",
        patientId: patient._id || app.patientId,
        speciality: profile.speciality || "General",
        location: profile.location || "Online",
        date: app.date,
        time: app.timeSlot,
        timeSlot: app.timeSlot,
        status: app.status,
        consultationFee: app.consultationFee,
        paymentStatus: app.paymentStatus,
        meetingRoomId: app.meetingRoomId || `room_${app._id}`
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointments",
      details: err.message
    });
  }
});

// =========================================================================
// GET SINGLE APPOINTMENT BY ID
// GET /api/appointments/:id
// =========================================================================
router.get("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name email phone")
      .populate("doctorProfileId")
      .populate("paymentId")
      .populate("prescriptionId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found"
      });
    }

    // Verify requesting user is participant (patient, doctor, or admin)
    const isParticipant =
      appointment.patientId._id.toString() === req.user._id.toString() ||
      appointment.doctorId._id.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this appointment."
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointment",
      details: err.message
    });
  }
});

// =========================================================================
// CANCEL APPOINTMENT
// DELETE /api/appointments/:id
// Sets status to 'cancelled', which frees up the slot in the compound index
// =========================================================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found"
      });
    }

    // Verify ownership
    const isOwner =
      appointment.patientId.toString() === req.user._id.toString() ||
      appointment.doctorId.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to cancel this appointment."
      });
    }

    // Update status to 'cancelled' (releases partial unique index)
    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully. Slot is now available."
    });
  } catch (err) {
    console.error("Cancel Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to cancel appointment",
      details: err.message
    });
  }
});

module.exports = router;
