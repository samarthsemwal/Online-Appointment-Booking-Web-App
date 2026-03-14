import React from "react";
import headerImg from "../assets/assets_frontend/header_img.png";
import Speciality from "../components/Speciality";

function Home() {
  return (
    <div className="container mt-5">
      <div className="row align-items-center">

        <div className="col-md-6">
          <h1>Book Appointment With Trusted Doctors</h1>

          <p>
            Browse through our list of trusted doctors and
            schedule your appointment easily.
          </p>

          <a href="/doctors" className="btn btn-primary">
            Find Doctors
          </a>
        </div>

        <div className="col-md-6 text-center">
          <img
            src={headerImg}
            alt="doctor"
            style={{ width: "80%" }}
          />
        </div>

      </div>
    </div>
  );
}

export default Home;
