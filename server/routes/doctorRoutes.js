const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===============================
// Get All Doctors
// GET /api/doctors
// ===============================

router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors", details: err });
  }
});

// ===============================
// Get Doctor By ID
// GET /api/doctors/:id
// ===============================

router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctor", details: err });
  }
});

module.exports = router;
