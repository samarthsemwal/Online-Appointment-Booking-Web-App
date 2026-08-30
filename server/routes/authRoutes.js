const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { protect, JWT_SECRET } = require("../middleware/authMiddleware");

// Helper to generate signed JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "7d"
  });
};

// ==========================================
// REGISTER USER (PATIENT OR DOCTOR)
// POST /api/auth/register
// ==========================================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "patient",
      phone,
      speciality,
      qualifications,
      experienceYears,
      bio,
      consultationFee,
      location,
      age,
      gender,
      bloodGroup
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email address already exists."
      });
    }

    // Create User record (Password hashing handled in pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || ""
    });

    let linkedProfile = null;

    // Create linked Profile depending on role
    if (role === "doctor") {
      linkedProfile = await Doctor.create({
        userId: user._id,
        speciality: speciality || "General Physician",
        qualifications: qualifications || "MBBS, MD",
        experienceYears: experienceYears ? Number(experienceYears) : 5,
        bio: bio || "Dedicated healthcare specialist committed to patient well-being.",
        consultationFee: consultationFee ? Number(consultationFee) : 500,
        location: location || "New Delhi",
        img: "/images/doc1.png"
      });
    } else {
      linkedProfile = await Patient.create({
        userId: user._id,
        age: age ? Number(age) : 28,
        gender: gender || "Male",
        bloodGroup: bloodGroup || "O+",
        medicalHistory: []
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile: linkedProfile
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: err.message
    });
  }
});

// ==========================================
// LOGIN USER
// POST /api/auth/login
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both email and password."
      });
    }

    // Explicitly select password field to compare
    const query = { email: email.toLowerCase() };
    if (role) query.role = role;

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email, password, or selected role."
      });
    }

    // Validate password via bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    // Fetch linked profile
    let linkedProfile = null;
    if (user.role === "doctor") {
      linkedProfile = await Doctor.findOne({ userId: user._id });
    } else {
      linkedProfile = await Patient.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile: linkedProfile
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      error: "Login failed",
      details: err.message
    });
  }
});

// ==========================================
// GET CURRENT USER PROFILE
// GET /api/auth/me
// ==========================================
router.get("/me", protect, async (req, res) => {
  try {
    const user = req.user;
    let linkedProfile = null;

    if (user.role === "doctor") {
      linkedProfile = await Doctor.findOne({ userId: user._id });
    } else {
      linkedProfile = await Patient.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile: linkedProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
      details: err.message
    });
  }
});

module.exports = router;