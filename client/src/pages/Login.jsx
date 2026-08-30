import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1-Click Demo Login Helper
  const fillDemoCredentials = (demoRole) => {
    setRole(demoRole);
    if (demoRole === "patient") {
      setEmail("rahul@patient.com");
      setPassword("password123");
    } else {
      setEmail("satish@doc.com");
      setPassword("password123");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      // Store JWT token & user session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/appointments");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="custom-card p-4 p-sm-5 glass-card shadow-lg">
            <div className="text-center mb-4">
              <div className="brand-icon-box mx-auto mb-3" style={{ width: "52px", height: "52px", fontSize: "1.6rem" }}>
                🩺
              </div>
              <h3 className="fw-bold mb-1">Welcome to iCom Pro</h3>
              <p className="text-muted small">Sign in to manage appointments & consultations</p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="d-flex p-1 bg-light rounded-3 mb-4">
              <button
                type="button"
                className={`btn flex-fill py-2 fw-semibold rounded-3 ${role === "patient" ? "btn-white bg-white shadow-sm text-primary" : "text-muted"}`}
                onClick={() => setRole("patient")}
              >
                👤 Patient Login
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 fw-semibold rounded-3 ${role === "doctor" ? "btn-white bg-white shadow-sm text-success" : "text-muted"}`}
                onClick={() => setRole("doctor")}
              >
                👨‍⚕️ Doctor Login
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-custom w-100 py-3 fw-bold mb-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  `Sign In as ${role === "doctor" ? "Doctor" : "Patient"}`
                )}
              </button>
            </form>

            {/* 1-Click Demo Fill */}
            <div className="p-3 bg-light rounded-3 mb-4 text-center">
              <span className="text-muted small d-block mb-2 fw-semibold">Quick Demo 1-Click Auto Fill:</span>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => fillDemoCredentials("patient")}
                >
                  Fill Patient Demo
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm px-3"
                  onClick={() => fillDemoCredentials("doctor")}
                >
                  Fill Doctor Demo
                </button>
              </div>
            </div>

            <p className="text-center text-muted small mb-0">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-primary fw-bold text-decoration-none">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
