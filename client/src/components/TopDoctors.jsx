import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import doc1 from "../assets/assets_frontend/doc1.png";
import doc2 from "../assets/assets_frontend/doc2.png";
import doc3 from "../assets/assets_frontend/doc3.png";
import doc4 from "../assets/assets_frontend/doc4.png";
import doc5 from "../assets/assets_frontend/doc5.png";
import doc6 from "../assets/assets_frontend/doc6.png";
import { API_BASE_URL } from "../config";

function TopDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackDocs = [
    { _id: "doc_1", name: "Dr. Satish Malia", speciality: "General Physician", fee: 500, location: "New Delhi", rating: 4.9, img: doc1, experience: "10 Years" },
    { _id: "doc_2", name: "Dr. Sarah Johnson", speciality: "Dermatologist", fee: 600, location: "Mumbai", rating: 4.8, img: doc2, experience: "8 Years" },
    { _id: "doc_3", name: "Dr. David Miller", speciality: "Cardiologist", fee: 800, location: "Bengaluru", rating: 5.0, img: doc3, experience: "14 Years" },
    { _id: "doc_4", name: "Dr. Emma Wilson", speciality: "Pediatrician", fee: 550, location: "Noida", rating: 4.9, img: doc4, experience: "9 Years" },
    { _id: "doc_5", name: "Dr. Michael Brown", speciality: "Neurologist", fee: 750, location: "Gurugram", rating: 4.7, img: doc5, experience: "12 Years" },
    { _id: "doc_6", name: "Dr. Olivia Taylor", speciality: "Gynecologist", fee: 650, location: "New Delhi", rating: 4.9, img: doc6, experience: "7 Years" }
  ];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/doctors`)
      .then((res) => {
        if (!res.ok) throw new Error("API Offline");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          // Map image assets if relative path
          const mapped = data.map((d, i) => {
            const imgs = [doc1, doc2, doc3, doc4, doc5, doc6];
            return {
              ...d,
              img: imgs[i % imgs.length]
            };
          });
          setDoctors(mapped);
        } else {
          setDoctors(fallbackDocs);
        }
        setLoading(false);
      })
      .catch(() => {
        setDoctors(fallbackDocs);
        setLoading(false);
      });
  }, []);

  return (
    <section className="container my-5">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold mb-1">Top Verified Specialists</h2>
          <p className="text-muted mb-0">Book direct consultations with leading doctors.</p>
        </div>
        <Link to="/doctors" className="btn btn-outline-primary btn-sm px-3 fw-bold d-none d-md-inline-block">
          View All Doctors →
        </Link>
      </div>

      <div className="row g-4">
        {doctors.slice(0, 6).map((doc) => (
          <div className="col-12 col-sm-6 col-lg-4" key={doc._id}>
            <div className="custom-card h-100 d-flex flex-column">
              <div className="doctor-card-img-wrap">
                <span className="status-indicator">
                  <span className="status-dot"></span> Available Today
                </span>
                <img
                  src={doc.img || doc1}
                  className="doctor-card-img"
                  alt={doc.name}
                />
              </div>

              <div className="p-4 d-flex flex-column flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1">
                    {doc.speciality}
                  </span>
                  <span className="small fw-bold text-warning">
                    ★ {doc.rating || 4.9} <span className="text-muted fw-normal">({doc.totalReviews || 25}+)</span>
                  </span>
                </div>

                <h5 className="fw-bold mb-1">{doc.name}</h5>
                <p className="text-muted small mb-2">📍 {doc.location || "Online Telehealth"}</p>
                <p className="text-muted small mb-3">🎓 Experience: {doc.experience || "8+ Years"}</p>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block">Consultation Fee</span>
                    <strong className="text-primary fs-5">₹{doc.fee || doc.consultationFee || 500}</strong>
                  </div>
                  <Link
                    to={`/doctor/${doc._id}`}
                    className="btn btn-primary-custom btn-sm px-3"
                  >
                    Book Slot →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 d-md-none">
        <Link to="/doctors" className="btn btn-outline-primary btn-sm px-4 fw-bold">
          View All Doctors →
        </Link>
      </div>
    </section>
  );
}

export default TopDoctors;