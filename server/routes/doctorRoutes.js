const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// ==========================================
// GET ALL DOCTORS (WITH REFERENCED PROFILES)
// GET /api/doctors
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { speciality, search, location } = req.query;
    let doctorFilter = {};

    if (speciality && speciality !== "All") {
      doctorFilter.speciality = new RegExp(`^${speciality}$`, "i");
    }
    if (location) {
      doctorFilter.location = new RegExp(location, "i");
    }

    const doctorProfiles = await Doctor.find(doctorFilter).populate({
      path: "userId",
      select: "name email phone avatar"
    });

    // Merge into clean doctor objects for frontend consumption
    let result = doctorProfiles
      .filter((doc) => doc.userId) // Ensure linked user exists
      .map((doc) => ({
        _id: doc.userId._id,
        doctorId: doc._id,
        name: doc.userId.name,
        email: doc.userId.email,
        speciality: doc.speciality,
        qualifications: doc.qualifications,
        experience: `${doc.experienceYears} Years`,
        experienceYears: doc.experienceYears,
        fee: doc.consultationFee,
        consultationFee: doc.consultationFee,
        location: doc.location,
        hospital: doc.hospital,
        availableDays: doc.availableDays,
        availableTimeSlots: doc.availableTimeSlots,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        bio: doc.bio,
        img: doc.img || "/images/doc1.png"
      }));

    if (search) {
      const searchRegex = new RegExp(search, "i");
      result = result.filter(
        (d) =>
          searchRegex.test(d.name) ||
          searchRegex.test(d.speciality) ||
          searchRegex.test(d.location)
      );
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctors",
      details: err.message
    });
  }
});

// ==========================================
// GET DOCTOR BY ID (USER ID OR PROFILE ID)
// GET /api/doctors/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Try finding by userId first, then by Doctor profile _id
    let doctorProfile = await Doctor.findOne({ userId: id }).populate({
      path: "userId",
      select: "name email phone avatar"
    });

    if (!doctorProfile) {
      doctorProfile = await Doctor.findById(id).populate({
        path: "userId",
        select: "name email phone avatar"
      });
    }

    if (!doctorProfile || !doctorProfile.userId) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found"
      });
    }

    const result = {
      _id: doctorProfile.userId._id,
      doctorId: doctorProfile._id,
      name: doctorProfile.userId.name,
      email: doctorProfile.userId.email,
      speciality: doctorProfile.speciality,
      qualifications: doctorProfile.qualifications,
      experience: `${doctorProfile.experienceYears} Years`,
      experienceYears: doctorProfile.experienceYears,
      fee: doctorProfile.consultationFee,
      consultationFee: doctorProfile.consultationFee,
      location: doctorProfile.location,
      hospital: doctorProfile.hospital,
      availableDays: doctorProfile.availableDays,
      availableTimeSlots: doctorProfile.availableTimeSlots,
      rating: doctorProfile.rating,
      totalReviews: doctorProfile.totalReviews,
      bio: doctorProfile.bio,
      img: doctorProfile.img || "/images/doc1.png"
    };

    res.json(result);
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctor details",
      details: err.message
    });
  }
});

module.exports = router;
