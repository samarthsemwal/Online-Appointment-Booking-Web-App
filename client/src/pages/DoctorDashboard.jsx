import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PrescriptionModal from "../components/PrescriptionModal";

function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorUser, setDoctorUser] = useState(null);
  const [prescribeAppId, setPrescribeAppId] = useState(null);

  const fetchDoctorAppointments = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || user.role !== "doctor") {
      toast.error("Doctor credentials required.");
      navigate("/login");
      return;
    }

    setDoctorUser(user);

    try {
      const res = await fetch("http://localhost:5000/api/appointments/doctor", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        toast.error(data.error || "Failed to fetch dashboard appointments.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error fetching doctor schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const totalEarnings = appointments
    .filter((a) => a.paymentStatus === "paid" || a.status === "completed")
    .reduce((sum, a) => sum + (a.consultationFee || 500), 0);

  const upcomingCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Doctor Portal & Consultations</h2>
          <p className="text-muted mb-0">Welcome back, {doctorUser?.name || "Doctor"}. Manage your consultations and patient prescriptions.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-sm-0">
          <button className="btn btn-outline-primary btn-sm" onClick={fetchDoctorAppointments}>
            🔄 Refresh Schedule
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="custom-card p-3 p-md-4">
            <span className="text-muted small d-block mb-1">Upcoming Consultations</span>
            <h3 className="fw-bold text-primary mb-0">{upcomingCount}</h3>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="custom-card p-3 p-md-4">
            <span className="text-muted small d-block mb-1">Completed</span>
            <h3 className="fw-bold text-success mb-0">{completedCount}</h3>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="custom-card p-3 p-md-4">
            <span className="text-muted small d-block mb-1">Total Patients</span>
            <h3 className="fw-bold text-dark mb-0">{appointments.length}</h3>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="custom-card p-3 p-md-4">
            <span className="text-muted small d-block mb-1">Total Earnings</span>
            <h3 className="fw-bold text-success mb-0">₹{totalEarnings}</h3>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="custom-card p-4">
        <h5 className="fw-bold mb-3">Today's Patient Schedule</h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p className="mb-0">You have no booked appointments scheduled at this time.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Symptoms</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="fw-bold text-dark">{app.patient}</div>
                      <div className="small text-muted">{app.patientEmail || app.patientPhone || "Registered Patient"}</div>
                    </td>
                    <td>
                      <div>📅 {app.date}</div>
                      <div className="small text-muted">⏰ {app.time || app.timeSlot}</div>
                    </td>
                    <td>
                      <span className="small text-muted">{app.symptoms || "General Checkup"}</span>
                    </td>
                    <td>
                      {app.paymentStatus === "paid" ? (
                        <span className="badge-confirmed">Paid ₹{app.consultationFee || 500}</span>
                      ) : (
                        <span className="badge-pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {app.status === "completed" ? (
                        <span className="badge-completed">Completed</span>
                      ) : app.status === "cancelled" ? (
                        <span className="badge-cancelled">Cancelled</span>
                      ) : (
                        <span className="badge-confirmed">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {app.status !== "cancelled" && (
                          <>
                            <Link
                              to={`/communication/${app._id}`}
                              className="btn btn-primary-custom btn-sm px-3"
                            >
                              📹 Start Call & Chat
                            </Link>

                            <button
                              className="btn btn-outline-success btn-sm px-2 fw-semibold"
                              onClick={() => setPrescribeAppId(app._id)}
                            >
                              ✍️ Prescribe
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescription Builder Modal */}
      {prescribeAppId && (
        <PrescriptionModal
          appointmentId={prescribeAppId}
          isDoctor={true}
          onSuccess={() => {
            fetchDoctorAppointments();
            setPrescribeAppId(null);
          }}
          onClose={() => setPrescribeAppId(null)}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;
