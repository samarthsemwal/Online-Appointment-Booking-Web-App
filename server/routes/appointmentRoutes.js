const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");


// ===============================
// Book Appointment
// POST /api/appointments
// ===============================

router.post("/", async (req, res) => {

try {

const appointment = new Appointment(req.body);

await appointment.save();

res.json({
message: "Appointment booked successfully"
});

} catch (err) {

res.status(500).json({
error: "Failed to book appointment",
details: err
});

}

});


// ===============================
// Get All Appointments
// GET /api/appointments
// ===============================

router.get("/", async (req, res) => {

try {

const appointments = await Appointment.find();

res.json(appointments);

} catch (err) {

res.status(500).json({
error: "Failed to fetch appointments",
details: err
});

}

});


// ===============================
// Cancel Appointment
// DELETE /api/appointments/:id
// ===============================

router.delete("/:id", async (req, res) => {

try {

await Appointment.findByIdAndDelete(req.params.id);

res.json({
message: "Appointment cancelled successfully"
});

} catch (err) {

res.status(500).json({
error: "Failed to cancel appointment",
details: err
});

}

});


module.exports = router;