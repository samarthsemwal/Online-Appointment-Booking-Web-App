import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Doctor Fields
  const [speciality, setSpeciality] = useState("General Physician");
  const [consultationFee, setConsultationFee] = useState(500);
  const [experienceYears, setExperienceYears] = useState(5);
  const [qualifications, setQualifications] = useState("MBBS, MD");
  const [location, setLocation] = useState("New Delhi");

  // Patient Fields
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        ...(role === "doctor"
          ? {
              speciality,
              consultationFee: Number(consultationFee),
              experienceYears: Number(experienceYears),
              qualifications,
              location
            }
          : {
              age: Number(age),
              gender,
              bloodGroup
            })
      };

      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      // Store JWT token & session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Account created successfully! Welcome, ${data.user.name}.`);

      if (role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/doctors");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7">
          <div className="custom-card p-4 p-sm-5 glass-card shadow-lg">
            <div className="text-center mb-4">
              <div className="brand-icon-box mx-auto mb-3" style={{ width: "52px", height: "52px", fontSize: "1.6rem" }}>
                🩺
              </div>
              <h3 className="fw-bold mb-1">Create an iCom Pro Account</h3>
              <p className="text-muted small">Join our high-speed telemedicine network</p>
            </div>

            {/* Role Switcher */}
            <div className="d-flex p-1 bg-light rounded-3 mb-4">
              <button
                type="button"
                className={`btn flex-fill py-2 fw-semibold rounded-3 ${role === "patient" ? "btn-white bg-white shadow-sm text-primary" : "text-muted"}`}
                onClick={() => setRole("patient")}
              >
                👤 Register as Patient
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 fw-semibold rounded-3 ${role === "doctor" ? "btn-white bg-white shadow-sm text-success" : "text-muted"}`}
                onClick={() => setRole("doctor")}
              >
                👨‍⚕️ Register as Doctor
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={role === "doctor" ? "Dr. John Doe" : "John Doe"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Password * (min 6 characters)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Choose secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic Doctor Fields */}
              {role === "doctor" && (
                <div className="p-3 bg-light rounded-3 mb-4">
                  <h6 className="fw-bold text-success mb-3">Professional Doctor Details</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Medical Speciality</label>
                      <select
                        className="form-select"
                        value={speciality}
                        onChange={(e) => setSpeciality(e.target.value)}
                      >
                        <option value="General Physician">General Physician</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Gynecologist">Gynecologist</option>
                        <option value="Gastroenterologist">Gastroenterologist</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Consultation Fee (INR)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="500"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Experience (Years)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Qualifications</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MBBS, MD"
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Clinic City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="New Delhi"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Patient Fields */}
              {role === "patient" && (
                <div className="p-3 bg-light rounded-3 mb-4">
                  <h6 className="fw-bold text-primary mb-3">Patient Health Profile</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Gender</label>
                      <select
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Blood Group</label>
                      <select
                        className="form-select"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary-custom w-100 py-3 fw-bold mb-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  `Complete ${role === "doctor" ? "Doctor" : "Patient"} Registration`
                )}
              </button>
            </form>

            <p className="text-center text-muted small mb-0">
              Already have an account?{" "}
              <Link to="/login" className="text-primary fw-bold text-decoration-none">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
