# ai/generate_evaluation_plots.py

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_curve, auc, confusion_matrix

DATA_PATH = "ai/synthetic_drivers.csv"
MODEL_PATH = "ai/best_model.pkl"


def main():

    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    X = df.drop("label", axis=1)
    y = df["label"]

    feature_names = X.columns

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("Loading trained model...")
    loaded = joblib.load(MODEL_PATH)

    # Logistic Regression case
    if isinstance(loaded, tuple):
        model, scaler = loaded
        X_test = scaler.transform(X_test)

    else:
        model = loaded

    y_probs = model.predict_proba(X_test)[:, 1]
    y_preds = model.predict(X_test)

    # ====================================================
    # 1️⃣ ROC CURVE
    # ====================================================

    fpr, tpr, _ = roc_curve(y_test, y_probs)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(6, 5))

    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.3f}")
    plt.plot([0, 1], [0, 1], linestyle="--")

    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve – Suspension Risk Prediction")

    plt.legend()

    plt.tight_layout()

    plt.savefig("ai/roc_curve.png")
    plt.show()

    # ====================================================
    # 2️⃣ CONFUSION MATRIX HEATMAP
    # ====================================================

    cm = confusion_matrix(y_test, y_preds)

    plt.figure(figsize=(6, 5))

    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["Predicted Safe", "Predicted Risk"],
        yticklabels=["Actual Safe", "Actual Risk"]
    )

    plt.title("Confusion Matrix")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")

    plt.tight_layout()

    plt.savefig("ai/confusion_matrix.png")
    plt.show()

    # ====================================================
    # 3️⃣ FEATURE IMPORTANCE
    # ====================================================

    if hasattr(model, "feature_importances_"):

        importances = model.feature_importances_

        importance_df = pd.DataFrame({
            "feature": feature_names,
            "importance": importances
        }).sort_values(by="importance", ascending=True)

        plt.figure(figsize=(8, 6))

        plt.barh(
            importance_df["feature"],
            importance_df["importance"]
        )

        plt.xlabel("Importance Score")
        plt.title("Feature Importance – Random Forest")

        plt.tight_layout()

        plt.savefig("ai/feature_importance.png")
        plt.show()

        print("Feature importance plot saved.")

    else:
        print("Feature importance not available for Logistic Regression.")

    print("\nPlots saved:")
    print(" - ai/roc_curve.png")
    print(" - ai/confusion_matrix.png")
    print(" - ai/feature_importance.png")


if __name__ == "__main__":
    main()