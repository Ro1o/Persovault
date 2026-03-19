from models.driver import Driver
from services.passport_generator import generate_passport
from utils.signature import verify_passport
from utils.qr_generator import generate_passport_qr
from backend.database import init_db, save_passport, get_passports_by_driver

from datetime import datetime, timezone
import copy
import time


# ----------------------------------------
# CONFIG (For Faster Replay Test)
# ----------------------------------------
REPLAY_WAIT_SECONDS = 12  # Set passport validity to 10 seconds for quick test


# ----------------------------------------
# Create Driver
# ----------------------------------------
driver = Driver(
    driver_id="DRV123",
    current_points=12,
    previous_points=10,
    offences_last_12m=4,
    minor_offences=1,
    moderate_offences=1,
    severe_offences=2,
    days_since_last_offence=15,
    avg_days_between_offences=45,
    years_since_licence_issue=8,
    last_sync=datetime.now(timezone.utc)
)


# ----------------------------------------
# Generate Passport
# ----------------------------------------
passport = generate_passport(driver, verification_mode="ONLINE")

print("\n--- ORIGINAL PASSPORT VERIFICATION ---")
valid, message = verify_passport(passport)
print("Valid:", valid, "| Message:", message)


# ----------------------------------------
# TAMPER TEST
# ----------------------------------------
tampered_passport = copy.deepcopy(passport)
tampered_passport["ai_prediction"]["risk_level"] = "LOW"

print("\n--- TAMPERED PASSPORT VERIFICATION ---")
valid, message = verify_passport(tampered_passport)
print("Valid:", valid, "| Message:", message)


# ----------------------------------------
# FORCED EXPIRY TEST (Signature breaks first)
# ----------------------------------------
expired_passport = copy.deepcopy(passport)
expired_passport["metadata"]["expires_at"] = "2000-01-01T00:00:00+00:00"

print("\n--- FORCED EXPIRY (MODIFIED) ---")
valid, message = verify_passport(expired_passport)
print("Valid:", valid, "| Message:", message)


# ----------------------------------------
# TRUE REPLAY ATTACK TEST
# ----------------------------------------
print("\n--- REPLAY ATTACK TEST ---")

# IMPORTANT:
# For fast testing, temporarily reduce validity_seconds to 10
# inside passport_generator.py before running this test.

replay_passport = generate_passport(driver, verification_mode="ONLINE")

print(f"Waiting {REPLAY_WAIT_SECONDS} seconds for expiry...")
time.sleep(REPLAY_WAIT_SECONDS)

valid, message = verify_passport(replay_passport)
print("Valid:", valid, "| Message:", message)


# ----------------------------------------
# QR CODE GENERATION
# ----------------------------------------
print("\n--- GENERATING QR CODE ---")
qr_file = generate_passport_qr(passport)
print("QR saved as:", qr_file)


# ----------------------------------------
# SQLITE PERSISTENCE TEST
# ----------------------------------------
print("\n--- DATABASE TEST ---")

init_db()
save_passport(passport)

stored = get_passports_by_driver("DRV123")
print("Stored passports count:", len(stored))

print("\n--- SECURITY TEST COMPLETE ---")