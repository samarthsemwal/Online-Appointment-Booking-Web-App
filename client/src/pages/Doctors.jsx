import React from "react";

import doc1 from "../assets/assets_frontend/doc1.png";
import doc2 from "../assets/assets_frontend/doc2.png";
import doc3 from "../assets/assets_frontend/doc3.png";

function Doctors() {

  const doctors = [
    { name: "Dr. Richard James", speciality: "General physician", img: doc1 },
    { name: "Dr. Sarah Johnson", speciality: "Dermatologist", img: doc2 },
    { name: "Dr. David Miller", speciality: "Cardiologist", img: doc3 }
  ];

  return (
    <div className="container mt-5">

      <h2 className="mb-4">Our Doctors</h2>

      <div className="row">

        {doctors.map((doc, index) => (

          <div className="col-md-4 mb-4" key={index}>

            <div className="card shadow-sm">

              <img
                src={doc.img}
                className="card-img-top"
                alt="doctor"
              />

              <div className="card-body">

                <h5 className="card-title">{doc.name}</h5>

                <p className="card-text">
                  {doc.speciality}
                </p>

                <button className="btn btn-primary">
                  Book Appointment
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Doctors;
