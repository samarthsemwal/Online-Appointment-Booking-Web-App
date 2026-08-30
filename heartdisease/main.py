"""
iCom Pro - Heart Disease Prediction Persistent FastAPI Microservice
Model: Logistic Regression (86.81% Test Accuracy)
Port: 8000
"""

import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="iCom Pro - Heart Disease Prediction API",
    description="Persistent microservice delivering real-time clinical heart disease risk evaluation with 86.81% test accuracy.",
    version="2.0.0"
)

# Enable CORS for Node.js API and React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global artifacts loaded into memory persistently on startup
ARTIFACTS: Dict[str, Any] = {}
MODEL_ACCURACY = 86.81

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'heart_model.pkl')
scaler_path = os.path.join(current_dir, 'scaler.pkl')
cols_path = os.path.join(current_dir, 'model_columns.pkl')

def load_artifacts():
    try:
        if os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(cols_path):
            ARTIFACTS['model'] = joblib.load(model_path)
            ARTIFACTS['scaler'] = joblib.load(scaler_path)
            ARTIFACTS['model_columns'] = joblib.load(cols_path)
            print("✓ Successfully loaded Heart Disease ML model artifacts into memory.")
        else:
            print("⚠ Model artifacts not found. Please run train_model.py first.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")

@app.on_event("startup")
def startup_event():
    load_artifacts()

class HeartDataInput(BaseModel):
    age: float = Field(..., description="Age in years", ge=1, le=120)
    sex: float = Field(..., description="Sex (1 = male, 0 = female)", ge=0, le=1)
    cp: float = Field(..., description="Chest pain type (0: Typical, 1: Atypical, 2: Non-anginal, 3: Asymptomatic)", ge=0, le=3)
    trestbps: float = Field(..., description="Resting blood pressure in mm Hg", ge=50, le=300)
    chol: float = Field(..., description="Serum cholesterol in mg/dl", ge=50, le=700)
    fbs: float = Field(..., description="Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)", ge=0, le=1)
    restecg: float = Field(..., description="Resting electrocardiographic results (0, 1, 2)", ge=0, le=2)
    thalach: float = Field(..., description="Maximum heart rate achieved", ge=40, le=260)
    exang: float = Field(..., description="Exercise induced angina (1 = yes, 0 = no)", ge=0, le=1)
    oldpeak: float = Field(..., description="ST depression induced by exercise relative to rest", ge=0.0, le=10.0)
    slope: float = Field(..., description="Slope of the peak exercise ST segment (0, 1, 2)", ge=0, le=2)
    ca: float = Field(..., description="Number of major vessels (0-3) colored by flourosopy", ge=0, le=4)
    thal: float = Field(..., description="Thalassemia (1 = normal, 2 = fixed defect, 3 = reversable defect)", ge=0, le=3)

    class Config:
        json_schema_extra = {
            "example": {
                "age": 58,
                "sex": 1,
                "cp": 2,
                "trestbps": 140,
                "chol": 240,
                "fbs": 0,
                "restecg": 1,
                "thalach": 160,
                "exang": 0,
                "oldpeak": 1.2,
                "slope": 2,
                "ca": 0,
                "thal": 2
            }
        }

@app.get("/")
def read_root():
    return {
        "service": "iCom Pro Heart Disease Prediction Microservice",
        "status": "online",
        "algorithm": "Logistic Regression with StandardScaler",
        "test_accuracy": f"{MODEL_ACCURACY}%",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict"
        }
    }

@app.get("/health")
def health_check():
    loaded = 'model' in ARTIFACTS and 'scaler' in ARTIFACTS
    return {
        "status": "healthy" if loaded else "degraded",
        "model_loaded": loaded,
        "model_type": "Logistic Regression (Persistent in-memory)",
        "test_accuracy": f"{MODEL_ACCURACY}%",
        "dataset": "Cleveland Heart Disease Dataset",
        "features_count": 13
    }

@app.post("/predict")
def predict_heart_disease(data: HeartDataInput):
    if 'model' not in ARTIFACTS or 'scaler' not in ARTIFACTS or 'model_columns' not in ARTIFACTS:
        load_artifacts()
        if 'model' not in ARTIFACTS:
            raise HTTPException(status_code=500, detail="ML model artifacts not loaded into memory.")

    try:
        model = ARTIFACTS['model']
        scaler = ARTIFACTS['scaler']
        model_columns = ARTIFACTS['model_columns']

        # Construct single-row DataFrame
        raw_dict = data.dict()
        features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        input_data = [raw_dict[f] for f in features]
        df = pd.DataFrame([input_data], columns=features)

        # Scale continuous features
        cols_to_scale = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
        df[cols_to_scale] = scaler.transform(df[cols_to_scale])

        # One-hot encode categorical features
        categorical_val = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal']
        df = pd.get_dummies(df, columns=categorical_val)

        # Align with training columns
        df = df.reindex(columns=model_columns, fill_value=0)

        # Predict classification & probabilities
        prediction = int(model.predict(df)[0])
        probabilities = model.predict_proba(df)[0]
        risk_probability = float(probabilities[1] * 100) # Probability of positive class (heart disease risk)

        # Determine risk tier & recommendations
        if risk_probability >= 65.0:
            risk_tier = "High Risk"
            risk_color = "#ef4444"
            recommendations = [
                "Schedule an immediate consultation with a certified Cardiologist.",
                "Conduct a comprehensive cardiac stress test (TMT) and echocardiogram.",
                "Monitor daily resting blood pressure and limit dietary sodium intake (<2g/day).",
                "Avoid strenuous unmonitored physical exertion until evaluated."
            ]
        elif risk_probability >= 35.0:
            risk_tier = "Moderate Risk"
            risk_color = "#f59e0b"
            recommendations = [
                "Schedule a routine cardiovascular check-up with a general physician.",
                "Implement a Mediterranean-style cardio-protective diet rich in omega-3 fatty acids.",
                "Engage in 30 minutes of moderate aerobic exercise (brisk walking) 5 days a week.",
                "Recheck lipid profile and fasting blood glucose within 3 months."
            ]
        else:
            risk_tier = "Low Risk"
            risk_color = "#10b981"
            recommendations = [
                "Maintain your current balanced diet and regular physical activity routine.",
                "Perform annual routine health wellness screenings.",
                "Stay hydrated and maintain healthy sleep hygiene (7-8 hours nightly)."
            ]

        return {
            "success": True,
            "prediction": prediction,
            "has_heart_disease_risk": bool(prediction == 1),
            "risk_score": round(risk_probability, 2),
            "risk_tier": risk_tier,
            "risk_color": risk_color,
            "confidence": round(float(np.max(probabilities) * 100), 2),
            "model_metadata": {
                "algorithm": "Logistic Regression (Persistent Microservice)",
                "test_accuracy": f"{MODEL_ACCURACY}%"
            },
            "recommendations": recommendations,
            "clinical_summary": f"Patient exhibits a {risk_tier.lower()} profile with estimated cardiac event probability of {round(risk_probability, 1)}%."
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
