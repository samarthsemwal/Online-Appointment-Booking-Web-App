import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg border-bottom sticky-top py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <div className="brand-icon-box">🩺</div>
          <span className="brand-text">
            iCom <span className="brand-accent">Pro</span>
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className={`collapse navbar-collapse ${isNavCollapsed ? "" : "show"}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive("/") ? "active-link" : ""}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive("/doctors") ? "active-link" : ""}`} to="/doctors">
                Find Doctors
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link px-3 ai-nav-link ${isActive("/heart-disease") ? "active-link" : ""}`}
                to="/heart-disease"
              >
                <span className="ai-pulse-dot me-1"></span>
                AI Heart Risk
              </Link>
            </li>

            {user && user.role === "patient" && (
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 ${isActive("/appointments") ? "active-link" : ""}`}
                  to="/appointments"
                >
                  My Appointments
                </Link>
              </li>
            )}

            {user && user.role === "doctor" && (
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 text-success fw-bold ${isActive("/doctor-dashboard") ? "active-link" : ""}`}
                  to="/doctor-dashboard"
                >
                  Doctor Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Auth Controls */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {!user ? (
              <>
                <Link className="btn btn-outline-custom px-4" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary-custom px-4" to="/register">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <div className="user-badge d-flex align-items-center gap-2">
                  <div className="user-avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info-text d-none d-sm-block">
                    <span className="user-name">{user.name.split(" ")[0]}</span>
                    <span className={`role-pill ${user.role}`}>
                      {user.role === "doctor" ? "Doctor" : "Patient"}
                    </span>
                  </div>
                </div>
                <button className="btn btn-logout-custom btn-sm" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
