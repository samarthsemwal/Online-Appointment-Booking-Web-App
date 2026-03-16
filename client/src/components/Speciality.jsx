import React from "react";

import derm from "../assets/assets_frontend/Dermatologist.svg";
import gyeno from "../assets/assets_frontend/Gynecologist.svg";
import neuro from "../assets/assets_frontend/Neurologist.svg";
import pediatric from "../assets/assets_frontend/Pediatricians.svg";
import gastro from "../assets/assets_frontend/Gastroenterologist.svg";
import general from "../assets/assets_frontend/General_physician.svg";

function Speciality() {

  const specialityData = [
    { name: "Dermatologist", img: derm },
    { name: "Gynecologist", img: gyeno },
    { name: "Neurologist", img: neuro },
    { name: "Pediatrician", img: pediatric },
    { name: "Gastroenterologist", img: gastro },
    { name: "General physician", img: general }
  ];

  return (
    <div className="container mt-5 text-center">

      <h2 className="mb-4">Find by Speciality</h2>

      <div className="row">

        {specialityData.map((item, index) => (

          <div className="col-md-2 col-6 mb-4" key={index}>

            <div className="p-3 border rounded shadow-sm">

              <img
                src={item.img}
                alt="speciality"
                style={{ width: "60px" }}
              />

              <p className="mt-2">{item.name}</p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Speciality;
