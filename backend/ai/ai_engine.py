# ai/ai_engine.py

import joblib
import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = "ai/best_model.pkl"


class BehaviouralAIEngine:

    def __init__(self):
        self.model_data = joblib.load(MODEL_PATH)

        if isinstance(self.model_data, tuple):
            self.model, self.scaler = self.model_data
        else:
            self.model = self.model_data
            self.scaler = None

        self.feature_order = [
            "current_points",
            "offences_last_12m",
            "minor_offences",
            "moderate_offences",
            "severe_offences",
            "days_since_last_offence",
            "avg_days_between_offences",
            "years_since_licence_issue",
            "suspension_proximity",
            "stability_index",
            "trend_encoded"
        ]

    # -----------------------------
    # Main Prediction Interface
    # -----------------------------
    def predict(self, features_dict):

        feature_df = self._prepare_dataframe(features_dict)

        probability = self._predict_probability(feature_df)
        risk_level = self._map_risk_level(probability)

        explanation = self._generate_explanation(feature_df)
        simulation = self._simulate_no_offence(features_dict)

        return {
            "suspension_probability_6m": round(float(probability), 4),
            "risk_level": risk_level,
            "explanation": explanation,
            "simulation": simulation
        }

    # -----------------------------
    # Core Prediction Logic
    # -----------------------------
    def _prepare_dataframe(self, features_dict):

        for feature in self.feature_order:
            if feature not in features_dict:
                raise ValueError(f"Missing required feature: {feature}")

        return pd.DataFrame(
            [[features_dict[f] for f in self.feature_order]],
            columns=self.feature_order
        )

    def _predict_probability(self, feature_df):

        if self.scaler:
            feature_processed = self.scaler.transform(feature_df)
        else:
            feature_processed = feature_df

        return self.model.predict_proba(feature_processed)[0][1]

    def _map_risk_level(self, probability):

        if probability < 0.30:
            return "LOW"
        elif probability < 0.70:
            return "MEDIUM"
        else:
            return "HIGH"

    # -----------------------------
    # Explainability Layer
    # -----------------------------
    def _generate_explanation(self, feature_df):

        # Only available for Logistic Regression
        if not hasattr(self.model, "coef_"):
            return {"top_risk_factors": []}

        coefficients = self.model.coef_[0]
        feature_values = feature_df.iloc[0].values

        contributions = coefficients * feature_values

        feature_contributions = list(zip(self.feature_order, contributions))

        # Sort by highest positive contribution
        feature_contributions.sort(key=lambda x: x[1], reverse=True)

        top_features = [
            feature for feature, value in feature_contributions[:3]
            if value > 0
        ]

        return {
            "top_risk_factors": top_features
        }

    # -----------------------------
    # What-If Simulation
    # -----------------------------
    def _simulate_no_offence(self, features_dict):

        simulated = features_dict.copy()

        # Simulate 90 days without offence
        simulated["days_since_last_offence"] += 90

        # Improve behavioural indicators
        simulated["trend_encoded"] = 0
        simulated["stability_index"] = min(
            100,
            simulated["stability_index"] + 10
        )

        feature_df = self._prepare_dataframe(simulated)
        new_probability = self._predict_probability(feature_df)
        new_risk = self._map_risk_level(new_probability)

        return {
            "if_no_offence_90_days": round(float(new_probability), 4),
            "projected_risk_level": new_risk
        }