const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({

doctor:String,
speciality:String,
location:String,
patient:String,
email:String,
date:String,
time:String

});

module.exports = mongoose.model("Appointment",AppointmentSchema);