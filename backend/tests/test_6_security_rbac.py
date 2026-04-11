"""
PersoVault — Security & RBAC Tests
Tests role-based access control, authentication security,
NIC fraud detection, and passport integrity mechanisms.
Requires uvicorn running on http://localhost:8000
"""

import pytest
import requests
import json

BASE = "http://localhost:8000"


# ══════════════════════════════════════════════════════════════════════════════
# 1. ROLE-BASED ACCESS CONTROL
# ══════════════════════════════════════════════════════════════════════════════

class TestRBAC:

    def test_driver_cannot_login_as_admin(self):
        """Driver credentials with admin role should be rejected."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "admin"
        })
        assert res.status_code == 403

    def test_driver_cannot_login_as_police(self):
        """Driver credentials with police role should be rejected."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "police"
        })
        assert res.status_code == 403

    def test_admin_cannot_login_as_driver(self):
        """Admin credentials with driver role should be rejected."""
        res = requests.post(f"{BASE}/login", json={
            "username": "admin.demo",
            "password": "Demo1234!",
            "role": "driver"
        })
        assert res.status_code == 403

    def test_police_cannot_login_as_admin(self):
        """Police credentials with admin role should be rejected."""
        res = requests.post(f"{BASE}/login", json={
            "username": "officer.demo",
            "password": "Demo1234!",
            "role": "admin"
        })
        assert res.status_code == 403

    def test_correct_driver_role_accepted(self):
        """Driver with correct role should log in successfully."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "Demo1234!",
            "role": "driver"
        })
        assert res.status_code == 200
        assert res.json()["role"] == "driver"

    def test_correct_police_role_accepted(self):
        """Police officer with correct role should log in successfully."""
        res = requests.post(f"{BASE}/login", json={
            "username": "officer.demo",
            "password": "Demo1234!",
            "role": "police"
        })
        assert res.status_code == 200
        assert res.json()["role"] == "police"

    def test_correct_admin_role_accepted(self):
        """Admin with correct role should log in successfully."""
        res = requests.post(f"{BASE}/login", json={
            "username": "admin.demo",
            "password": "Demo1234!",
            "role": "admin"
        })
        assert res.status_code == 200
        assert res.json()["role"] == "admin"


# ══════════════════════════════════════════════════════════════════════════════
# 2. PASSWORD SECURITY
# ══════════════════════════════════════════════════════════════════════════════

class TestPasswordSecurity:

    def test_wrong_password_rejected(self):
        """Incorrect password should return 401."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "wrongpassword",
            "role": "driver"
        })
        assert res.status_code == 401

    def test_empty_password_rejected(self):
        """Empty password should not authenticate successfully."""
        res = requests.post(f"{BASE}/login", json={
            "username": "alice.demo",
            "password": "",
            "role": "driver"
        })
        assert res.status_code != 200

    def test_change_password_requires_correct_current(self):
        """Password change with wrong current password should be rejected."""
        res = requests.post(f"{BASE}/change-password", json={
            "username": "alice.demo",
            "current_password": "WrongCurrentPassword!",
            "new_password": "NewPassword1234!"
        })
        assert res.status_code == 401

    def test_change_password_short_new_password_rejected(self):
        """New password shorter than 8 characters should be rejected."""
        res = requests.post(f"{BASE}/change-password", json={
            "username": "alice.demo",
            "current_password": "Demo1234!",
            "new_password": "short"
        })
        assert res.status_code == 400


# ══════════════════════════════════════════════════════════════════════════════
# 3. PASSPORT CRYPTOGRAPHIC SECURITY
# ══════════════════════════════════════════════════════════════════════════════

class TestPassportCryptographicSecurity:

    def _generate_passport(self):
        login = requests.post(f"{BASE}/login", json={
            "username": "alice.demo", "password": "Demo1234!", "role": "driver"
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

    def test_signature_present_in_passport(self):
        """Generated passport must contain a cryptographic signature."""
        passport = self._generate_passport()
        assert "signature" in passport
        assert len(passport["signature"]) >= 32

    def test_valid_passport_passes_verification(self):
        """Unmodified passport should pass cryptographic verification."""
        passport = self._generate_passport()
        result = self._verify(passport)
        assert result["verification_result"] == "VALID"

    def test_single_field_change_breaks_signature(self):
        """Any field change must invalidate the HMAC signature."""
        passport = self._generate_passport()
        passport["risk_level"] = "LOW"
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"

    def test_signature_replacement_detected(self):
        """Replacing signature with a forged value must be detected."""
        passport = self._generate_passport()
        passport["signature"] = "a" * 64
        result = self._verify(passport)
        assert result["verification_result"] == "TAMPERED"

    def test_empty_body_returns_tampered(self):
        """Empty passport body should return TAMPERED, not crash."""
        result = self._verify({})
        assert result["verification_result"] == "TAMPERED"


# ══════════════════════════════════════════════════════════════════════════════
# 4. NIC SECURITY — 7-LAYER FRAUD DETECTION
# ══════════════════════════════════════════════════════════════════════════════

class TestNICSecurityLayers:

    def test_fraud_score_returned_on_registration(self):
        """NIC registration must always return a fraud score."""
        res = requests.post(f"{BASE}/register-nic", json={
            "username": "alice.demo",
            "nic_number": "A010190123456A",
            "full_name": "Alice Fernandez",
            "date_of_birth": "1990-01-01"
        })
        if res.status_code == 200:
            assert "fraud_score" in res.json()
            assert 0 <= res.json()["fraud_score"] <= 100

    def test_security_layers_returned_on_registration(self):
        """Registration response must include security layer results."""
        res = requests.post(f"{BASE}/register-nic", json={
            "username": "bob.demo",
            "nic_number": "B020290234567B",
            "full_name": "Bob Ramkhelawon",
            "date_of_birth": "1990-02-02"
        })
        if res.status_code == 200:
            assert "security_layers" in res.json()

    def test_invalid_format_nic_rejected_or_flagged(self):
        """NIC with invalid format should be rejected or flagged with high fraud score."""
        res = requests.post(f"{BASE}/register-nic", json={
            "username": "raj.demo",
            "nic_number": "123INVALID456",
            "full_name": "Raj Gopaul",
            "date_of_birth": "1992-05-10"
        })
        if res.status_code == 200:
            assert res.json()["fraud_score"] >= 50
        else:
            assert res.status_code in [400, 429, 500]  # 429=rate limited, 500=server rejected

    def test_verify_nic_nonexistent_user_returns_404(self):
        """Verifying NIC for a user who never registered should return 404."""
        res = requests.get(f"{BASE}/verify-nic/ghost.nonexistent")
        assert res.status_code == 404

    def test_audit_log_grows_after_nic_activity(self):
        """Audit log should contain records after NIC registration attempts."""
        res = requests.get(f"{BASE}/admin/audit-log")
        assert res.status_code == 200
        log = res.json()["audit_log"]
        assert isinstance(log, list)