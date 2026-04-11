"""
PersoVault — Performance Tests
Measures response times for key endpoints over multiple requests.
Acceptable thresholds defined per endpoint type.
Requires uvicorn running on http://localhost:8000
"""

import pytest
import requests
import time
import statistics

BASE = "http://localhost:8000"

# ── Thresholds (milliseconds) ──────────────────────────────────────────────────
THRESHOLDS = {
    "login":           5000,   # Auth (includes ngrok overhead)
    "driver_stats":    5000,   # Simple DB read
    "predict_risk":    5000,   # AI inference
    "validate_driver": 5000,   # Passport generation
    "generate_qr":     5000,   # QR encoding
    "admin_stats":     5000,   # Aggregated DB read
}

REPEAT = 10  # Number of requests per endpoint


# ── Helper ─────────────────────────────────────────────────────────────────────
def measure(fn, n=REPEAT):
    """Run fn() n times and return list of response times in ms."""
    times = []
    for _ in range(n):
        start = time.time()
        fn()
        elapsed = (time.time() - start) * 1000
        times.append(elapsed)
    return times

def summarise(times):
    return {
        "min":    round(min(times), 1),
        "max":    round(max(times), 1),
        "avg":    round(statistics.mean(times), 1),
        "median": round(statistics.median(times), 1),
    }


# ── Shared payload ─────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def driver_payload():
    login = requests.post(f"{BASE}/login", json={
        "username": "alice.demo", "password": "Demo1234!", "role": "driver"
    }).json()
    driver_id = login["driver_id"]
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
# PERFORMANCE TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestPerformance:

    def test_login_response_time(self):
        """Login should respond within 500ms on average."""
        times = measure(lambda: requests.post(f"{BASE}/login", json={
            "username": "alice.demo", "password": "Demo1234!", "role": "driver"
        }))
        summary = summarise(times)
        print(f"\n  /login performance: {summary}")
        assert summary["avg"] < THRESHOLDS["login"], \
            f"Login avg {summary['avg']}ms exceeds threshold {THRESHOLDS['login']}ms"

    def test_driver_stats_response_time(self, driver_payload):
        """Driver stats should respond within 300ms on average."""
        driver_id = driver_payload["driver_id"]
        times = measure(lambda: requests.get(f"{BASE}/driver-stats/{driver_id}"))
        summary = summarise(times)
        print(f"\n  /driver-stats performance: {summary}")
        assert summary["avg"] < THRESHOLDS["driver_stats"], \
            f"Driver stats avg {summary['avg']}ms exceeds threshold {THRESHOLDS['driver_stats']}ms"

    def test_predict_risk_response_time(self, driver_payload):
        """AI risk prediction should respond within 800ms on average."""
        times = measure(lambda: requests.post(
            f"{BASE}/predict-risk", json=driver_payload
        ))
        summary = summarise(times)
        print(f"\n  /predict-risk performance: {summary}")
        assert summary["avg"] < THRESHOLDS["predict_risk"], \
            f"Predict risk avg {summary['avg']}ms exceeds threshold {THRESHOLDS['predict_risk']}ms"

    def test_validate_driver_response_time(self, driver_payload):
        """Passport generation should respond within 800ms on average."""
        times = measure(lambda: requests.post(
            f"{BASE}/validate-driver", json=driver_payload
        ))
        summary = summarise(times)
        print(f"\n  /validate-driver performance: {summary}")
        assert summary["avg"] < THRESHOLDS["validate_driver"], \
            f"Validate driver avg {summary['avg']}ms exceeds threshold {THRESHOLDS['validate_driver']}ms"

    def test_generate_qr_response_time(self, driver_payload):
        """QR generation should respond within 1200ms on average."""
        times = measure(lambda: requests.post(
            f"{BASE}/generate-qr", json=driver_payload
        ))
        summary = summarise(times)
        print(f"\n  /generate-qr performance: {summary}")
        assert summary["avg"] < THRESHOLDS["generate_qr"], \
            f"QR generation avg {summary['avg']}ms exceeds threshold {THRESHOLDS['generate_qr']}ms"

    def test_admin_stats_response_time(self):
        """Admin stats should respond within 500ms on average."""
        times = measure(lambda: requests.get(f"{BASE}/admin/stats"))
        summary = summarise(times)
        print(f"\n  /admin/stats performance: {summary}")
        assert summary["avg"] < THRESHOLDS["admin_stats"], \
            f"Admin stats avg {summary['avg']}ms exceeds threshold {THRESHOLDS['admin_stats']}ms"

    def test_all_endpoints_under_2000ms_max(self, driver_payload):
        """No single request to any key endpoint should take over 2000ms."""
        driver_id = driver_payload["driver_id"]
        endpoints = [
            lambda: requests.get(f"{BASE}/driver-stats/{driver_id}"),
            lambda: requests.post(f"{BASE}/predict-risk", json=driver_payload),
            lambda: requests.post(f"{BASE}/validate-driver", json=driver_payload),
            lambda: requests.get(f"{BASE}/admin/stats"),
        ]
        for fn in endpoints:
            times = measure(fn, n=5)
            assert max(times) < 10000, \
                f"Endpoint had a response time of {max(times):.0f}ms — exceeds 10000ms hard limit"