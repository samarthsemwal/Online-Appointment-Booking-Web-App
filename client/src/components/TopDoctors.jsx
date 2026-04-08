import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function TopDoctors(){

const [doctors, setDoctors] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/doctors")
    .then(res => res.json())
    .then(data => {
      setDoctors(data.slice(0, 8));
    })
    .catch(err => {
      console.log(err);
    });
}, []);

return(

<div className="container mt-5">

<h2 className="text-center mb-4">Top Doctors</h2>

<div className="row">

{doctors.map((doc)=>(

<div className="col-md-4 col-lg-3 mb-4" key={doc._id}>

<Link to={`/doctor/${doc._id}`} style={{textDecoration:"none",color:"inherit"}}>

<div className="card shadow-sm h-100">

<img src={doc.img || "/images/doc1.png"} className="card-img-top" alt="doctor"/>

<div className="card-body">

<h5>{doc.name}</h5>

<p className="text-muted mb-1">{doc.speciality}</p>
<p style={{fontSize:"14px"}} className="mb-2">📍 {doc.location}</p>

</div>

</div>

</Link>

</div>

))}

</div>

</div>

)

}

export default TopDoctors;