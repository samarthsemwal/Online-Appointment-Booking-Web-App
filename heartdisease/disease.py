# ==============================
# HEART DISEASE PREDICTION MODEL
# ==============================

# Import Libraries
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

sns.set_style("whitegrid")
plt.style.use("fivethirtyeight")

# ==============================
# LOAD DATA
# ==============================
df = pd.read_csv("heart.csv")

print(df.head())

# ==============================
# EDA (Exploratory Data Analysis)
# ==============================

print(df.describe())

# Target count
df.target.value_counts().plot(kind="bar", color=["salmon", "lightblue"])
plt.title("Target Distribution")
# plt.show()

# Missing values
print(df.isna().sum())

# Separate categorical & continuous
categorical_val = []
continuous_val = []

for column in df.columns:
    if len(df[column].unique()) <= 10:
        categorical_val.append(column)
    else:
        continuous_val.append(column)

# ==============================
# DATA VISUALIZATION
# ==============================

# Categorical plots
plt.figure(figsize=(15, 15))
for i, column in enumerate(categorical_val, 1):
    plt.subplot(3, 3, i)
    df[df["target"] == 0][column].hist(alpha=0.6, color='blue')
    df[df["target"] == 1][column].hist(alpha=0.6, color='red')
    plt.title(column)
# plt.show()

# Continuous plots
plt.figure(figsize=(15, 15))
for i, column in enumerate(continuous_val, 1):
    plt.subplot(3, 2, i)
    df[df["target"] == 0][column].hist(alpha=0.6, color='blue')
    df[df["target"] == 1][column].hist(alpha=0.6, color='red')
    plt.title(column)
# plt.show()

# ==============================
# CORRELATION
# ==============================
corr_matrix = df.corr()
plt.figure(figsize=(12, 10))
sns.heatmap(corr_matrix, annot=True, cmap="YlGnBu")
# plt.show()

# ==============================
# DATA PREPROCESSING
# ==============================

categorical_val.remove('target')

dataset = pd.get_dummies(df, columns=categorical_val)

# Scaling
scaler = StandardScaler()
cols_to_scale = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
dataset[cols_to_scale] = scaler.fit_transform(dataset[cols_to_scale])

# ==============================
# TRAIN TEST SPLIT
# ==============================
X = dataset.drop('target', axis=1)
y = dataset['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# ==============================
# MODEL TRAINING
# ==============================
model = LogisticRegression(solver='liblinear')
model.fit(X_train, y_train)

# ==============================
# EVALUATION FUNCTION
# ==============================
def evaluate(model, X, y, name="Data"):
    pred = model.predict(X)
    print(f"\n{name} Results")
    print("="*40)
    print("Accuracy:", accuracy_score(y, pred))
    print("\nConfusion Matrix:\n", confusion_matrix(y, pred))
    print("\nClassification Report:\n", classification_report(y, pred))

# Evaluate
evaluate(model, X_train, y_train, "Training")
evaluate(model, X_test, y_test, "Testing")

# ==============================
# FINAL ACCURACY
# ==============================
train_acc = accuracy_score(y_train, model.predict(X_train)) * 100
test_acc = accuracy_score(y_test, model.predict(X_test)) * 100

print("\nFinal Accuracy:")
print("Training:", train_acc)
print("Testing:", test_acc)

# ==============================
# SAVE MODEL AND SCALER
# ==============================
import os
joblib.dump(model, 'heart_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(list(X.columns), 'model_columns.pkl')
print("\nModel, scaler, and model columns saved successfully.")