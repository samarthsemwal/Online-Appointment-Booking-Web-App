import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import doc1 from "../assets/assets_frontend/doc1.png";
import doc2 from "../assets/assets_frontend/doc2.png";
import doc3 from "../assets/assets_frontend/doc3.png";
import doc4 from "../assets/assets_frontend/doc4.png";
import doc5 from "../assets/assets_frontend/doc5.png";
import doc6 from "../assets/assets_frontend/doc6.png";

function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState(
    searchParams.get("speciality") || "All"
  );

  const specialities = [
    "All",
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gynecologist",
    "Gastroenterologist"
  ];

  const defaultDoctors = [
    { _id: "doc_1", name: "Dr. Satish Malia", speciality: "General Physician", fee: 500, location: "New Delhi", rating: 4.9, img: doc1, experience: "10 Years" },
    { _id: "doc_2", name: "Dr. Sarah Johnson", speciality: "Dermatologist", fee: 600, location: "Mumbai", rating: 4.8, img: doc2, experience: "8 Years" },
    { _id: "doc_3", name: "Dr. David Miller", speciality: "Cardiologist", fee: 800, location: "Bengaluru", rating: 5.0, img: doc3, experience: "14 Years" },
    { _id: "doc_4", name: "Dr. Emma Wilson", speciality: "Pediatrician", fee: 550, location: "Noida", rating: 4.9, img: doc4, experience: "9 Years" },
    { _id: "doc_5", name: "Dr. Michael Brown", speciality: "Neurologist", fee: 750, location: "Gurugram", rating: 4.7, img: doc5, experience: "12 Years" },
    { _id: "doc_6", name: "Dr. Olivia Taylor", speciality: "Gynecologist", fee: 650, location: "New Delhi", rating: 4.9, img: doc6, experience: "7 Years" }
  ];

  useEffect(() => {
    const specialityQuery = selectedSpeciality !== "All" ? `?speciality=${encodeURIComponent(selectedSpeciality)}` : "";
    fetch(`http://localhost:5000/api/doctors${specialityQuery}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          const imgs = [doc1, doc2, doc3, doc4, doc5, doc6];
          const mapped = data.map((d, i) => ({
            ...d,
            img: imgs[i % imgs.length]
          }));
          setDoctors(mapped);
        } else {
          setDoctors(defaultDoctors);
        }
        setLoading(false);
      })
      .catch(() => {
        setDoctors(defaultDoctors);
        setLoading(false);
      });
  }, [selectedSpeciality]);

  const handleSpecialityChange = (spec) => {
    setSelectedSpeciality(spec);
    if (spec === "All") {
      searchParams.delete("speciality");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ speciality: spec });
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.location && doc.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpeciality =
      selectedSpeciality === "All" ||
      doc.speciality.toLowerCase() === selectedSpeciality.toLowerCase();

    return matchesSearch && matchesSpeciality;
  });

  return (
    <div className="container mt-4 mb-5">
      {/* Header & Search */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-2">Find & Book Specialist Doctors</h2>
        <p className="text-muted">Search through certified doctors and schedule consultations with instant slot reservation.</p>

        <div className="row justify-content-center mt-3">
          <div className="col-md-6 col-lg-5">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0">🔍</span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by doctor name, speciality, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Speciality Filter Pills */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4 pb-2 border-bottom">
        {specialities.map((spec) => (
          <button
            key={spec}
            className={`speciality-filter-btn ${selectedSpeciality === spec ? "active" : ""}`}
            onClick={() => handleSpecialityChange(spec)}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading doctors...</span>
          </div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-5 custom-card p-5">
          <h4>No doctors found matching "{searchTerm || selectedSpeciality}"</h4>
          <p className="text-muted">Try choosing another speciality or adjusting your search keyword.</p>
          <button className="btn btn-primary-custom" onClick={() => { setSelectedSpeciality("All"); setSearchTerm(""); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filteredDoctors.map((doc) => (
            <div className="col-12 col-sm-6 col-lg-4" key={doc._id}>
              <div className="custom-card h-100 d-flex flex-column">
                <div className="doctor-card-img-wrap">
                  <span className="status-indicator">
                    <span className="status-dot"></span> Available
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
                      ★ {doc.rating || 4.9}
                    </span>
                  </div>

                  <h5 className="fw-bold mb-1">{doc.name}</h5>
                  <p className="text-muted small mb-1">📍 {doc.location || "Online Telehealth"}</p>
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
      )}
    </div>
  );
}

export default Doctors;
