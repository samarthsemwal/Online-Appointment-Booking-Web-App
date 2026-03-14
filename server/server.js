const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/appointmentDB")
.then(()=>console.log("MongoDB Connected"))

const doctorSchema = new mongoose.Schema({
 name:String,
 specialization:String,
 image:String
})

const Doctor = mongoose.model("Doctor",doctorSchema)

const appointmentSchema = new mongoose.Schema({
 patientName:String,
 doctorId:String,
 date:String,
 time:String
})

const Appointment = mongoose.model("Appointment",appointmentSchema)

app.get("/api/doctors", async(req,res)=>{
 const doctors = await Doctor.find()
 res.json(doctors)
})

app.post("/api/doctors/add", async(req,res)=>{
 const doctor = new Doctor(req.body)
 await doctor.save()
 res.json("Doctor Added")
})

app.post("/api/appointments/book", async(req,res)=>{
 const appointment = new Appointment(req.body)
 await appointment.save()
 res.json("Appointment Booked")
})

app.listen(5000,()=>{
 console.log("Server running on port 5000")
})