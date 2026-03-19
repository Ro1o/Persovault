from services.validation_engine import validate_driver
from services.stability_index import compute_stability
from services.trend_analysis import calculate_trend
from services.trust_manager import compute_trust
from services.proximity import compute_proximity
from services.risk_classifier import classify_risk
from utils.signature import sign_passport
from ai.ai_engine import BehaviouralAIEngine

from datetime import datetime, timedelta, timezone


def generate_passport(driver, verification_mode):

    compliance_status = validate_driver(driver)
    stability = compute_stability(driver)
    trend = calculate_trend(driver)
    trust = compute_trust(driver, verification_mode)
    proximity = compute_proximity(driver)
    risk_class = classify_risk(stability, proximity, trend)

    # -----------------------------
    # Convert trend for AI model
    # -----------------------------
    trend_mapping = {
        "INCREASING": 1,
        "STABLE": 0,
        "DECREASING": -1
    }

    trend_encoded = trend_mapping.get(trend, 0)

    # -----------------------------
    # AI ENGINE
    # -----------------------------
    ai_engine = BehaviouralAIEngine()

    ai_features = {
        "current_points": driver.current_points,
        "offences_last_12m": driver.offences_last_12m,
        "minor_offences": driver.minor_offences,
        "moderate_offences": driver.moderate_offences,
        "severe_offences": driver.severe_offences,
        "days_since_last_offence": driver.days_since_last_offence,
        "avg_days_between_offences": driver.avg_days_between_offences,
        "years_since_licence_issue": driver.years_since_licence_issue,
        "suspension_proximity": proximity,
        "stability_index": stability,
        "trend_encoded": trend_encoded
    }

    ai_result = ai_engine.predict(ai_features)

    # -----------------------------
    # Expiry Metadata (timezone-safe)
    # -----------------------------
    issued_at = datetime.now(timezone.utc)
    validity_seconds = 300
    expires_at = issued_at + timedelta(seconds=validity_seconds)

    passport = {
        "driver_id": driver.driver_id,

        "metadata": {
            "issued_at": issued_at.isoformat(),
            "expires_at": expires_at.isoformat(),
            "validity_seconds": validity_seconds
        },

        "compliance": {
            "status": compliance_status,
            "suspension_proximity": proximity
        },

        "behaviour": {
            "stability_index": stability,
            "trend": trend
        },

        "risk": {
            "classification": risk_class
        },

        "trust": {
            "verification_mode": verification_mode,
            "trust_level": trust
        },

        # -----------------------------
        # AI BLOCK
        # -----------------------------
        "ai_prediction": {
            "suspension_probability_6m": ai_result["suspension_probability_6m"],
            "risk_level": ai_result["risk_level"]
        },

        "ai_explanation": ai_result["explanation"],

        "ai_simulation": ai_result["simulation"]
    }

    # Sign AFTER full object built
    signature = sign_passport(passport)
    passport["signature"] = signature

    return passport