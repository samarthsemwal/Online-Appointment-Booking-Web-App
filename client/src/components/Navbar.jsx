import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (

    <nav className="navbar navbar-expand-lg border-bottom bg-white shadow-sm">

      <div className="container">

        <Link className="navbar-brand fw-bold text-primary" to="/" style={{ fontSize: "1.5rem" }}>
          DocApp <span className="text-secondary small">Pro</span>
        </Link>

        <div className="d-flex align-items-center flex-wrap">

          <Link className="nav-link me-4 fw-medium" to="/">
            Home
          </Link>

           <Link className="nav-link me-4 fw-medium" to="/doctors">
            Doctors
          </Link>

          <Link className="nav-link me-4 fw-medium text-danger" to="/heart-disease">
            Heart Disease Prediction
          </Link>

          {user && user.role === "patient" && (
            <Link className="nav-link me-4 fw-medium" to="/appointments">
              My Appointments
            </Link>
          )}

          {user && user.role === "doctor" && (
            <Link className="nav-link me-4 fw-medium text-success" to="/doctor-dashboard">
              Dashboard
            </Link>
          )}

          {!user ? (
            <>
              <Link className="btn btn-outline-primary me-2 px-4 shadow-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary px-4 shadow-sm" to="/register">
                Register
              </Link>
            </>
          ) : (
            <div className="d-flex align-items-center">
              <span className="me-3 fw-bold text-dark border p-2 rounded-3 bg-white shadow-sm">
                👋 {user.name.split(" ")[0]}
              </span>
              <button className="btn btn-danger shadow-sm px-4" onClick={logout}>
                Logout
              </button>
            </div>
          )}

        </div>

      </div>

    </nav>

  )

}

export default Navbar;
