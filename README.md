# 🩺 iCom Pro – Full-Stack Telemedicine & AI Diagnostics Platform
**React.js • Node.js • Express.js • MongoDB (7 Collections) • FastAPI • Socket.io • WebRTC • Razorpay**

---

## 🌟 Overview

**iCom Pro** is a full-stack telemedicine and clinical AI diagnostics ecosystem designed for high-concurrency patient consultations, zero double-booking, encrypted peer-to-peer WebRTC video, real-time persisted Socket.io chat, and instant cardiovascular risk assessment.

---

## ✨ Key Architectural Highlights

### 1. 🗄️ Referenced 7-Collection MongoDB Schema & Compound Indexing
- **7 Referenced Collections:**
  - `User`: Central identity & authentication (patients, doctors, administrators) with `bcryptjs` hashed passwords.
  - `Doctor`: Referenced doctor profiles containing medical credentials, hospital affiliations, consultation fees, and available time slots.
  - `Patient`: Referenced patient medical history, allergies, emergency contacts, and vital stats.
  - `Appointment`: Central booking entity referencing patient, doctor, payment, and prescription records.
  - `Payment`: Financial records containing Razorpay order/payment IDs, HMAC-SHA256 signatures, and captured status.
  - `Prescription`: Clinical records with structured medicines, dosages, diagnostic advice, and follow-ups.
  - `ChatMessage`: Consultation chat messages persistently stored in MongoDB with roomId/appointmentId indices.
- **Database-Level Double-Booking Prevention:**
  - Compound unique partial index:
    ```javascript
    AppointmentSchema.index(
      { doctorId: 1, date: 1, timeSlot: 1 },
      { unique: true, partialFilterExpression: { status: { $in: ["pending", "confirmed", "completed"] } } }
    );
    ```
  - Rejects duplicate booking race conditions at the database engine level (`11000 duplicate key error` -> `409 Conflict`).
- **Automated Concurrency Validation:**
  - Verified with automated **Jest & Supertest** concurrency test suites firing simultaneous parallel booking requests.

---

### 2. 🔐 JWT Authentication & Razorpay HMAC-SHA256 Verification
- **Identity-Spoofing Elimination:**
  - URL-parameter identity vulnerabilities eliminated; all authorization is derived strictly from server-verified signed JWT tokens (`req.user.id`).
- **Razorpay Payments with Server-Side HMAC-SHA256:**
  - Server generates signed Razorpay orders (`POST /api/payments/create-order`).
  - Server verifies signatures via constant-time HMAC-SHA256 hash calculation:
    ```javascript
    crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex')
    ```

---

### 3. 🤖 Persistent FastAPI Heart Disease Risk Microservice (86.81% Test Accuracy)
- **Zero Subprocess Overhead:**
  - Extracted from legacy per-request python `child_process` spawns into a persistent, in-memory **FastAPI microservice** on port `8000`.
- **Verified Clinical Model:**
  - Trained on the Cleveland Heart Disease Dataset using Logistic Regression with `StandardScaler` (`test_size=0.3`, `random_state=42`), achieving **86.81% test accuracy**.
- **13 Clinical Biomarkers Evaluated:**
  - Age, Sex, Chest Pain (cp), Resting Blood Pressure (trestbps), Cholesterol (chol), Fasting Blood Sugar (fbs), Resting ECG (restecg), Max Heart Rate (thalach), Exercise Induced Angina (exang), ST Depression (oldpeak), ST Slope (slope), Major Vessels (ca), Thalassemia (thal).

---

### 4. 📹 Encrypted WebRTC Video Consultation & Persisted Socket.io Chat
- **1-on-1 WebRTC Video Consultation:**
  - Native browser peer-to-peer connection with local Picture-in-Picture feed, remote HD stream, audio mute, and camera toggles.
- **Persisted MongoDB Chat History:**
  - Messages sent in consultation rooms are persisted to MongoDB and retrieved on room entrance (`GET /api/chat/:appointmentId`).
- **Digital Prescription Builder:**
  - In-consultation clinical prescription builder allowing doctors to write prescriptions and patients to view/print them.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB running locally on default port (`mongodb://127.0.0.1:27017/doctorApp`)

---

### 1. Boot the FastAPI Heart Disease Microservice (Port 8000)
```bash
cd heartdisease
source venv/bin/activate    # On Windows: venv\Scripts\activate
python train_model.py       # Trains and verifies 86.81% accuracy
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 2. Boot the Node.js API & Socket.io Server (Port 5000)
```bash
cd server
npm install
node seed.js                # Seeds 7 collections with doctors, patients, and initial chats
npm start
```

---

### 3. Start the React Frontend Client (Port 3000)
```bash
cd client
npm install
npm start
```

---

### 4. Run Automated Concurrency Tests
```bash
cd server
npm test
```
Runs Jest & Supertest automated concurrency tests validating database-level anti-double-booking indexing.

---

## 👥 Demo Test Accounts

| Role | Email | Password | Speciality |
|---|---|---|---|
| **Doctor** | `satish@doc.com` | `password123` | General Physician |
| **Doctor** | `david@doc.com` | `password123` | Cardiologist |
| **Doctor** | `sarah@doc.com` | `password123` | Dermatologist |
| **Patient** | `rahul@patient.com` | `password123` | Patient Profile |
| **Patient** | `priya@patient.com` | `password123` | Patient Profile |
