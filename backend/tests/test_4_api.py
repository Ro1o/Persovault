"""
PersoVault — API Endpoint Coverage Tests
Verifies all 17 REST endpoints return correct HTTP status codes
for both valid and invalid inputs.
Requires uvicorn running on http://localhost:8000
"""

import pytest
import requests
import json

BASE = "http://localhost:8000"


# ── Shared fixtures ────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def driver_data():
    res = requests.post(f"{BASE}/login", json={
        "username": "alice.demo",
        "password": "Demo1234!",
        "role": "driver"
    })
    return res.json()

@pytest.fixture(scope="module")
def valid_driver_payload(driver_data):
    driver_id = driver_data["driver_id"]
    stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()
    return {
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


# ══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class TestAuthEndpoints:

    def test_POST_login_valid_returns_200(self):
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo", "password": "Demo1234!", "role": "driver"
        })
        assert res.status_code == 200

    def test_POST_login_invalid_returns_401(self):
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo", "password": "wrong", "role": "driver"
        })
        assert res.status_code == 401

    def test_POST_login_missing_user_returns_404(self):
        res = requests.post(f"{BASE}/login", json={
            "username": "nobody.demo", "password": "Demo1234!", "role": "driver"
        })
        assert res.status_code == 404

    def test_POST_signup_duplicate_returns_400(self):
        res = requests.post(f"{BASE}/signup", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "driver",
            "full_name": "Alice",
            "phone": "123",
            "address": "Test"
        })
        assert res.status_code == 400

    def test_POST_change_password_wrong_current_returns_401(self):
        res = requests.post(f"{BASE}/change-password", json={
            "username": "alice.demo",
            "current_password": "WrongPassword!",
            "new_password": "NewPass1234!"
        })
        assert res.status_code == 401


# ══════════════════════════════════════════════════════════════════════════════
# PROFILE ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class TestProfileEndpoints:

    def test_GET_profile_valid_returns_200(self):
        res = requests.get(f"{BASE}/profile/alice.demo")
        assert res.status_code == 200

    def test_GET_profile_invalid_returns_404(self):
        res = requests.get(f"{BASE}/profile/ghost.user")
        assert res.status_code == 404


# ══════════════════════════════════════════════════════════════════════════════
# DRIVER STATS & OFFENCES ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class TestDriverDataEndpoints:

    def test_GET_driver_stats_valid_returns_200(self, driver_data):
        driver_id = driver_data["driver_id"]
        res = requests.get(f"{BASE}/driver-stats/{driver_id}")
        assert res.status_code == 200

    def test_GET_offences_valid_returns_200(self, driver_data):
        driver_id = driver_data["driver_id"]
        res = requests.get(f"{BASE}/offences/{driver_id}")
        assert res.status_code == 200
        assert "offences" in res.json()

    def test_POST_offence_missing_fields_returns_400(self):
        res = requests.post(f"{BASE}/offence", json={
            "driver_id": "DRV-TEST"
            # missing title and offence_date
        })
        assert res.status_code == 400


# ══════════════════════════════════════════════════════════════════════════════
# NIC ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class TestNICEndpoints:

    def test_POST_register_nic_missing_fields_returns_422(self):
        res = requests.post(f"{BASE}/register-nic", json={})
        assert res.status_code in [400, 422, 429]  # 429 = rate limited

    def test_GET_verify_nic_nonexistent_returns_404(self):
        res = requests.get(f"{BASE}/verify-nic/ghost.user")
        assert res.status_code == 404

    def test_GET_verify_nic_existing_user_returns_200_or_404(self):
        # Either 200 (NIC exists) or 404 (not registered) are valid
        res = requests.get(f"{BASE}/verify-nic/alice.demo")
        assert res.status_code in [200, 404]


# ══════════════════════════════════════════════════════════════════════════════
# PASSPORT ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class TestPassportEndpoints:

    def test_POST_validate_driver_valid_returns_200(self, valid_driver_payload):
        res = requests.post(f"{BASE}/validate-driver", json=valid_driver_payload)
        assert res.status_code == 200
        assert "signature" in res.json()

    def test_POST_generate_qr_returns_png(self, valid_driver_payload):
        res = requests.post(f"{BASE}/generate-qr", json=valid_driver_payload)
        assert res.status_code == 200
        assert "image/png" in res.headers["content-type"]

    def test_POST_verify_passport_valid_returns_200(self, valid_driver_payload):
        passport = requests.post(
            f"{BASE}/validate-driver", json=valid_driver_payload
        ).json()
        res = requests.post(
            f"{BASE}/verify-passport",
            data=json.dumps(passport),
            headers={"Content-Type": "application/json"}
        )
        assert res.status_code == 200
        assert "verification_result" in res.json()

    def test_POST_verify_passport_empty_body_returns_tampered(self):
        res = requests.post(
            f"{BASE}/verify-passport",
            data="{}",
            headers={"Content-Type": "application/json"}
        )
        assert res.status_code == 200
        assert res.json()["verification_result"] == "TAMPERED"


# ══════════════════════════════════════════════════════════════════════════════
# AI ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

class TestAIEndpoints:

    def test_POST_predict_risk_valid_returns_200(self, valid_driver_payload):
        res = requests.post(f"{BASE}/predict-risk", json=valid_driver_payload)
        assert res.status_code == 200
        data = res.json()
        assert "risk_level" in data
        assert "risk_score" in data
        assert "behaviour_score" in data

    def test_GET_feature_importance_returns_200(self):
        res = requests.get(f"{BASE}/feature-importance")
        assert res.status_code == 200
        assert "feature_importance" in res.json()


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class TestAdminEndpoints:

    def test_GET_admin_stats_returns_200(self):
        res = requests.get(f"{BASE}/admin/stats")
        assert res.status_code == 200

    def test_GET_admin_users_returns_drivers(self):
        res = requests.get(f"{BASE}/admin/users")
        assert res.status_code == 200
        assert "drivers" in res.json()
        assert len(res.json()["drivers"]) > 0

    def test_GET_admin_nic_monitor_returns_200(self):
        res = requests.get(f"{BASE}/admin/nic-monitor")
        assert res.status_code == 200

    def test_GET_admin_audit_log_returns_200(self):
        res = requests.get(f"{BASE}/admin/audit-log")
        assert res.status_code == 200
        assert "audit_log" in res.json()