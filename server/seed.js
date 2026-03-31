const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/doctorApp")
.then(async () => {
  console.log("MongoDB Connected");
  
  // Clear old doctors
  await User.deleteMany({ role: "doctor" });

  const doctors = [
    {
      name: "Dr Satish malia",
      email: "satish@doc.com",
      password: "password123",
      role: "doctor",
      speciality: "General Physician",
      location: "Delhi",
      experience: "10 Years",
      fee: 500,
      img: "/images/doc1.png" 
    },
    {
      name: "Dr Sarah Johnson",
      email: "sarah@doc.com",
      password: "password123",
      role: "doctor",
      speciality: "Dermatologist",
      location: "Mumbai",
      experience: "8 Years",
      fee: 600,
      img: "/images/doc2.png"
    },
    {
      name: "Dr David Miller",
      email: "david@doc.com",
      password: "password123",
      role: "doctor",
      speciality: "Cardiologist",
      location: "Lucknow",
      experience: "12 Years",
      fee: 700,
      img: "/images/doc3.png"
    },
    {
      name: "Dr Emma Wilson",
      email: "emma@doc.com",
      password: "password123",
      role: "doctor",
      speciality: "Pediatrician",
      location: "Noida",
      experience: "9 Years",
      fee: 550,
      img: "/images/doc4.png"
    },
    {
      name: "Dr Michael Brown",
      email: "michael@doc.com",
      password: "password123",
      role: "doctor",
      speciality: "Neurologist",
      location: "Ghaziabad",
      experience: "11 Years",
      fee: 750,
      img: "/images/doc5.png"
    },
    {
      name: "Dr Olivia Taylor",
      email: "olivia@doc.com",
      password: "password123",
      role: "doctor",
      speciality: "Gynecologist",
      location: "Delhi",
      experience: "7 Years",
      fee: 650,
      img: "/images/doc6.png"
    }
  ];

  await User.insertMany(doctors);
  console.log("Doctors seeded successfully!");
  process.exit();
})
.catch(err => {
  console.log(err);
  process.exit(1);
});
