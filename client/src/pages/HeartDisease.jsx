import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function HeartDisease() {
  const [formData, setFormData] = useState({
    age: 55,
    sex: 1, // 1: male, 0: female
    cp: 2, // 0: typical, 1: atypical, 2: non-anginal, 3: asymptomatic
    trestbps: 135, // mm Hg
    chol: 245, // mg/dl
    fbs: 0, // 0: <= 120, 1: > 120
    restecg: 1, // 0: normal, 1: ST-T wave abnormality, 2: hypertrophy
    thalach: 155, // bpm
    exang: 0, // 0: no, 1: yes
    oldpeak: 1.2, // ST depression
    slope: 2, // 0: upsloping, 1: flat, 2: downsloping
    ca: 0, // 0-3 major vessels
    thal: 2 // 1: normal, 2: fixed defect, 3: reversible defect
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: Number(value)
    });
  };

  const handlePresetFill = (type) => {
    if (type === "healthy") {
      setFormData({
        age: 38,
        sex: 0,
        cp: 1,
        trestbps: 118,
        chol: 190,
        fbs: 0,
        restecg: 0,
        thalach: 172,
        exang: 0,
        oldpeak: 0.2,
        slope: 2,
        ca: 0,
        thal: 1
      });
    } else if (type === "at_risk") {
      setFormData({
        age: 63,
        sex: 1,
        cp: 3,
        trestbps: 160,
        chol: 290,
        fbs: 1,
        restecg: 2,
        thalach: 125,
        exang: 1,
        oldpeak: 2.8,
        slope: 1,
        ca: 2,
        thal: 3
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/predict/heart-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction request failed.");

      setResult(data);
      toast.success("AI Cardiac Risk Analysis Generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to Heart Disease Prediction Microservice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Hero Header */}
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-pill mb-2">
          <span className="ai-pulse-dot"></span>
          <span className="small fw-bold">Persistent FastAPI Microservice • 86.81% Test Accuracy</span>
        </div>
        <h2 className="fw-extrabold mb-1">AI Cardiovascular Risk Assessment</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: "650px" }}>
          Predictive machine learning evaluation based on the Cleveland Heart Disease Dataset using Logistic Regression and multi-biomarker normalization.
        </p>

        {/* Preset Fill Buttons */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePresetFill("healthy")}
          >
            Sample: Low Risk Profile
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePresetFill("at_risk")}
          >
            Sample: Elevated Risk Profile
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Input Form Column */}
        <div className="col-lg-7">
          <div className="custom-card p-4 p-md-5">
            <h5 className="fw-bold mb-4">Clinical Biomarkers & Vitals</h5>

            <form onSubmit={handleSubmit}>
              {/* Row 1: Age & Sex */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Age ({formData.age} years)</label>
                  <input
                    type="range"
                    className="form-range"
                    min="20"
                    max="90"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.75rem" }}>
                    <span>20y</span>
                    <span>55y</span>
                    <span>90y</span>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Biological Sex</label>
                  <select
                    className="form-select"
                    value={formData.sex}
                    onChange={(e) => handleInputChange("sex", e.target.value)}
                  >
                    <option value={1}>Male (1)</option>
                    <option value={0}>Female (0)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Chest Pain & Blood Pressure */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Chest Pain Type (cp)</label>
                  <select
                    className="form-select"
                    value={formData.cp}
                    onChange={(e) => handleInputChange("cp", e.target.value)}
                  >
                    <option value={0}>Typical Angina (0)</option>
                    <option value={1}>Atypical Angina (1)</option>
                    <option value={2}>Non-Anginal Pain (2)</option>
                    <option value={3}>Asymptomatic (3)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Resting Blood Pressure ({formData.trestbps} mm Hg)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="70"
                    max="220"
                    value={formData.trestbps}
                    onChange={(e) => handleInputChange("trestbps", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 3: Cholesterol & Fasting Blood Sugar */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Serum Cholesterol ({formData.chol} mg/dl)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="100"
                    max="600"
                    value={formData.chol}
                    onChange={(e) => handleInputChange("chol", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Fasting Blood Sugar &gt; 120 mg/dl (fbs)</label>
                  <select
                    className="form-select"
                    value={formData.fbs}
                    onChange={(e) => handleInputChange("fbs", e.target.value)}
                  >
                    <option value={0}>Normal &le; 120 mg/dl (0)</option>
                    <option value={1}>Elevated &gt; 120 mg/dl (1)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Resting ECG & Max Heart Rate */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Resting ECG Results</label>
                  <select
                    className="form-select"
                    value={formData.restecg}
                    onChange={(e) => handleInputChange("restecg", e.target.value)}
                  >
                    <option value={0}>Normal (0)</option>
                    <option value={1}>ST-T Wave Abnormality (1)</option>
                    <option value={2}>Left Ventricular Hypertrophy (2)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Max Heart Rate Achieved ({formData.thalach} bpm)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="60"
                    max="220"
                    value={formData.thalach}
                    onChange={(e) => handleInputChange("thalach", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 5: Exercise Induced Angina & ST Depression */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Exercise Induced Angina (exang)</label>
                  <select
                    className="form-select"
                    value={formData.exang}
                    onChange={(e) => handleInputChange("exang", e.target.value)}
                  >
                    <option value={0}>No (0)</option>
                    <option value={1}>Yes (1)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">ST Depression (oldpeak: {formData.oldpeak})</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    min="0.0"
                    max="8.0"
                    value={formData.oldpeak}
                    onChange={(e) => handleInputChange("oldpeak", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 6: Slope, Major Vessels, Thalassemia */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">ST Slope</label>
                  <select
                    className="form-select"
                    value={formData.slope}
                    onChange={(e) => handleInputChange("slope", e.target.value)}
                  >
                    <option value={0}>Upsloping (0)</option>
                    <option value={1}>Flat (1)</option>
                    <option value={2}>Downsloping (2)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Major Vessels (ca)</label>
                  <select
                    className="form-select"
                    value={formData.ca}
                    onChange={(e) => handleInputChange("ca", e.target.value)}
                  >
                    <option value={0}>0 Vessels</option>
                    <option value={1}>1 Vessel</option>
                    <option value={2}>2 Vessels</option>
                    <option value={3}>3 Vessels</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Thalassemia (thal)</label>
                  <select
                    className="form-select"
                    value={formData.thal}
                    onChange={(e) => handleInputChange("thal", e.target.value)}
                  >
                    <option value={1}>Normal (1)</option>
                    <option value={2}>Fixed Defect (2)</option>
                    <option value={3}>Reversible Defect (3)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary-custom w-100 py-3 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Running Persistent FastAPI Model...
                  </>
                ) : (
                  "⚡ Run AI Risk Evaluation"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Column */}
        <div className="col-lg-5">
          {result ? (
            <div className="custom-card p-4 p-md-5 h-100 d-flex flex-column">
              <div className="text-center mb-4">
                <span className="accuracy-chip mb-2">Validated 86.81% Test Accuracy</span>

                <div className="my-3">
                  <div
                    className="risk-score-display"
                    style={{ color: result.risk_color || (result.has_heart_disease_risk ? "#ef4444" : "#10b981") }}
                  >
                    {result.risk_score}%
                  </div>
                  <h4 className="fw-bold" style={{ color: result.risk_color }}>
                    {result.risk_tier || (result.has_heart_disease_risk ? "Elevated Risk Detected" : "Low Cardiac Risk")}
                  </h4>
                </div>

                <p className="text-muted small mb-0">{result.clinical_summary}</p>
              </div>

              {/* Recommendations */}
              <div className="p-3 bg-light rounded-3 mb-4">
                <h6 className="fw-bold mb-2">Clinical Recommendations</h6>
                <ul className="small text-muted ps-3 mb-0">
                  {(result.recommendations || []).map((rec, i) => (
                    <li key={i} className="mb-1">{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="mt-auto text-center">
                <Link
                  to="/doctors?speciality=Cardiologist"
                  className="btn btn-primary-custom w-100 py-2"
                >
                  Consult a Cardiologist Now →
                </Link>
              </div>
            </div>
          ) : (
            <div className="custom-card p-4 p-md-5 h-100 d-flex flex-column justify-content-center text-center">
              <div className="fs-1 mb-3">🫀</div>
              <h5 className="fw-bold mb-2">Ready for Evaluation</h5>
              <p className="text-muted small mb-4">
                Fill in the 13 clinical biomarkers or choose a sample profile on the left, then click <strong>"Run AI Risk Evaluation"</strong> to generate your personalized report.
              </p>
              <div className="p-3 bg-light rounded-3 text-start small text-muted">
                <strong>Model Highlights:</strong>
                <ul className="ps-3 mb-0 mt-1">
                  <li>Persistent FastAPI in-memory microservice</li>
                  <li>Logistic Regression with StandardScaler</li>
                  <li>Zero per-request subprocess spawn latency</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeartDisease;
