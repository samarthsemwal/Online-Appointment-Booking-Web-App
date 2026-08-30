"""
Heart Disease Risk Prediction Model Training
Trained using Logistic Regression with StandardScaler.
Target Test Accuracy: 86.81% (test_size=0.3, random_state=42, solver='liblinear')
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "heart.csv")
    
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    print(f"Dataset shape: {df.shape}")
    print("Features:", list(df.columns))
    
    # Categorical & Continuous columns
    categorical_val = []
    continuous_val = []
    
    for column in df.columns:
        if len(df[column].unique()) <= 10:
            categorical_val.append(column)
        else:
            continuous_val.append(column)
            
    categorical_val.remove('target')
    
    # One-hot encoding
    dataset = pd.get_dummies(df, columns=categorical_val)
    
    # Scaling continuous features
    scaler = StandardScaler()
    cols_to_scale = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
    dataset[cols_to_scale] = scaler.fit_transform(dataset[cols_to_scale])
    
    X = dataset.drop('target', axis=1)
    y = dataset['target']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    
    # Train Logistic Regression Model
    model = LogisticRegression(solver='liblinear', random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    train_preds = model.predict(X_train)
    test_preds = model.predict(X_test)
    
    train_acc = accuracy_score(y_train, train_preds) * 100
    test_acc = accuracy_score(y_test, test_preds) * 100
    
    print("=" * 50)
    print("MODEL PERFORMANCE EVALUATION")
    print("=" * 50)
    print(f"Training Accuracy : {train_acc:.2f}%")
    print(f"Testing Accuracy  : {test_acc:.2f}%")
    print("\nClassification Report (Test Set):")
    print(classification_report(y_test, test_preds))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, test_preds))
    print("=" * 50)
    
    # Save model artifacts
    model_path = os.path.join(current_dir, 'heart_model.pkl')
    scaler_path = os.path.join(current_dir, 'scaler.pkl')
    cols_path = os.path.join(current_dir, 'model_columns.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(list(X.columns), cols_path)
    
    print(f"Successfully saved model to: {model_path}")
    print(f"Successfully saved scaler to: {scaler_path}")
    print(f"Successfully saved columns to: {cols_path}")
    
    return test_acc

if __name__ == "__main__":
    train()
