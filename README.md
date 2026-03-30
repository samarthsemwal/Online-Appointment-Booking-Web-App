# 🩺 DocApp Pro - Full-Stack Appointment & Telemedicine Platform

Welcome to **DocApp Pro**, a fully functional MERN (MongoDB, Express, React, NodeJS) stack application designed to seamlessly connect patients with doctors. It's more than just a booking system—it's a complete telemedicine platform supporting real-time chat and WebRTC video consultations!

## ✨ Features

- **Dual-role Authentication:** Secure and distinct onboarding for both `Doctors` and `Patients`.
- **Dynamic Doctor Dashboard:** Doctors have a dedicated dashboard to view, manage, and engage with their upcoming patient consultations.
- **Smart Appointment Booking:** Patients can browse a dynamic list of specialized doctors, check their fees/locations, and book an appointment with a smooth UI.
- **Real-Time Video Calling:** Built using native WebRTC! Patients and doctors can jump into a peer-to-peer secure video room right from their appointment dashboard. No aggressive third-party APIs required.
- **Live Text Chat:** Integrated **Socket.IO** allows instant, real-time messaging before and during the video call so nobody misses a beat.
- **Premium Aesthetics:** Featuring a sleek glassmorphism design, clean micro-interactions, responsive hover states, and gorgeous Toast notifications powered by `react-toastify`.

---

## 🚀 Tech Stack

- **Frontend:** React.js, React Router v7, React Toastify, Custom CSS Overhaul
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Real-Time Comm:** Socket.IO, WebRTC Native APIs

---

## 🛠️ Getting Started Locally

Running the app locally is super easy! You'll need two separate terminal windows—one for the backend server and one for the frontend client.

### 1. Database Setup
Make sure you have MongoDB installed and running locally on the default port (`mongodb://127.0.0.1:27017/doctorApp`). 
*(Want some instant mock data? Navigate to `/server` and run `node seed.js` to populate the database with several detailed doctors so you don't have to create them from scratch!)*

### 2. Start the Backend Server
Open your terminal and boot up the NodeJS API and Socket.IO signaling server.
```bash
cd server
npm install 
npm start
```
*The backend will run on `http://localhost:5000`*

### 3. Start the Frontend Client
In a new terminal tab, start up the React application.
```bash
cd client
npm install
npm start
```
*The frontend will run on `http://localhost:3000`*

---

## 💡 How To Test Walkthrough
1. **As a Patient:** Register a brand new account as a Patient. Head over to the "Doctors" tab to find a specialist you like the look of. Pick a date and time, and click book! Head to "My Appointments" to see it listed. 
2. **As a Doctor:** Log out, and either use the `Register` page to create a custom Doctor profile, or log into one of the seeded defaults (e.g. `satish@doc.com` | `password123`). Navigate to your **Dashboard**.
3. **Connect!** From either the Doctor's Dashboard or the Patient's Appointments page, tap the **"Join Call & Chat"** action button. This opens the WebRTC signaling room where you can launch your camera and start chatting!

---

*Built with ❤️ for modern telemedicine.*
