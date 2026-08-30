import React from "react";
import { Link } from "react-router-dom";
import headerImg from "../assets/assets_frontend/header_img.png";
import groupProfiles from "../assets/assets_frontend/group_profiles.png";
import Speciality from "../components/Speciality";
import TopDoctors from "../components/TopDoctors";

function Home() {
  return (
    <div>
      {/* ============================================================ */}
      {/* HERO SECTION                                                */}
      {/* ============================================================ */}
      <section className="container mt-4 mb-5">
        <div
          className="rounded-4 p-4 p-md-5 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0ea5e9 100%)",
            color: "white"
          }}
        >
          <div className="row align-items-center">
            {/* Left Content */}
            <div className="col-lg-7 z-1">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(8px)" }}>
                <span className="badge bg-white text-primary fw-bold">NEW</span>
                <span className="small fw-semibold">Persistent AI Heart Risk Microservice (86.81% Accuracy)</span>
              </div>

              <h1 className="display-4 fw-extrabold text-white mb-3" style={{ lineHeight: 1.15, fontWeight: 800 }}>
                Book Consultations With <br />
                <span style={{ color: "#93c5fd" }}>Trusted Specialists</span>
              </h1>

              <p className="lead text-white-50 mb-4" style={{ fontSize: "1.1rem" }}>
                Experience modern telemedicine with zero double-booking, encrypted WebRTC HD video consultations, Razorpay instant checkout, and real-time AI cardiac risk analysis.
              </p>

              {/* Social Proof & CTA */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <Link to="/doctors" className="btn btn-light btn-lg px-4 py-3 fw-bold text-primary shadow-lg rounded-3">
                  Find a Doctor Now →
                </Link>
                <Link to="/heart-disease" className="btn btn-outline-light btn-lg px-4 py-3 fw-bold rounded-3">
                  Check Heart Risk ❤️
                </Link>
              </div>

              <div className="d-flex align-items-center gap-3 pt-2 border-top border-white-50">
                <img src={groupProfiles} alt="Patients" style={{ height: "36px" }} />
                <div className="small text-white-50">
                  <strong className="text-white">50,000+</strong> consultations completed with 4.9★ patient satisfaction
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="col-lg-5 text-center mt-4 mt-lg-0">
              <img
                src={headerImg}
                alt="Doctors Telemedicine"
                className="img-fluid"
                style={{
                  maxHeight: "440px",
                  filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.25))"
                }}
              />
            </div>
          </div>
        </div>
      </section>



      {/* ============================================================ */}
      {/* FIND BY SPECIALITY                                           */}
      {/* ============================================================ */}
      <Speciality />

      {/* ============================================================ */}
      {/* TOP RATED DOCTORS                                            */}
      {/* ============================================================ */}
      <TopDoctors />

      {/* ============================================================ */}
      {/* AI HEART HEALTH CALLOUT BANNER                               */}
      {/* ============================================================ */}
      <section className="container my-5">
        <div
          className="rounded-4 p-4 p-md-5 text-white"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            boxShadow: "0 10px 30px rgba(99, 102, 241, 0.25)"
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-white bg-opacity-25 rounded-pill mb-3">
                <span className="accuracy-chip">86.81% Test Accuracy</span>
                <span className="small fw-semibold">FastAPI Persistent Microservice</span>
              </div>
              <h2 className="fw-bold mb-3">Assess Your Heart Disease Risk in Seconds</h2>
              <p className="text-white-50 mb-4" style={{ maxWidth: "600px" }}>
                Our persistent machine learning microservice utilizes 13 clinical biomarkers (blood pressure, cholesterol, ECG, ST depression) to evaluate your cardiovascular risk profile instantly.
              </p>
              <Link to="/heart-disease" className="btn btn-light btn-lg px-4 py-2 fw-bold text-primary rounded-3">
                Launch Heart Risk Calculator →
              </Link>
            </div>
            <div className="col-md-4 text-center mt-4 mt-md-0 fs-1">
              <div className="p-4 bg-white bg-opacity-10 rounded-circle d-inline-block shadow-lg" style={{ width: "130px", height: "130px", lineHeight: "90px" }}>
                🫀
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
