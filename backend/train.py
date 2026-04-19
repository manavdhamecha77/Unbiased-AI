"""
Training Script — Adult Census Dataset
========================================
Trains two Logistic Regression models:
  1. Model_Biased  — trained on raw, unbalanced data
  2. Model_Fair    — trained with AIF360's Reweighing algorithm

Saves:
  - models/model_biased.joblib
  - models/model_fair.joblib
  - models/label_encoder.joblib
  - models/scaler.joblib
  - data/X_test.joblib
  - data/y_test.joblib
  - data/sensitive_test.joblib

Usage:
    cd backend && python train.py
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from pathlib import Path
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from aif360.datasets import BinaryLabelDataset
from aif360.algorithms.preprocessing import Reweighing


# Config

MODEL_DIR = Path("models")
DATA_DIR = Path("data")
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

CATEGORICAL_COLS = [
    "workclass", "education", "marital_status", "occupation",
    "relationship", "race", "sex", "native_country",
]

NUMERICAL_COLS = [
    "age", "education_num", "capital_gain", "capital_loss", "hours_per_week",
]

TARGET = "income"


# 1. Load and clean data

print("=" * 60)
print("SENTINEL — Model Training Pipeline")
print("=" * 60)

print("\n[1/6] Loading Adult Census dataset...")

columns = [
    "age", "workclass", "fnlwgt", "education", "education_num",
    "marital_status", "occupation", "relationship", "race", "sex",
    "capital_gain", "capital_loss", "hours_per_week", "native_country", "income",
]

# Download from UCI if not present
data_file = DATA_DIR / "adult.csv"
if not data_file.exists():
    print("      Downloading from UCI ML Repository...")
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data"
    df = pd.read_csv(url, names=columns, sep=r",\s*", engine="python", na_values="?")
    df.to_csv(data_file, index=False)
else:
    df = pd.read_csv(data_file)

# Drop rows with missing values
df.dropna(inplace=True)
# Drop fnlwgt (sampling weight, not useful)
df.drop("fnlwgt", axis=1, inplace=True, errors="ignore")

# Binarize target
df[TARGET] = (df[TARGET].str.strip().str.startswith(">50K")).astype(int)

print(f"      Dataset shape: {df.shape}")
print(f"      Target distribution:\n{df[TARGET].value_counts().to_string()}")


# 2. Save raw sensitive features BEFORE encoding

df.reset_index(drop=True, inplace=True)
sensitive_raw = df[["race", "sex"]].copy()


# 3. Encode features

print("\n[2/6] Encoding features...")

label_encoders = {}
for col in CATEGORICAL_COLS:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

scaler = StandardScaler()

feature_cols = NUMERICAL_COLS + CATEGORICAL_COLS
X = df[feature_cols].copy()
y = df[TARGET].values

X[NUMERICAL_COLS] = scaler.fit_transform(X[NUMERICAL_COLS])


# 4. Train/Test split

print("\n[3/6] Splitting data...")

X_train, X_test, y_train, y_test, sens_train, sens_test = train_test_split(
    X.values, y, sensitive_raw, test_size=0.2, random_state=42, stratify=y
)

sens_test = sens_test.reset_index(drop=True)

print(f"      Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")


# 4. Train Model_Biased (raw data, no mitigation)

print("\n[4/6] Training Model_Biased...")

model_biased = LogisticRegression(max_iter=1000, random_state=42, solver="lbfgs")
model_biased.fit(X_train, y_train)

y_pred_biased = model_biased.predict(X_test)
acc_biased = accuracy_score(y_test, y_pred_biased)
print(f"      Accuracy: {acc_biased:.4f}")
print(classification_report(y_test, y_pred_biased, target_names=["<=50K", ">50K"]))


# 5. Train Model_Fair (AIF360 Reweighing)

print("\n[5/6] Training Model_Fair with Reweighing...")

# Reconstruct a DataFrame for AIF360
train_df = pd.DataFrame(X_train, columns=feature_cols)
train_df[TARGET] = y_train
# Need sex in original encoded form for AIF360 sensitive attribute
# sex: Female=0, Male=1 (from LabelEncoder)
sex_col_idx = feature_cols.index("sex")

# Create BinaryLabelDataset
aif_dataset = BinaryLabelDataset(
    df=train_df,
    label_names=[TARGET],
    protected_attribute_names=["sex"],
    favorable_label=1,
    unfavorable_label=0,
)

# Apply Reweighing
privileged_groups = [{"sex": label_encoders["sex"].transform(["Male"])[0]}]
unprivileged_groups = [{"sex": label_encoders["sex"].transform(["Female"])[0]}]

reweighing = Reweighing(
    unprivileged_groups=unprivileged_groups,
    privileged_groups=privileged_groups,
)
rw_dataset = reweighing.fit_transform(aif_dataset)

# Extract sample weights
sample_weights = rw_dataset.instance_weights

# Train with sample weights
model_fair = LogisticRegression(max_iter=1000, random_state=42, solver="lbfgs")
model_fair.fit(X_train, y_train, sample_weight=sample_weights)

y_pred_fair = model_fair.predict(X_test)
acc_fair = accuracy_score(y_test, y_pred_fair)
print(f"      Accuracy: {acc_fair:.4f}")
print(classification_report(y_test, y_pred_fair, target_names=["<=50K", ">50K"]))


# 6. Save artifacts

print("\n[6/6] Saving models and artifacts...")

joblib.dump(model_biased, MODEL_DIR / "model_biased.joblib")
joblib.dump(model_fair, MODEL_DIR / "model_fair.joblib")
joblib.dump(label_encoders, MODEL_DIR / "label_encoder.joblib")
joblib.dump(scaler, MODEL_DIR / "scaler.joblib")

joblib.dump(X_test, DATA_DIR / "X_test.joblib")
joblib.dump(y_test, DATA_DIR / "y_test.joblib")
joblib.dump(sens_test.reset_index(drop=True), DATA_DIR / "sensitive_test.joblib")


# Quick fairness summary

print("\n" + "=" * 60)
print("FAIRNESS SUMMARY")
print("=" * 60)

for name, preds in [("Biased", y_pred_biased), ("Fair", y_pred_fair)]:
    sex_vals = sens_test["sex"].values
    male_rate = preds[sex_vals == "Male"].mean()
    female_rate = preds[sex_vals == "Female"].mean()
    dir_val = female_rate / male_rate if male_rate > 0 else 0
    print(f"\n  {name} Model:")
    print(f"    Male selection rate:   {male_rate:.4f}")
    print(f"    Female selection rate:  {female_rate:.4f}")
    print(f"    Disparate Impact Ratio: {dir_val:.4f}  {'✓ FAIR' if dir_val >= 0.8 else '✗ UNFAIR'}")

print("\n✓ All artifacts saved. Ready to serve predictions.")
print("  Run: uvicorn app.main:app --reload")
