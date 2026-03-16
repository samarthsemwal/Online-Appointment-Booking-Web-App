import React from "react";
import { Link } from "react-router-dom";

function Navbar() {

return(

<nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">

<div className="container">

<Link className="navbar-brand fw-bold" to="/">
DocApp
</Link>

<div>

<Link className="nav-link d-inline me-3" to="/">
Home
</Link>

<Link className="nav-link d-inline me-3" to="/doctors">
Doctors
</Link>

<Link className="nav-link d-inline me-3" to="/appointments">
My Appointments
</Link>

<button className="btn btn-outline-primary me-2">
Login
</button>

<button className="btn btn-primary">
Register
</button>

</div>

</div>

</nav>

)

}

export default Navbar;
