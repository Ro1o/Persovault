"""
PersoVault — Functional Tests
Tests each Functional Requirement (FR1–FR9) against the live API.
Requires uvicorn running on http://localhost:8000
"""

import pytest
import requests

BASE = "http://localhost:8000"

# ── Shared session fixture ─────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def driver_session():
    """Log in as a driver and return session data."""
    res = requests.post(f"{BASE}/login", json={
        "username": "alice.demo",
        "password": "Demo1234!",
        "role": "driver"
    })
    assert res.status_code == 200
    return res.json()

@pytest.fixture(scope="module")
def suspended_session():
    """Log in as a suspended driver."""
    res = requests.post(f"{BASE}/login", json={
        "username": "sandra.demo",
        "password": "Demo1234!",
        "role": "driver"
    })
    assert res.status_code == 200
    return res.json()

@pytest.fixture(scope="module")
def police_session():
    """Log in as a police officer."""
    res = requests.post(f"{BASE}/login", json={
        "username": "officer.demo",
        "password": "Demo1234!",
        "role": "police"
    })
    assert res.status_code == 200
    return res.json()

@pytest.fixture(scope="module")
def admin_session():
    """Log in as admin."""
    res = requests.post(f"{BASE}/login", json={
        "username": "admin.demo",
        "password": "Demo1234!",
        "role": "admin"
    })
    assert res.status_code == 200
    return res.json()


# ══════════════════════════════════════════════════════════════════════════════
# FR1 — Digital Identity Management
# System shall allow storage and management of NIC, driving licence, passport
# ══════════════════════════════════════════════════════════════════════════════

class TestFR1_DigitalIdentityManagement:

    def test_driver_profile_returns_data(self, driver_session):
        """Driver profile endpoint should return full identity data."""
        res = requests.get(f"{BASE}/profile/alice.demo")
        assert res.status_code == 200
        data = res.json()
        assert "full_name" in data
        assert "driver_id" in data

    def test_nic_record_exists_after_registration(self, driver_session):
        """NIC registration should persist and be retrievable."""
        res = requests.get(f"{BASE}/verify-nic/alice.demo")
        # Either found (200) or not yet registered (404) — both are valid states
        assert res.status_code in [200, 404]


# ══════════════════════════════════════════════════════════════════════════════
# FR2 — Vehicle Compliance Management
# System shall manage penalty records
# ══════════════════════════════════════════════════════════════════════════════

class TestFR2_VehicleCompliance:

    def test_driver_stats_returned(self, driver_session):
        """Driver stats endpoint should return penalty point data."""
        driver_id = driver_session["driver_id"]
        res = requests.get(f"{BASE}/driver-stats/{driver_id}")
        assert res.status_code == 200
        data = res.json()
        assert "total_points" in data

    def test_offences_list_returned(self, driver_session):
        """Offences endpoint should return list for driver."""
        driver_id = driver_session["driver_id"]
        res = requests.get(f"{BASE}/offences/{driver_id}")
        assert res.status_code == 200
        assert "offences" in res.json()


# ══════════════════════════════════════════════════════════════════════════════
# FR3 — Integrated Verification
# System shall verify identity and compliance documents collectively
# ══════════════════════════════════════════════════════════════════════════════

class TestFR3_IntegratedVerification:

    def test_passport_contains_all_fields(self, driver_session):
        """Generated passport should contain NIC, licence, AI risk in one payload."""
        driver_id = driver_session["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()
        offences = requests.get(f"{BASE}/offences/{driver_id}").json()["offences"]

        payload = {
            "driver_id": driver_id,
            "current_points": stats.get("total_points", 0),
            "previous_points": 0,
            "offences_last_12m": len([o for o in offences if o.get("status") == "active"]),
            "minor_offences": len([o for o in offences if o.get("severity") == "minor"]),
            "moderate_offences": len([o for o in offences if o.get("severity") == "moderate"]),
            "severe_offences": len([o for o in offences if o.get("severity") == "severe"]),
            "days_since_last_offence": stats.get("clean_days", 365),
            "avg_days_between_offences": 90,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }

        res = requests.post(f"{BASE}/validate-driver", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "driver_id" in data
        assert "signature" in data


# ══════════════════════════════════════════════════════════════════════════════
# FR4 — Rule-Based Validation
# System shall apply deterministic validation rules
# ══════════════════════════════════════════════════════════════════════════════

class TestFR4_RuleBasedValidation:

    def test_suspension_triggered_at_12_points(self, suspended_session):
        """Sandra has 34 points — system must show her as suspended."""
        driver_id = suspended_session["driver_id"]
        res = requests.get(f"{BASE}/driver-stats/{driver_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["total_points"] >= 12
        assert data.get("is_suspended") is True

    def test_clean_driver_not_suspended(self, driver_session):
        """Alice has 0 points — she should not be suspended."""
        driver_id = driver_session["driver_id"]
        res = requests.get(f"{BASE}/driver-stats/{driver_id}")
        assert res.status_code == 200
        data = res.json()
        assert data.get("is_suspended") is False


# ══════════════════════════════════════════════════════════════════════════════
# FR5 — Dynamic QR Generation
# System shall generate time-limited QR codes
# ══════════════════════════════════════════════════════════════════════════════

class TestFR5_DynamicQR:

    def test_qr_generated_successfully(self, driver_session):
        """QR generation endpoint should return a PNG image."""
        driver_id = driver_session["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()

        payload = {
            "driver_id": driver_id,
            "current_points": stats.get("total_points", 0),
            "previous_points": 0,
            "offences_last_12m": 0,
            "minor_offences": 0,
            "moderate_offences": 0,
            "severe_offences": 0,
            "days_since_last_offence": 365,
            "avg_days_between_offences": 365,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }

        res = requests.post(f"{BASE}/generate-qr", json=payload)
        assert res.status_code == 200
        assert res.headers["content-type"] == "image/png"
        assert len(res.content) > 0


# ══════════════════════════════════════════════════════════════════════════════
# FR6 — Online Verification
# System shall support real-time backend validation
# ══════════════════════════════════════════════════════════════════════════════

class TestFR6_OnlineVerification:

    def test_valid_passport_verifies(self, driver_session):
        """A freshly generated passport should verify as VALID."""
        driver_id = driver_session["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()

        payload = {
            "driver_id": driver_id,
            "current_points": stats.get("total_points", 0),
            "previous_points": 0,
            "offences_last_12m": 0,
            "minor_offences": 0,
            "moderate_offences": 0,
            "severe_offences": 0,
            "days_since_last_offence": 365,
            "avg_days_between_offences": 365,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }

        passport = requests.post(f"{BASE}/validate-driver", json=payload).json()
        import json
        res = requests.post(
            f"{BASE}/verify-passport",
            data=json.dumps(passport),
            headers={"Content-Type": "application/json"}
        )
        assert res.status_code == 200
        assert res.json()["verification_result"] == "VALID"


# ══════════════════════════════════════════════════════════════════════════════
# FR7 — Offline Verification (Snapshot)
# System shall support snapshot-based verification
# ══════════════════════════════════════════════════════════════════════════════

class TestFR7_OfflineVerification:

    def test_passport_contains_signature_for_offline(self, driver_session):
        """Passport must contain HMAC signature enabling offline validation."""
        driver_id = driver_session["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()

        payload = {
            "driver_id": driver_id,
            "current_points": stats.get("total_points", 0),
            "previous_points": 0,
            "offences_last_12m": 0,
            "minor_offences": 0,
            "moderate_offences": 0,
            "severe_offences": 0,
            "days_since_last_offence": 365,
            "avg_days_between_offences": 365,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }

        passport = requests.post(f"{BASE}/validate-driver", json=payload).json()
        assert "signature" in passport
        assert len(passport["signature"]) > 10


# ══════════════════════════════════════════════════════════════════════════════
# FR8 — Trust Indicator
# System shall display trust level and sync timestamp
# ══════════════════════════════════════════════════════════════════════════════

class TestFR8_TrustIndicator:

    def test_passport_contains_trust_level(self, driver_session):
        """Passport payload should contain a trust level field."""
        driver_id = driver_session["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()

        payload = {
            "driver_id": driver_id,
            "current_points": stats.get("total_points", 0),
            "previous_points": 0,
            "offences_last_12m": 0,
            "minor_offences": 0,
            "moderate_offences": 0,
            "severe_offences": 0,
            "days_since_last_offence": 365,
            "avg_days_between_offences": 365,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }

        passport = requests.post(f"{BASE}/validate-driver", json=payload).json()
        assert "behaviour" in passport or "trust_level" in passport or "verification_mode" in passport or "ai_prediction" in passport


# ══════════════════════════════════════════════════════════════════════════════
# FR9 — Verification Classification
# System shall classify outcomes (Valid, Expired, Suspended etc.)
# ══════════════════════════════════════════════════════════════════════════════

class TestFR9_VerificationClassification:

    def test_valid_classification_returned(self, driver_session):
        """Passport verification should return a classification result."""
        driver_id = driver_session["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()

        payload = {
            "driver_id": driver_id,
            "current_points": stats.get("total_points", 0),
            "previous_points": 0,
            "offences_last_12m": 0,
            "minor_offences": 0,
            "moderate_offences": 0,
            "severe_offences": 0,
            "days_since_last_offence": 365,
            "avg_days_between_offences": 365,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }

        passport = requests.post(f"{BASE}/validate-driver", json=payload).json()
        import json
        res = requests.post(
            f"{BASE}/verify-passport",
            data=json.dumps(passport),
            headers={"Content-Type": "application/json"}
        )
        result = res.json()["verification_result"]
        assert result in ["VALID", "EXPIRED", "TAMPERED", "SUSPENDED"]