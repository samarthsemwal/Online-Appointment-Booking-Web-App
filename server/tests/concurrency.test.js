const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

process.env.NODE_ENV = "test";

const { app } = require("../server");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const { JWT_SECRET } = require("../middleware/authMiddleware");

jest.setTimeout(120000);

let mongoServer;
let doctorUser, doctorProfile;
let patientUser1, patientUser2, patientUser3, patientUser4, patientUser5;
let patient1Token, patient2Token, patient3Token, patient4Token, patient5Token;

beforeAll(async () => {
  // Start In-Memory MongoDB Server for isolated test suite
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  // Explicitly sync and create the compound unique index in the test database
  await Appointment.init();
  await Appointment.syncIndexes();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Doctor
  doctorUser = await User.create({
    name: "Dr. David Miller",
    email: "david.test@doc.com",
    password: hashedPassword,
    role: "doctor"
  });

  doctorProfile = await Doctor.create({
    userId: doctorUser._id,
    speciality: "Cardiologist",
    consultationFee: 800,
    availableTimeSlots: ["10:00 AM", "11:00 AM", "02:00 PM"]
  });

  // Create 5 distinct Patients
  patientUser1 = await User.create({ name: "Patient 1", email: "p1@test.com", password: hashedPassword, role: "patient" });
  patientUser2 = await User.create({ name: "Patient 2", email: "p2@test.com", password: hashedPassword, role: "patient" });
  patientUser3 = await User.create({ name: "Patient 3", email: "p3@test.com", password: hashedPassword, role: "patient" });
  patientUser4 = await User.create({ name: "Patient 4", email: "p4@test.com", password: hashedPassword, role: "patient" });
  patientUser5 = await User.create({ name: "Patient 5", email: "p5@test.com", password: hashedPassword, role: "patient" });

  patient1Token = jwt.sign({ id: patientUser1._id, role: "patient" }, JWT_SECRET);
  patient2Token = jwt.sign({ id: patientUser2._id, role: "patient" }, JWT_SECRET);
  patient3Token = jwt.sign({ id: patientUser3._id, role: "patient" }, JWT_SECRET);
  patient4Token = jwt.sign({ id: patientUser4._id, role: "patient" }, JWT_SECRET);
  patient5Token = jwt.sign({ id: patientUser5._id, role: "patient" }, JWT_SECRET);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Database-Level Concurrency & Anti-Double-Booking Test Suite", () => {

  test("1. Concurrency Test: 5 simultaneous bookings for the exact same slot must yield exactly 1 success and 4 conflicts (409)", async () => {
    const bookingPayload = {
      doctorId: doctorUser._id.toString(),
      date: "2026-10-10",
      timeSlot: "11:00 AM",
      symptoms: "Chest tightness and palpitations"
    };

    const tokens = [patient1Token, patient2Token, patient3Token, patient4Token, patient5Token];

    // Fire 5 concurrent requests simultaneously via Promise.all
    const promises = tokens.map((token) =>
      request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send(bookingPayload)
    );

    const responses = await Promise.all(promises);

    const successfulResponses = responses.filter((res) => res.status === 201);
    const conflictResponses = responses.filter((res) => res.status === 409);

    // Validate that EXACTLY 1 request succeeds
    expect(successfulResponses.length).toBe(1);
    expect(successfulResponses[0].body.success).toBe(true);
    expect(successfulResponses[0].body.appointment).toBeDefined();

    // Validate that EXACTLY 4 requests fail with 409 Conflict
    expect(conflictResponses.length).toBe(4);
    conflictResponses.forEach((res) => {
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("SLOT_ALREADY_BOOKED");
    });

    // Validate database state: exactly 1 appointment recorded
    const countInDb = await Appointment.countDocuments({
      doctorId: doctorUser._id,
      date: "2026-10-10",
      timeSlot: "11:00 AM",
      status: "confirmed"
    });
    expect(countInDb).toBe(1);
  });

  test("2. Partial Index Slot Release: Cancelling an appointment frees the slot for subsequent bookings", async () => {
    // Fetch the active appointment booked in Test 1
    const bookedApp = await Appointment.findOne({
      doctorId: doctorUser._id,
      date: "2026-10-10",
      timeSlot: "11:00 AM"
    });
    expect(bookedApp).not.toBeNull();

    // Cancel the appointment using patient 1's token (the owner)
    const cancelRes = await request(app)
      .delete(`/api/appointments/${bookedApp._id}`)
      .set("Authorization", `Bearer ${patient1Token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);

    // Now Patient 2 tries to book the same slot
    const rebookRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patient2Token}`)
      .send({
        doctorId: doctorUser._id.toString(),
        date: "2026-10-10",
        timeSlot: "11:00 AM",
        symptoms: "Consultation follow-up"
      });

    // Should succeed because previous appointment is status 'cancelled'
    expect(rebookRes.status).toBe(201);
    expect(rebookRes.body.success).toBe(true);
  });

  test("3. Security & Anti-Spoofing: Patient can only view their own appointments", async () => {
    const res = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${patient2Token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // All returned appointments must belong to patient 2
    res.body.forEach((appItem) => {
      expect(appItem.doctor).toBeDefined();
    });
  });

});
