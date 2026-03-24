# ai/validate_model.py
#
# Validates the saved best_model.pkl against the SEPARATE test dataset.
# Prints full metrics: accuracy, precision, recall, F1, ROC-AUC,
# confusion matrix, and classification report.
#
# Run AFTER:
#   1. python ai/dataset_generator.py     → generates training data
#   2. python ai/train_model.py           → trains and saves best_model.pkl
#   3. python ai/test_dataset_generator.py → generates test data
#
# Then run:
#   python ai/validate_model.py
#
# The test set has NEVER been seen by the model during training,
# so these metrics reflect true generalisation performance.

import pandas as pd
import numpy as np
import joblib
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from sklearn.preprocessing import StandardScaler

MODEL_PATH    = os.path.join(os.path.dirname(os.path.abspath(__file__)), "best_model.pkl")
TEST_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_drivers.csv")


def load_test_data():
    df = pd.read_csv(TEST_DATA_PATH)
    X  = df.drop("label", axis=1)
    y  = df["label"]
    return X, y


def load_model():
    """
    Handles both model formats saved by train_model.py:
    - Random Forest: saved as a single model object
    - Logistic Regression: saved as (model, scaler) tuple
    """
    obj = joblib.load(MODEL_PATH)
    if isinstance(obj, tuple):
        model, scaler = obj
        model_type = "Logistic Regression"
    else:
        model  = obj
        scaler = None
        model_type = "Random Forest"
    return model, scaler, model_type


def print_separator(title=""):
    print("\n" + "=" * 60)
    if title:
        print(f"  {title}")
        print("=" * 60)


def validate():
    print_separator("PersoVault AI Model Validation")
    print(f"  Model:     {MODEL_PATH}")
    print(f"  Test data: {TEST_DATA_PATH}")

    # ── Load test data ────────────────────────────────────────
    print("\nLoading test dataset...")
    X_test, y_test = load_test_data()
    print(f"  Test samples: {len(X_test)}")
    print(f"  Features:     {list(X_test.columns)}")
    print(f"  Class balance: {y_test.value_counts().to_dict()}")

    # ── Load model ────────────────────────────────────────────
    print("\nLoading model...")
    model, scaler, model_type = load_model()
    print(f"  Model type: {model_type}")

    # ── Scale if needed (Logistic Regression) ─────────────────
    if scaler is not None:
        X_test_input = scaler.transform(X_test)
    else:
        X_test_input = X_test

    # ── Predictions ───────────────────────────────────────────
    y_pred = model.predict(X_test_input)
    y_prob = model.predict_proba(X_test_input)[:, 1]

    # ── Core Metrics ──────────────────────────────────────────
    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall    = recall_score(y_test, y_pred)
    f1        = f1_score(y_test, y_pred)
    roc_auc   = roc_auc_score(y_test, y_prob)
    cm        = confusion_matrix(y_test, y_pred)

    print_separator("Validation Metrics (Unseen Test Set)")
    print(f"  Accuracy:  {accuracy:.4f}  ({accuracy*100:.2f}%)")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")

    # ── Confusion Matrix ──────────────────────────────────────
    print_separator("Confusion Matrix")
    tn, fp, fn, tp = cm.ravel()
    print(f"""
                    Predicted
                    0 (Safe)   1 (Susp.)
  Actual  0 (Safe)  {tn:>6}     {fp:>6}
          1 (Susp.) {fn:>6}     {tp:>6}

  True Negatives  (TN): {tn}  — Correctly predicted safe
  False Positives (FP): {fp}  — Safe driver flagged as risky
  False Negatives (FN): {fn}  — Risky driver missed
  True Positives  (TP): {tp}  — Correctly predicted suspension
    """)

    # ── Classification Report ─────────────────────────────────
    print_separator("Classification Report")
    print(classification_report(
        y_test, y_pred,
        target_names=["Not Suspended", "Suspended"]
    ))

    # ── Feature Importance (Random Forest only) ───────────────
    if model_type == "Random Forest":
        print_separator("Feature Importance")
        feature_names  = list(X_test.columns)
        importances    = model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]

        for rank, idx in enumerate(sorted_indices, 1):
            bar = "█" * int(importances[idx] * 50)
            print(f"  {rank:>2}. {feature_names[idx]:<35} {importances[idx]:.4f}  {bar}")

    # ── Summary ───────────────────────────────────────────────
    print_separator("Summary")
    grade = (
        "EXCELLENT" if roc_auc >= 0.90 else
        "GOOD"      if roc_auc >= 0.80 else
        "ACCEPTABLE" if roc_auc >= 0.70 else
        "NEEDS IMPROVEMENT"
    )
    print(f"""
  Model:      {model_type}
  ROC-AUC:    {roc_auc:.4f}  → {grade}
  Accuracy:   {accuracy*100:.2f}%
  F1 Score:   {f1:.4f}

  The test set ({len(X_test)} drivers) was generated with a different
  random seed and was NEVER seen during training.
  These metrics represent the model's true generalisation ability.
    """)

    # ── Save metrics to CSV for admin dashboard ───────────────
    metrics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "validation_metrics.csv")
    pd.DataFrame([{
        "model_type":  model_type,
        "accuracy":    round(accuracy,  4),
        "precision":   round(precision, 4),
        "recall":      round(recall,    4),
        "f1":          round(f1,        4),
        "roc_auc":     round(roc_auc,   4),
        "tn": tn, "fp": fp, "fn": fn, "tp": tp,
        "test_samples": len(X_test),
    }]).to_csv(metrics_path, index=False)

    print(f"  Metrics saved to: {metrics_path}")
    print("=" * 60)


if __name__ == "__main__":
    validate()