import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "doctor") return;

    fetch(`http://localhost:5000/api/appointments?doctorId=${user._id}`)
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Doctor Dashboard</h2>
      
      <div className="card shadow-sm border-0 p-4 mb-4 bg-light">
          <h5 className="text-primary mb-2">Upcoming Consultations</h5>
          <p className="text-muted mb-0">Manage your patient appointments and connect directly via secure Video & Chat rooms.</p>
      </div>

      {loading ? (
        <p>Loading your appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-muted">You have no upcoming appointments.</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app, index) => (
                <tr key={index} className="align-middle">
                  <td className="fw-medium">{app.patient}</td>
                  <td>{app.date}</td>
                  <td>{app.time}</td>
                  <td>{app.location}</td>
                  <td>
                    <Link to={`/communication/${app._id}`} className="btn btn-sm btn-success">
                      Join Video/Chat Room
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
