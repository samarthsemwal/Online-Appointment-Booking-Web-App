const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    speciality: {
      type: String,
      required: true,
      default: "General Physician"
    },
    qualifications: {
      type: String,
      default: "MBBS, MD"
    },
    experienceYears: {
      type: Number,
      default: 5
    },
    bio: {
      type: String,
      default: "Dedicated healthcare specialist committed to patient well-being and preventive care."
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 500
    },
    location: {
      type: String,
      default: "New Delhi"
    },
    hospital: {
      type: String,
      default: "Apollo Telehealth Center"
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    availableTimeSlots: {
      type: [String],
      default: [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
        "06:00 PM"
      ]
    },
    rating: {
      type: Number,
      default: 4.8
    },
    totalReviews: {
      type: Number,
      default: 24
    },
    img: {
      type: String,
      default: "/images/doc1.png"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
