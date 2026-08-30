import React from "react";
import { Link } from "react-router-dom";

import derm from "../assets/assets_frontend/Dermatologist.svg";
import neuro from "../assets/assets_frontend/Neurologist.svg";
import pediatric from "../assets/assets_frontend/Pediatricians.svg";
import gastro from "../assets/assets_frontend/Gastroenterologist.svg";
import general from "../assets/assets_frontend/General_physician.svg";
import gyno from "../assets/assets_frontend/Gynecologist.svg";

function Speciality() {
  const specialityData = [
    { name: "General Physician", img: general, desc: "Comprehensive adult & general wellness" },
    { name: "Cardiologist", img: neuro, desc: "Heart, pulse & blood vessel care" },
    { name: "Dermatologist", img: derm, desc: "Skin, hair, nails & cosmetic health" },
    { name: "Pediatrician", img: pediatric, desc: "Infant, child & adolescent care" },
    { name: "Neurologist", img: neuro, desc: "Brain, nerves & spinal treatments" },
    { name: "Gastroenterologist", img: gastro, desc: "Digestive system & gut wellness" },
    { name: "Gynecologist", img: gyno, desc: "Women's reproductive & prenatal health" }
  ];

  return (
    <section className="container my-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-2">Find by Medical Speciality</h2>
        <p className="text-muted">
          Browse through verified specialists and book an appointment with instant confirmation.
        </p>
      </div>

      <div className="row g-3 justify-content-center">
        {specialityData.map((item, index) => (
          <div className="col-6 col-md-4 col-lg-3" key={index}>
            <Link
              to={`/doctors?speciality=${encodeURIComponent(item.name)}`}
              className="text-decoration-none text-dark"
            >
              <div className="custom-card p-3 text-center h-100 d-flex flex-column align-items-center justify-content-center">
                <div
                  className="p-3 rounded-circle mb-3 d-flex align-items-center justify-content-center"
                  style={{ background: "#eff6ff", width: "76px", height: "76px" }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{ width: "42px", height: "42px" }}
                  />
                </div>
                <h6 className="fw-bold mb-1">{item.name}</h6>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Speciality;
