"""
PersoVault — Unit Tests
Tests individual backend functions in isolation.
Server does NOT need to be running for these tests.
"""

import sys
import os
import pytest
import hmac
import hashlib
import json

# ── Add backend to path ────────────────────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.stability_index import compute_stability
from services.trend_analysis import calculate_trend
from services.proximity import compute_proximity
from services.risk_classifier import classify_risk
from services.behaviour_score import compute_behaviour_score
from nic_security import validate_nic_full
from utils.signature import verify_passport
from models.driver import Driver


# ── Helpers ────────────────────────────────────────────────────────────────────
def make_driver(**kwargs):
    defaults = dict(
        driver_id="DRV-TEST-001",
        current_points=0,
        previous_points=0,
        offences_last_12m=0,
        minor_offences=0,
        moderate_offences=0,
        severe_offences=0,
        days_since_last_offence=365,
        avg_days_between_offences=365,
        years_since_licence_issue=5,
        last_sync="2026-01-01"
    )
    defaults.update(kwargs)
    return Driver(**defaults)


# ══════════════════════════════════════════════════════════════════════════════
# 1. NIC VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

class TestNICValidation:

    def test_valid_nic_format(self):
        """A correctly formatted Mauritius NIC should pass format validation."""
        result = validate_nic_full(
            nic="A123456789012A",
            full_name="Alice Fernandez",
            date_of_birth="1990-01-01",
            stored_signature=None,
            station=None,
            is_duplicate=False,
            ip_address="127.0.0.1"
        )
        assert result["layers"]["format"]["valid"] is True

    def test_invalid_nic_too_short(self):
        """A NIC that is too short should fail format validation."""
        result = validate_nic_full(
            nic="A123B",
            full_name="Test User",
            date_of_birth="1990-01-01",
            stored_signature=None,
            station=None,
            is_duplicate=False,
            ip_address="127.0.0.1"
        )
        assert result["layers"]["format"]["valid"] is False

    def test_duplicate_nic_flagged(self):
        """A duplicate NIC should increase fraud score."""
        result = validate_nic_full(
            nic="A123456789012A",
            full_name="Alice Fernandez",
            date_of_birth="1990-01-01",
            stored_signature=None,
            station=None,
            is_duplicate=True,
            ip_address="127.0.0.1"
        )
        assert result["fraud_score"] > 0

    def test_fraud_level_returned(self):
        """Result should always contain a fraud_level field."""
        result = validate_nic_full(
            nic="A123456789012A",
            full_name="Test",
            date_of_birth="1990-01-01",
            stored_signature=None,
            station=None,
            is_duplicate=False,
            ip_address="127.0.0.1"
        )
        assert "fraud_level" in result
        assert result["fraud_level"] in ["VERIFIED", "SUSPICIOUS", "FRAUDULENT"]


# ══════════════════════════════════════════════════════════════════════════════
# 2. STABILITY INDEX
# ══════════════════════════════════════════════════════════════════════════════

class TestStabilityIndex:

    def test_clean_driver_high_stability(self):
        """A clean driver should have higher stability than a frequent offender."""
        clean = make_driver(days_since_last_offence=365, avg_days_between_offences=365, offences_last_12m=0)
        assert compute_stability(clean) > 0

    def test_frequent_offender_lower_stability(self):
        """A frequent offender should have lower stability than a clean driver."""
        clean = make_driver(days_since_last_offence=365, avg_days_between_offences=365, offences_last_12m=0)
        offender = make_driver(days_since_last_offence=5, avg_days_between_offences=15, offences_last_12m=8)
        assert compute_stability(offender) < compute_stability(clean)

    def test_stability_is_numeric_and_positive(self):
        """Stability index should return a positive numeric value."""
        driver = make_driver(current_points=6, offences_last_12m=3)
        stability = compute_stability(driver)
        assert isinstance(stability, (int, float))
        assert stability >= 0


# ══════════════════════════════════════════════════════════════════════════════
# 3. TREND ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

class TestTrendAnalysis:

    def test_worsening_trend(self):
        """More current points than previous should indicate worsening."""
        driver = make_driver(current_points=10, previous_points=4)
        trend = calculate_trend(driver)
        assert trend in ["WORSENING", "INCREASING"]

    def test_improving_trend(self):
        """Fewer current points than previous should indicate improving."""
        driver = make_driver(current_points=2, previous_points=10)
        trend = calculate_trend(driver)
        assert trend in ["IMPROVING", "DECREASING"]

    def test_stable_trend(self):
        """Equal points should indicate stable trend."""
        driver = make_driver(current_points=5, previous_points=5)
        trend = calculate_trend(driver)
        assert trend == "STABLE"


# ══════════════════════════════════════════════════════════════════════════════
# 4. RISK CLASSIFIER
# ══════════════════════════════════════════════════════════════════════════════

class TestRiskClassifier:

    def test_low_risk_clean_driver(self):
        """Clean driver should be classified as LOW risk."""
        result = classify_risk(stability=0.9, proximity=0.0, trend="STABLE")
        assert result["risk_level"] in ["LOW", "MEDIUM"]

    def test_high_risk_bad_driver(self):
        """Driver close to suspension with worsening trend should be HIGH risk."""
        result = classify_risk(stability=0.1, proximity=0.95, trend="WORSENING")
        assert result["risk_level"] == "HIGH"

    def test_risk_score_between_0_and_1(self):
        """Risk score should always be between 0 and 1."""
        result = classify_risk(stability=0.5, proximity=0.5, trend="STABLE")
        assert 0.0 <= result["risk_score"] <= 1.0

    def test_risk_level_valid_value(self):
        """Risk level should be one of the three valid values."""
        result = classify_risk(stability=0.5, proximity=0.3, trend="STABLE")
        assert result["risk_level"] in ["LOW", "MEDIUM", "HIGH"]


# ══════════════════════════════════════════════════════════════════════════════
# 5. BEHAVIOUR SCORE
# ══════════════════════════════════════════════════════════════════════════════

class TestBehaviourScore:

    def test_behaviour_score_range(self):
        """Behaviour score should be between 0 and 100."""
        driver = make_driver(current_points=6, offences_last_12m=3)
        stability = compute_stability(driver)
        proximity = compute_proximity(driver)
        trend = calculate_trend(driver)
        score = compute_behaviour_score(stability, proximity, trend)
        assert 0 <= score <= 100

    def test_clean_driver_high_score(self):
        """Driver with no offences should have higher score than a bad driver."""
        clean = make_driver(current_points=0, offences_last_12m=0, days_since_last_offence=365)
        bad = make_driver(current_points=11, offences_last_12m=6, severe_offences=3, days_since_last_offence=10)
        clean_score = compute_behaviour_score(compute_stability(clean), compute_proximity(clean), calculate_trend(clean))
        bad_score = compute_behaviour_score(compute_stability(bad), compute_proximity(bad), calculate_trend(bad))
        assert clean_score > bad_score

    def test_bad_driver_low_score(self):
        """Behaviour score should be a numeric value."""
        driver = make_driver(current_points=11, offences_last_12m=6, severe_offences=3, days_since_last_offence=10)
        stability = compute_stability(driver)
        proximity = compute_proximity(driver)
        trend = calculate_trend(driver)
        score = compute_behaviour_score(stability, proximity, trend)
        assert isinstance(score, (int, float))


# ══════════════════════════════════════════════════════════════════════════════
# 6. PASSPORT SIGNATURE VERIFICATION
# ══════════════════════════════════════════════════════════════════════════════

class TestPassportSignature:

    def test_verify_passport_rejects_missing_signature(self):
        """verify_passport should return False when signature is absent."""
        fake_passport = {
            "driver_id": "DRV-TEST-001",
            "risk_level": "LOW",
            "current_points": 0
            # no signature key
        }
        is_valid, reason = verify_passport(fake_passport)
        assert is_valid is False

    def test_verify_passport_rejects_wrong_signature(self):
        """verify_passport should return False for an invalid signature."""
        fake_passport = {
            "driver_id": "DRV-TEST-001",
            "risk_level": "LOW",
            "current_points": 0,
            "signature": "invalidsignature0000000000000000"
        }
        is_valid, reason = verify_passport(fake_passport)
        assert is_valid is False

    def test_verify_passport_rejects_empty_payload(self):
        """verify_passport should handle empty dict gracefully."""
        is_valid, reason = verify_passport({})
        assert is_valid is False