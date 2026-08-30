import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function PrescriptionModal({ appointmentId, isDoctor, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [existingPrescription, setExistingPrescription] = useState(null);

  // Doctor Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [clinicalAdvice, setClinicalAdvice] = useState("Stay hydrated, take plenty of rest, and take medicines on time.");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "Paracetamol", dosage: "650mg", frequency: "Twice daily", duration: "3 days", instructions: "After food" }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !appointmentId) return;

    fetch(`http://localhost:5001/api/prescriptions/appointment/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.prescription) {
          setExistingPrescription(data.prescription);
          setDiagnosis(data.prescription.diagnosis || "");
          setSymptoms(data.prescription.symptoms || "");
          setClinicalAdvice(data.prescription.clinicalAdvice || "");
          setFollowUpDate(data.prescription.followUpDate || "");
          if (data.prescription.medicines && data.prescription.medicines.length > 0) {
            setMedicines(data.prescription.medicines);
          }
        }
      })
      .catch(() => {});
  }, [appointmentId]);

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "Twice daily", duration: "5 days", instructions: "After food" }
    ]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Please enter a clinical diagnosis.");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId,
          diagnosis,
          symptoms,
          medicines: medicines.filter((m) => m.name.trim() !== ""),
          clinicalAdvice,
          followUpDate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Prescription issued successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to save prescription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white rounded-top-4">
            <h5 className="modal-title fw-bold">
              📄 {isDoctor ? "Digital Medical Prescription Builder" : "Consultation Medical Prescription"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {isDoctor ? (
              <form onSubmit={handleSavePrescription}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Clinical Diagnosis *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Acute Viral Bronchitis / Allergic Rhinitis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Reported Symptoms</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Fever, cough, sore throat"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                  </div>
                </div>

                {/* Medicines List */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold small mb-0">Prescribed Medications</label>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={addMedicineRow}
                    >
                      + Add Medicine
                    </button>
                  </div>

                  {medicines.map((med, index) => (
                    <div className="row g-2 align-items-center mb-2 p-2 bg-light rounded-3" key={index}>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Medicine Name"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Dosage (e.g. 500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Frequency (e.g. Twice daily)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Duration (e.g. 5 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                        />
                      </div>
                      <div className="col-md-2 text-end">
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm px-2"
                            onClick={() => removeMedicineRow(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Clinical Advice & Instructions</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={clinicalAdvice}
                    onChange={(e) => setClinicalAdvice(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small">Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary-custom px-4" disabled={loading}>
                    {loading ? "Saving Prescription..." : "Issue & Send Prescription"}
                  </button>
                </div>
              </form>
            ) : existingPrescription ? (
              <div>
                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <strong>Doctor:</strong> {existingPrescription.doctorId?.name || "Consultant Doctor"}
                    </div>
                    <div className="col-6">
                      <strong>Date:</strong> {new Date(existingPrescription.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-12 mt-2">
                      <strong>Diagnosis:</strong> <span className="text-primary fw-bold">{existingPrescription.diagnosis}</span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Prescribed Medications</h6>
                <div className="table-responsive mb-3">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingPrescription.medicines.map((m, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{m.name}</td>
                          <td>{m.dosage}</td>
                          <td>{m.frequency}</td>
                          <td>{m.duration}</td>
                          <td>{m.instructions || "After food"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-info bg-opacity-10 rounded-3 mb-3 small">
                  <strong>Doctor's Advice:</strong> {existingPrescription.clinicalAdvice}
                </div>

                {existingPrescription.followUpDate && (
                  <div className="small text-muted mb-3">
                    <strong>Recommended Follow-up:</strong> {existingPrescription.followUpDate}
                  </div>
                )}

                <div className="text-end">
                  <button className="btn btn-primary-custom" onClick={() => window.print()}>
                    🖨️ Print Prescription
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <p>No prescription has been issued yet for this consultation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionModal;
