const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({

doctor:String,
doctorId:String,
speciality:String,
location:String,

patient:String,
email:String,

date:String,
time:String,

patientId:String

});

module.exports = mongoose.model("Appointment",AppointmentSchema);