# ai/train_model.py

import pandas as pd
import numpy as np
import joblib
import os
import sys

# Fix import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

DATA_PATH = "ai/synthetic_drivers.csv"
MODEL_OUTPUT_PATH = "ai/best_model.pkl"
FEATURE_IMPORTANCE_OUTPUT = "ai/feature_importance.csv"


# ------------------------------------------------
# Load Dataset
# ------------------------------------------------

def load_data():
    df = pd.read_csv(DATA_PATH)
    X = df.drop("label", axis=1)
    y = df["label"]
    return X, y


# ------------------------------------------------
# Model Evaluation Metrics
# ------------------------------------------------

def evaluate_model(y_true, y_pred, y_prob):

    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "recall": recall_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "roc_auc": roc_auc_score(y_true, y_prob),
        "confusion_matrix": confusion_matrix(y_true, y_pred),
        "classification_report": classification_report(y_true, y_pred)
    }


# ------------------------------------------------
# Cross Validation
# ------------------------------------------------

def cross_validate_model(model, X, y):

    print("\n=== Cross Validation (5-Fold ROC-AUC) ===")

    scores = cross_val_score(
        model,
        X,
        y,
        cv=5,
        scoring="roc_auc"
    )

    for i, score in enumerate(scores):
        print(f"Fold {i+1}: {score:.4f}")

    print(f"\nAverage ROC-AUC: {scores.mean():.4f}")
    print(f"Std Deviation: {scores.std():.4f}")


# ------------------------------------------------
# Feature Importance
# ------------------------------------------------

def compute_feature_importance(model, feature_names):

    importances = model.feature_importances_

    importance_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    })

    importance_df = importance_df.sort_values(
        by="importance",
        ascending=False
    )

    print("\n=== Feature Importance (Random Forest) ===")
    print(importance_df)

    importance_df.to_csv(FEATURE_IMPORTANCE_OUTPUT, index=False)

    print(f"\nFeature importance saved to {FEATURE_IMPORTANCE_OUTPUT}")

    return importance_df


# ------------------------------------------------
# Train Models
# ------------------------------------------------

def train_models(X_train, X_test, y_train, y_test):

    results = {}

    # -----------------------------
    # Logistic Regression
    # -----------------------------

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    log_model = LogisticRegression(max_iter=1000)

    log_model.fit(X_train_scaled, y_train)

    log_preds = log_model.predict(X_test_scaled)
    log_probs = log_model.predict_proba(X_test_scaled)[:, 1]

    results["Logistic Regression"] = evaluate_model(
        y_test, log_preds, log_probs
    )

    # -----------------------------
    # Random Forest
    # -----------------------------

    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42
    )

    rf_model.fit(X_train, y_train)

    rf_preds = rf_model.predict(X_test)
    rf_probs = rf_model.predict_proba(X_test)[:, 1]

    results["Random Forest"] = evaluate_model(
        y_test, rf_preds, rf_probs
    )

    return results, log_model, rf_model, scaler


# ------------------------------------------------
# Main Training Pipeline
# ------------------------------------------------

def main():

    print("Loading dataset...")

    X, y = load_data()

    # -----------------------------
    # Cross Validation
    # -----------------------------

    rf_temp_model = RandomForestClassifier(
        n_estimators=200,
        random_state=42
    )

    cross_validate_model(rf_temp_model, X, y)

    # -----------------------------
    # Train/Test Split
    # -----------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("\nTraining models...")

    results, log_model, rf_model, scaler = train_models(
        X_train, X_test, y_train, y_test
    )

    # -----------------------------
    # Print Metrics
    # -----------------------------

    for model_name, metrics in results.items():

        print(f"\n=== {model_name} ===")

        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1 Score: {metrics['f1']:.4f}")
        print(f"ROC AUC: {metrics['roc_auc']:.4f}")

        print("Confusion Matrix:")
        print(metrics["confusion_matrix"])

    # -----------------------------
    # Feature Importance
    # -----------------------------

    compute_feature_importance(rf_model, X.columns)

    # -----------------------------
    # Select Best Model
    # -----------------------------

    best_model_name = max(
        results,
        key=lambda m: results[m]["roc_auc"]
    )

    print(f"\nBest model based on ROC-AUC: {best_model_name}")

    if best_model_name == "Random Forest":

        joblib.dump(rf_model, MODEL_OUTPUT_PATH)

    else:

        joblib.dump((log_model, scaler), MODEL_OUTPUT_PATH)

    print(f"Model saved to {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()