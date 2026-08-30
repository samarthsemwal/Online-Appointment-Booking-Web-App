import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import ChatVideoCall from "./pages/ChatVideoCall";
import HeartDisease from "./pages/HeartDisease";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />

        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/heart-disease" element={<HeartDisease />} />

            {/* Patient Protected Routes */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            {/* Doctor Protected Dashboard */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Telemedicine WebRTC & Persisted Chat Room */}
            <Route
              path="/communication/:appointmentId"
              element={
                <ProtectedRoute>
                  <ChatVideoCall />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Modern Footer */}
        <footer className="bg-white border-top py-4 mt-auto">
          <div className="container text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="brand-icon-box" style={{ width: "28px", height: "28px", fontSize: "0.9rem" }}>🩺</span>
              <strong className="text-dark">iCom Pro</strong>
              <span className="text-muted small">— Full-Stack Telemedicine & AI Diagnostics Platform</span>
            </div>
            <p className="text-muted small mb-0">
              Encrypted WebRTC consultations • Anti-Double-Booking MongoDB Engine • FastAPI 86.81% Heart Risk Microservice • Razorpay HMAC-SHA256
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;