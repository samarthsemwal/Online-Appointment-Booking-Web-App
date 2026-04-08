import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(`http://localhost:5000/api/appointments?patientId=${user._id}`)
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

  const handleCancel = async (id) => {
    await fetch(`http://localhost:5000/api/appointments/${id}`, {
      method: "DELETE"
    });
    setAppointments(appointments.filter(app => app._id !== id));
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">My Appointments</h2>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-muted">No appointments booked yet.</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Doctor</th>
                <th>Speciality</th>
                <th>Location</th>
                <th>Date</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app, index) => (
                <tr key={index} className="align-middle">
                  <td className="fw-medium">{app.doctor}</td>
                  <td>{app.speciality}</td>
                  <td>{app.location}</td>
                  <td>{app.date}</td>
                  <td>{app.time}</td>
                  <td className="d-flex gap-2">
                    <Link to={`/communication/${app._id}`} className="btn btn-sm btn-primary">
                      💬 Join Call & Chat
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancel(app._id)}
                    >
                      ❌ Cancel
                    </button>
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

export default Appointments;