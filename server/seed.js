const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
const Payment = require("./models/Payment");
const Prescription = require("./models/Prescription");
const ChatMessage = require("./models/ChatMessage");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doctorApp";

async function seed() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // Clear existing data across all 7 collections
    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await Prescription.deleteMany({});
    await ChatMessage.deleteMany({});

    console.log("Creating default users with bcrypt hashed passwords...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Doctors Data
    const doctorData = [
      {
        name: "Dr. Satish Malia",
        email: "satish@doc.com",
        password: hashedPassword,
        role: "doctor",
        phone: "+91 98765 43210",
        speciality: "General Physician",
        qualifications: "MBBS, MD (Internal Medicine)",
        experienceYears: 10,
        consultationFee: 500,
        location: "New Delhi",
        hospital: "Apollo Telehealth Clinic",
        bio: "Senior General Physician with over a decade of clinical experience in preventative and acute adult care.",
        rating: 4.9,
        totalReviews: 48,
        img: "/images/doc1.png"
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah@doc.com",
        password: hashedPassword,
        role: "doctor",
        phone: "+91 98765 43211",
        speciality: "Dermatologist",
        qualifications: "MBBS, DVD, MD (Dermatology)",
        experienceYears: 8,
        consultationFee: 600,
        location: "Mumbai",
        hospital: "Skin & Glow Institute",
        bio: "Specializing in clinical dermatology, acne therapies, and modern skincare diagnostics.",
        rating: 4.8,
        totalReviews: 32,
        img: "/images/doc2.png"
      },
      {
        name: "Dr. David Miller",
        email: "david@doc.com",
        password: hashedPassword,
        role: "doctor",
        phone: "+91 98765 43212",
        speciality: "Cardiologist",
        qualifications: "MBBS, MD, DM (Cardiology), FACC",
        experienceYears: 14,
        consultationFee: 800,
        location: "Bengaluru",
        hospital: "Fortis Heart Center",
        bio: "Renowned Cardiologist focusing on coronary interventions, heart failure management, and preventive cardiology.",
        rating: 5.0,
        totalReviews: 64,
        img: "/images/doc3.png"
      },
      {
        name: "Dr. Emma Wilson",
        email: "emma@doc.com",
        password: hashedPassword,
        role: "doctor",
        phone: "+91 98765 43213",
        speciality: "Pediatrician",
        qualifications: "MBBS, DCH, MD (Pediatrics)",
        experienceYears: 9,
        consultationFee: 550,
        location: "Noida",
        hospital: "Rainbow Children's Care",
        bio: "Passionate child healthcare specialist focusing on developmental milestones and pediatric nutrition.",
        rating: 4.9,
        totalReviews: 29,
        img: "/images/doc4.png"
      },
      {
        name: "Dr. Michael Brown",
        email: "michael@doc.com",
        password: hashedPassword,
        role: "doctor",
        phone: "+91 98765 43214",
        speciality: "Neurologist",
        qualifications: "MBBS, MD, DM (Neurology)",
        experienceYears: 12,
        consultationFee: 750,
        location: "Gurugram",
        hospital: "Max Super Specialty Hospital",
        bio: "Expert neurologist managing migraine, neuropathy, stroke recovery, and epilepsy therapies.",
        rating: 4.7,
        totalReviews: 41,
        img: "/images/doc5.png"
      },
      {
        name: "Dr. Olivia Taylor",
        email: "olivia@doc.com",
        password: hashedPassword,
        role: "doctor",
        phone: "+91 98765 43215",
        speciality: "Gynecologist",
        qualifications: "MBBS, MS (OBG), DGO",
        experienceYears: 7,
        consultationFee: 650,
        location: "New Delhi",
        hospital: "Fortis La Femme Hospital",
        bio: "Dedicated women's health physician focusing on maternal care, prenatal wellness, and reproductive endocrinology.",
        rating: 4.9,
        totalReviews: 53,
        img: "/images/doc6.png"
      }
    ];

    console.log("Seeding doctors and doctor profiles...");
    const createdDoctors = [];
    for (const doc of doctorData) {
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password, // Pre-hashed
        role: "doctor",
        phone: doc.phone
      });

      const profile = await Doctor.create({
        userId: user._id,
        speciality: doc.speciality,
        qualifications: doc.qualifications,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        location: doc.location,
        hospital: doc.hospital,
        bio: doc.bio,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        img: doc.img
      });

      createdDoctors.push({ user, profile });
    }

    // 2. Patients Data
    console.log("Seeding patient accounts...");
    const patientUser1 = await User.create({
      name: "Rahul Sharma",
      email: "rahul@patient.com",
      password: hashedPassword,
      role: "patient",
      phone: "+91 98111 22334"
    });

    await Patient.create({
      userId: patientUser1._id,
      age: 32,
      gender: "Male",
      bloodGroup: "B+",
      medicalHistory: ["Mild hypertension"],
      allergies: ["Penicillin"]
    });

    const patientUser2 = await User.create({
      name: "Priya Patel",
      email: "priya@patient.com",
      password: hashedPassword,
      role: "patient",
      phone: "+91 98222 33445"
    });

    await Patient.create({
      userId: patientUser2._id,
      age: 27,
      gender: "Female",
      bloodGroup: "O+",
      medicalHistory: ["None"]
    });

    // 3. Sample Initial Appointment
    console.log("Seeding initial appointment...");
    const initialAppointment = await Appointment.create({
      patientId: patientUser1._id,
      doctorId: createdDoctors[0].user._id,
      doctorProfileId: createdDoctors[0].profile._id,
      date: "2026-09-02",
      timeSlot: "10:00 AM",
      status: "confirmed",
      symptoms: "Routine seasonal checkup and mild allergy assessment.",
      consultationFee: 500,
      paymentStatus: "paid"
    });

    // 4. Sample Initial Payment
    await Payment.create({
      appointmentId: initialAppointment._id,
      patientId: patientUser1._id,
      doctorId: createdDoctors[0].user._id,
      razorpayOrderId: "order_mock_seed_1001",
      razorpayPaymentId: "pay_mock_seed_2001",
      razorpaySignature: "sig_mock_verified_hmac256",
      amount: 500,
      currency: "INR",
      status: "captured",
      verifiedAt: new Date()
    });

    // 5. Initial Persisted Chat Message
    await ChatMessage.create({
      appointmentId: initialAppointment._id,
      roomId: `room_${initialAppointment._id}`,
      senderId: createdDoctors[0].user._id,
      senderName: createdDoctors[0].user.name,
      senderRole: "doctor",
      message: "Hello Rahul! Welcome to iCom Pro. Please upload any previous medical reports before our video consultation."
    });

    console.log("=========================================");
    console.log("✓ Database successfully seeded!");
    console.log("=========================================");
    console.log("Test Doctor Credentials:");
    console.log("  Email: satish@doc.com | Password: password123");
    console.log("  Email: david@doc.com  | Password: password123 (Cardiologist)");
    console.log("Test Patient Credentials:");
    console.log("  Email: rahul@patient.com | Password: password123");
    console.log("=========================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seed();
