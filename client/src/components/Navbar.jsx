import React from "react";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">

        <a className="navbar-brand fw-bold" href="/">
          DocApp
        </a>

        <div>
          <a className="nav-link d-inline me-3" href="/">Home</a>
          <a className="nav-link d-inline me-3" href="/doctors">Doctors</a>
          <a className="nav-link d-inline" href="/login">Login</a>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;