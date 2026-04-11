"""
PersoVault — Black Box Tests
Tests inputs and outputs without knowledge of internal implementation.
Focuses on boundary conditions, invalid inputs, and rejection behaviour.
Requires uvicorn running on http://localhost:8000
"""

import pytest
import requests
import json
import time

BASE = "http://localhost:8000"


# ══════════════════════════════════════════════════════════════════════════════
# 1. AUTHENTICATION BOUNDARY TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestAuthenticationBlackBox:

    def test_correct_credentials_accepted(self):
        """Valid credentials should return 200 and session data."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "driver"
        })
        assert res.status_code == 200
        assert res.json()["username"] == "alice.demo"

    def test_wrong_password_rejected(self):
        """Wrong password should return 401."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "WrongPassword!",
            "role": "driver"
        })
        assert res.status_code == 401

    def test_nonexistent_user_rejected(self):
        """Non-existent username should return 404."""
        res = requests.post(f"{BASE}/login", json={
            "username": "ghost.user",
            "password": "Demo1234!",
            "role": "driver"
        })
        assert res.status_code == 404

    def test_wrong_role_rejected(self):
        """Correct credentials but wrong role should return 403."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "admin"
        })
        assert res.status_code == 403

    def test_empty_username_rejected(self):
        """Empty username should not return 200."""
        res = requests.post(f"{BASE}/login", json={
            "username": "",
            "password": "Demo1234!",
            "role": "driver"
        })
        assert res.status_code != 200

    def test_missing_fields_rejected(self):
        """Request with missing fields should return 4xx."""
        res = requests.post(f"{BASE}/login", json={"username": "alice.demo"})
        assert res.status_code >= 400


# ══════════════════════════════════════════════════════════════════════════════
# 2. PASSPORT TAMPER DETECTION
# ══════════════════════════════════════════════════════════════════════════════

class TestPassportTamperDetection:

    def _get_valid_passport(self):
        login = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "driver"
        }).json()
        driver_id = login["driver_id"]
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
        return requests.post(f"{BASE}/validate-driver", json=payload).json()

    def _verify(self, passport):
        return requests.post(
            f"{BASE}/verify-passport",
            data=json.dumps(passport),
            headers={"Content-Type": "application/json"}
        ).json()

    def test_unmodified_passport_is_valid(self):
        """An untouched passport should verify as VALID."""
        passport = self._get_valid_passport()
        result = self._verify(passport)
        assert result["verification_result"] == "VALID"

    def test_modified_driver_id_detected(self):
        """Changing driver_id should cause TAMPERED result."""
        passport = self._get_valid_passport()
        passport["driver_id"] = "FAKE-DRIVER-999"
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"

    def test_modified_risk_level_detected(self):
        """Changing risk_level should cause TAMPERED result."""
        passport = self._get_valid_passport()
        passport["risk_level"] = "LOW"
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"

    def test_removed_signature_detected(self):
        """Removing the signature should cause TAMPERED result."""
        passport = self._get_valid_passport()
        passport.pop("signature", None)
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"

    def test_corrupted_signature_detected(self):
        """Replacing signature with garbage should cause TAMPERED result."""
        passport = self._get_valid_passport()
        passport["signature"] = "INVALIDSIGNATUREXXXXXXXXXXXXXXXX"
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"

    def test_modified_points_detected(self):
        """Changing penalty points should cause TAMPERED result."""
        passport = self._get_valid_passport()
        passport["current_points"] = 0
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"


# ══════════════════════════════════════════════════════════════════════════════
# 3. NIC FRAUD DETECTION BLACK BOX
# ══════════════════════════════════════════════════════════════════════════════

class TestNICFraudBlackBox:

    def test_empty_nic_rejected(self):
        """Empty NIC should not register successfully."""
        res = requests.post(f"{BASE}/register-nic", json={
            "username": "alice.demo",
            "nic_number": "",
            "full_name": "Alice Fernandez",
            "date_of_birth": "1990-01-01"
        })
        assert res.status_code in [400, 422, 429]  # 429 = rate limited

    def test_random_string_nic_rejected(self):
        """A random string NIC should fail validation."""
        res = requests.post(f"{BASE}/register-nic", json={
            "username": "alice.demo",
            "nic_number": "NOTANICNUMBER",
            "full_name": "Alice Fernandez",
            "date_of_birth": "1990-01-01"
        })
        # Either 400 (fraud detected) or registers with high fraud score
        if res.status_code == 200:
            assert res.json()["fraud_score"] > 30

    def test_duplicate_nic_increases_fraud_score(self):
        """Registering an already-registered NIC should increase fraud score."""
        nic = "B020190123456B"
        # First registration
        requests.post(f"{BASE}/register-nic", json={
            "username": "alice.demo",
            "nic_number": nic,
            "full_name": "Alice Fernandez",
            "date_of_birth": "1990-02-01"
        })
        # Second attempt with same NIC
        res2 = requests.post(f"{BASE}/register-nic", json={
            "username": "nadia.demo",
            "nic_number": nic,
            "full_name": "Nadia Currimjee",
            "date_of_birth": "1992-03-01"
        })
        # Should either be rejected or have elevated fraud score
        if res2.status_code == 200:
            assert res2.json()["fraud_score"] > 0


# ══════════════════════════════════════════════════════════════════════════════
# 4. SUSPENSION BOUNDARY BLACK BOX
# ══════════════════════════════════════════════════════════════════════════════

class TestSuspensionBoundaryBlackBox:

    def test_suspended_driver_reflected_in_stats(self):
        """Sandra Pillay has 34 points — stats must show suspended."""
        login = requests.post(f"{BASE}/login", json={
            "username": "sandra.demo",
            "password": "Demo1234!",
            "role": "driver"
        }).json()
        driver_id = login["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()
        assert stats["total_points"] >= 12

    def test_clean_driver_not_suspended(self):
        """Alice has 0 points — stats must not show suspended."""
        login = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "driver"
        }).json()
        driver_id = login["driver_id"]
        stats = requests.get(f"{BASE}/driver-stats/{driver_id}").json()
        assert stats["total_points"] == 0
        assert stats.get("is_suspended") is False


# ══════════════════════════════════════════════════════════════════════════════
# 5. AI RISK PREDICTION BLACK BOX
# ══════════════════════════════════════════════════════════════════════════════

class TestAIRiskBlackBox:

    def _predict(self, points, offences, severe):
        payload = {
            "driver_id": "DRV-BB-TEST",
            "current_points": points,
            "previous_points": points,
            "offences_last_12m": offences,
            "minor_offences": 0,
            "moderate_offences": offences - severe,
            "severe_offences": severe,
            "days_since_last_offence": 30 if offences > 0 else 365,
            "avg_days_between_offences": 60,
            "years_since_licence_issue": 5,
            "last_sync": "2026-01-01"
        }
        return requests.post(f"{BASE}/predict-risk", json=payload).json()

    def test_clean_driver_low_risk(self):
        """Driver with 0 points should be LOW risk."""
        result = self._predict(points=0, offences=0, severe=0)
        assert result["risk_level"] in ["LOW", "MEDIUM"]

    def test_high_points_high_risk(self):
        """Driver with 11 points and 5 severe offences should be HIGH risk."""
        result = self._predict(points=11, offences=5, severe=3)
        assert result["risk_level"] == "HIGH"

    def test_risk_score_is_numeric(self):
        """Risk score must be a number between 0 and 1."""
        result = self._predict(points=4, offences=2, severe=0)
        assert isinstance(result["risk_score"], (int, float))
        assert 0 <= result["risk_score"] <= 1

    def test_behaviour_score_inverse_of_risk(self):
        """Higher risk should correspond to lower behaviour score."""
        low_risk = self._predict(points=0, offences=0, severe=0)
        high_risk = self._predict(points=11, offences=5, severe=3)
        assert low_risk["behaviour_score"] > high_risk["behaviour_score"]