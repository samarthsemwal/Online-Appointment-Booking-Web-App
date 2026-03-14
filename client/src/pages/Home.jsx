import React from "react";

import headerImg from "../assets/assets_frontend/header_img.png";
import general from "../assets/assets_frontend/General_physician.svg";
import derm from "../assets/assets_frontend/Dermatologist.svg";
import neuro from "../assets/assets_frontend/Neurologist.svg";
import gastro from "../assets/assets_frontend/Gastroenterologist.svg";
import gyno from "../assets/assets_frontend/Gynecologist.svg";

function Home() {

return (

<div>

{/* HERO SECTION */}

<div className="container mt-5">

<div className="row align-items-center">

<div className="col-md-6">

<h1 className="fw-bold">
Book Appointment With Trusted Doctors
</h1>

<p>
Simply browse through our extensive list of trusted doctors
and schedule your appointment hassle-free.
</p>

<a href="/doctors" className="btn btn-primary mt-3">
Find Doctors
</a>

</div>

<div className="col-md-6">

<img
src={headerImg}
alt="header"
style={{width:"100%"}}
/>

</div>

</div>

</div>

{/* SPECIALITY SECTION */}

<div className="container mt-5">

<h2 className="text-center mb-4">
Find by Speciality
</h2>

<div className="row text-center">

<div className="col-md-2">
<img src={general} width="60"/>
<p>General Physician</p>
</div>

<div className="col-md-2">
<img src={derm} width="60"/>
<p>Dermatologist</p>
</div>

<div className="col-md-2">
<img src={neuro} width="60"/>
<p>Neurologist</p>
</div>

<div className="col-md-2">
<img src={gastro} width="60"/>
<p>Gastroenterologist</p>
</div>

<div className="col-md-2">
<img src={gyno} width="60"/>
<p>Gynecologist</p>
</div>

</div>

</div>

</div>

);

}

export default Home;