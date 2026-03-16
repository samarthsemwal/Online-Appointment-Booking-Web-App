const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* MongoDB Connection */
mongoose.connect("mongodb://127.0.0.1:27017/doctorApp")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* Routes */
app.use("/api/auth",authRoutes);
app.use("/api/appointments",appointmentRoutes);

/* Server */
app.listen(5000,()=>{
console.log("Server running on port 5000");
});
