"""
nic_security.py — Multi-Layer NIC Fraud Detection System
=========================================================
Implements 7 security layers for NIC validation in PersoVault:

Layer 1 — Format Validation      : Mauritius NIC regex check
Layer 2 — DOB Consistency Check  : First 6 digits must match date of birth
Layer 3 — Letter Match Check     : First and last letter must be identical
Layer 4 — Honeypot Blocklist     : Pre-flagged trap NICs
Layer 5 — CA Digital Signature   : Cryptographic tamper detection (HMAC-SHA256)
Layer 6 — Impossible Travel      : Detects cloned NICs used simultaneously
Layer 7 — Fraud Probability Score: Weighted risk score across all layers

Mauritius NIC Format:
    [LETTER] [DD] [MM] [YY] [6 digits] [LETTER]
    Example: G010903016656G
    - First letter and last letter are IDENTICAL
    - Digits 1-2: Day of birth (DD)
    - Digits 3-4: Month of birth (MM)
    - Digits 5-6: Year of birth (YY)
    - Digits 7-12: Unique identifier
    Total length: 14 characters
"""

import re
import hmac
import hashlib
import time
from datetime import datetime, timezone
from collections import defaultdict

# ─────────────────────────────────────────────────────────────
# GOVERNMENT CA SECRET KEY
# In production this would be stored in a Hardware Security
# Module (HSM). The private key never leaves the server.
# ─────────────────────────────────────────────────────────────
CA_SECRET_KEY = "persovault_mauritius_government_ca_2026_secret"

# ─────────────────────────────────────────────────────────────
# LAYER 4 — HONEYPOT BLOCKLIST
# Pre-registered trap NICs that no real citizen would have.
# ─────────────────────────────────────────────────────────────
HONEYPOT_NICS = {
    "A000000000000A",
    "Z999999999999Z",
    "B123456123456B",
    "T000000000000T",
    "X999999999999X",
}

# ─────────────────────────────────────────────────────────────
# LAYER 6 — IMPOSSIBLE TRAVEL
# Distances between Mauritius police stations (km)
# ─────────────────────────────────────────────────────────────
STATION_DISTANCES_KM = {
    ("Port Louis", "Mahebourg"):         47,
    ("Port Louis", "Curepipe"):          20,
    ("Port Louis", "Rose Hill"):         12,
    ("Port Louis", "Quatre Bornes"):     18,
    ("Port Louis", "Flacq"):             35,
    ("Port Louis", "Riviere du Rempart"): 32,
    ("Curepipe", "Mahebourg"):           30,
    ("Curepipe", "Flacq"):               28,
    ("Rose Hill", "Mahebourg"):          40,
    ("Quatre Bornes", "Mahebourg"):      35,
}
AVERAGE_SPEED_KMH = 60

# Rate limiting tracker
_failed_attempts: dict = defaultdict(list)
RATE_LIMIT_WINDOW = 900   # 15 minutes
RATE_LIMIT_MAX    = 3

# Impossible travel log
_verification_log: dict = {}


# ═══════════════════════════════════════════════════════════════
# LAYER 1 — FORMAT VALIDATION
# Mauritius NIC: Letter + 6 digits (DDMMYY) + 6 digits + Letter
# First and last letter must be identical
# Total length: 14 characters
# ═══════════════════════════════════════════════════════════════
def validate_nic_format(nic: str) -> tuple[bool, str]:
    """
    Validates the full Mauritius NIC format.

    Pattern: [A-Z][0-9]{12}[A-Z]
    Additional rule: first letter == last letter

    Example: G010903016656G
    - G = prefix letter
    - 010903 = DOB (01/09/03 = 1st September 2003)
    - 016656 = unique identifier
    - G = suffix letter (must match prefix)

    WHY: A randomly generated string will almost certainly
    fail this format check. This is the first gate.
    """
    pattern = r'^[A-Z]\d{12}[A-Z]$'
    if not re.match(pattern, nic):
        return False, f"Invalid format. Expected: Letter + 12 digits + Letter (e.g. G010903016656G). Got: {nic}"

    # First and last letter must match
    if nic[0] != nic[-1]:
        return False, f"First letter '{nic[0]}' and last letter '{nic[-1]}' must be identical"

    return True, "Format valid"


# ═══════════════════════════════════════════════════════════════
# LAYER 2 — DATE OF BIRTH CONSISTENCY CHECK
# The first 6 digits encode the date of birth (DDMMYY).
# We verify these match the declared date of birth.
# ═══════════════════════════════════════════════════════════════
def validate_dob_consistency(nic: str, date_of_birth: str) -> tuple[bool, str]:
    """
    Verifies that the DOB encoded in the NIC matches the
    declared date of birth.

    NIC digits 1-6: DDMMYY
    date_of_birth: YYYY-MM-DD (HTML date input format)

    Example:
        NIC: G010903016656G → encoded DOB = 01/09/03
        Declared DOB: 2003-09-01 → matches ✓

    WHY: A person trying to use someone else's NIC would
    need to know the exact date of birth embedded in it.
    This ties the NIC to a specific person's identity.
    This is one of the most powerful anti-fraud checks
    because it cross-references two independent data points.
    """
    try:
        nic_dob_str = nic[1:7]  # Extract DDMMYY from NIC
        nic_day   = int(nic_dob_str[0:2])
        nic_month = int(nic_dob_str[2:4])
        nic_year  = int(nic_dob_str[4:6])

        # Parse declared DOB (YYYY-MM-DD)
        dob_parts = date_of_birth.split("-")
        declared_year  = int(dob_parts[0]) % 100  # Last 2 digits of year
        declared_month = int(dob_parts[1])
        declared_day   = int(dob_parts[2])

        if nic_day == declared_day and nic_month == declared_month and nic_year == declared_year:
            return True, f"DOB encoded in NIC ({nic_day:02d}/{nic_month:02d}/{nic_year:02d}) matches declared date of birth"

        return False, (
            f"DOB mismatch: NIC encodes {nic_day:02d}/{nic_month:02d}/{nic_year:02d} "
            f"but declared DOB is {declared_day:02d}/{declared_month:02d}/{declared_year:02d}"
        )

    except Exception as e:
        return False, f"Could not validate DOB consistency: {str(e)}"


# ═══════════════════════════════════════════════════════════════
# LAYER 3 — LETTER MATCH CHECK
# The first and last letter of the NIC must be identical.
# This is a built-in self-validation rule of Mauritius NICs.
# ═══════════════════════════════════════════════════════════════
def validate_letter_match(nic: str) -> tuple[bool, str]:
    """
    Verifies the first and last letter of the NIC match.

    WHY: This is a known structural rule of Mauritius NICs.
    A forger who doesn't know this rule will fail immediately.
    Even if they know the format, matching letters
    reduces the valid NIC space by 96% (only 1/26 chance).
    """
    if nic[0] == nic[-1]:
        return True, f"Letter match valid: '{nic[0]}' matches '{nic[-1]}'"
    return False, f"Letter mismatch: first letter '{nic[0]}' ≠ last letter '{nic[-1]}'"


# ═══════════════════════════════════════════════════════════════
# LAYER 4 — HONEYPOT BLOCKLIST
# ═══════════════════════════════════════════════════════════════
def check_honeypot(nic: str) -> tuple[bool, str]:
    """
    Checks NIC against a honeypot blocklist of trap numbers.

    WHY: Real citizens never have these NICs. Any attempt
    to register with them is an immediate fraud indicator.
    """
    if nic.upper() in HONEYPOT_NICS:
        return False, f"NIC {nic} is flagged in the security blocklist"
    return True, "Not in blocklist"


# ═══════════════════════════════════════════════════════════════
# LAYER 5 — CA DIGITAL SIGNATURE
# ═══════════════════════════════════════════════════════════════
def sign_nic(nic: str, full_name: str, date_of_birth: str) -> str:
    """
    Signs the NIC data using HMAC-SHA256 with the Government CA key.

    Payload: NIC + full_name + date_of_birth
    Algorithm: HMAC-SHA256
    Key: Government CA secret key

    WHY: Binds the NIC to a specific person's identity
    cryptographically. Any tampering with the NIC or personal
    details invalidates the signature. Forgery is mathematically
    impossible without the CA secret key.
    """
    payload = f"{nic}|{full_name.upper().strip()}|{date_of_birth}"
    signature = hmac.new(
        CA_SECRET_KEY.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return signature


def verify_nic_signature(nic: str, full_name: str, date_of_birth: str, stored_signature: str) -> tuple[bool, str]:
    """
    Verifies the NIC signature against the stored CA signature.
    Called every time the Identity Wallet loads.
    """
    expected = sign_nic(nic, full_name, date_of_birth)
    if hmac.compare_digest(expected, stored_signature):
        return True, "HMAC-SHA256 signature valid — NIC is authentic and untampered"
    return False, "Signature mismatch — NIC data has been tampered with"


# ═══════════════════════════════════════════════════════════════
# LAYER 6 — IMPOSSIBLE TRAVEL DETECTION
# ═══════════════════════════════════════════════════════════════
def check_impossible_travel(nic: str, current_station: str, current_time: datetime = None) -> tuple[bool, str]:
    """
    Detects if this NIC has been used at two locations that
    are physically impossible to travel between in the elapsed time.

    WHY: A cloned NIC cannot physically be in two places at once.
    Same technique used by Visa/Mastercard fraud detection.
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)

    if nic not in _verification_log:
        _verification_log[nic] = (current_time, current_station)
        return True, "First verification logged"

    last_time, last_station = _verification_log[nic]

    if last_station == current_station:
        _verification_log[nic] = (current_time, current_station)
        return True, "Same station — no travel required"

    key1 = (last_station, current_station)
    key2 = (current_station, last_station)
    distance_km = STATION_DISTANCES_KM.get(key1) or STATION_DISTANCES_KM.get(key2)

    if distance_km is None:
        _verification_log[nic] = (current_time, current_station)
        return True, "Route unknown — allowing"

    min_travel_minutes = (distance_km / AVERAGE_SPEED_KMH) * 60

    if last_time.tzinfo is None:
        last_time = last_time.replace(tzinfo=timezone.utc)
    elapsed_minutes = (current_time - last_time).total_seconds() / 60

    if elapsed_minutes < min_travel_minutes:
        return False, (
            f"IMPOSSIBLE TRAVEL: NIC verified at {last_station} "
            f"{elapsed_minutes:.1f} min ago. "
            f"Min travel time to {current_station}: {min_travel_minutes:.1f} min "
            f"({distance_km}km at {AVERAGE_SPEED_KMH}km/h). Possible cloned NIC."
        )

    _verification_log[nic] = (current_time, current_station)
    return True, f"Travel valid: {elapsed_minutes:.1f} min elapsed, {min_travel_minutes:.1f} min required"


# ═══════════════════════════════════════════════════════════════
# LAYER 7 — FRAUD PROBABILITY SCORE
# ═══════════════════════════════════════════════════════════════
def calculate_fraud_score(
    format_valid: bool,
    dob_valid: bool,
    letter_match: bool,
    honeypot_clear: bool,
    signature_valid: bool,
    travel_valid: bool,
    is_duplicate: bool,
) -> tuple[int, str]:
    """
    Calculates a weighted fraud score from 0-100.

    Weights:
    - Signature failure:   +40 (cryptographic proof of tampering)
    - Duplicate NIC:       +35 (identity theft)
    - DOB mismatch:        +30 (using someone else's NIC)
    - Honeypot match:      +30 (deliberate fraud)
    - Impossible travel:   +25 (cloned NIC)
    - Letter mismatch:     +20 (structural violation)
    - Format failure:      +15 (basic format violation)

    0-25:  VERIFIED   (green)
    26-50: SUSPICIOUS (orange)
    51+:   FRAUDULENT (red)
    """
    score = 0
    flags = []

    if not format_valid:
        score += 15
        flags.append("Invalid format (+15)")

    if not letter_match:
        score += 20
        flags.append("Letter mismatch (+20)")

    if not dob_valid:
        score += 30
        flags.append("DOB inconsistency (+30)")

    if not honeypot_clear:
        score += 30
        flags.append("Honeypot NIC (+30)")

    if not signature_valid:
        score += 40
        flags.append("CA signature invalid (+40)")

    if not travel_valid:
        score += 25
        flags.append("Impossible travel (+25)")

    if is_duplicate:
        score += 35
        flags.append("Duplicate NIC (+35)")

    score = min(score, 100)

    if score <= 25:
        level = "VERIFIED"
    elif score <= 50:
        level = "SUSPICIOUS"
    else:
        level = "FRAUDULENT"

    summary = f"{level} (Security Score: {100 - score}/100)"
    if flags:
        summary += f" — {'; '.join(flags)}"

    return score, summary


# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════
def check_rate_limit(ip_address: str) -> tuple[bool, str]:
    """Blocks IPs with too many failed NIC validation attempts."""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    _failed_attempts[ip_address] = [
        t for t in _failed_attempts[ip_address] if t > window_start
    ]

    if len(_failed_attempts[ip_address]) >= RATE_LIMIT_MAX:
        remaining = int(_failed_attempts[ip_address][0] + RATE_LIMIT_WINDOW - now)
        return False, f"Too many failed attempts. Try again in {remaining} seconds."

    return True, "Rate limit OK"


def record_failed_attempt(ip_address: str):
    """Records a failed NIC validation attempt."""
    _failed_attempts[ip_address].append(time.time())


# ═══════════════════════════════════════════════════════════════
# MASTER VALIDATION FUNCTION
# ═══════════════════════════════════════════════════════════════
def validate_nic_full(
    nic: str,
    full_name: str,
    date_of_birth: str,
    stored_signature: str = None,
    station: str = None,
    is_duplicate: bool = False,
    ip_address: str = None,
) -> dict:
    """
    Runs all 7 security layers and returns a complete fraud report.
    This is the single entry point for all NIC security checks.
    """
    nic = nic.upper().strip()

    # Layer 1 — Format
    fmt_valid, fmt_reason = validate_nic_format(nic)

    # Layer 2 — DOB Consistency
    if fmt_valid and date_of_birth:
        dob_valid, dob_reason = validate_dob_consistency(nic, date_of_birth)
    else:
        dob_valid, dob_reason = False, "Skipped — format invalid or no DOB provided"

    # Layer 3 — Letter Match
    if fmt_valid:
        letter_valid, letter_reason = validate_letter_match(nic)
    else:
        letter_valid, letter_reason = False, "Skipped — format invalid"

    # Layer 4 — Honeypot
    honeypot_clear, honeypot_reason = check_honeypot(nic)

    # Layer 5 — CA Signature
    if stored_signature:
        sig_valid, sig_reason = verify_nic_signature(nic, full_name, date_of_birth, stored_signature)
    else:
        sig_valid, sig_reason = True, "Registration phase — signature not yet generated"

    # Layer 6 — Impossible Travel
    if station:
        travel_valid, travel_reason = check_impossible_travel(nic, station)
    else:
        travel_valid, travel_reason = True, "No station provided"

    # Layer 7 — Fraud Score
    fraud_score, fraud_summary = calculate_fraud_score(
        fmt_valid, dob_valid, letter_valid,
        honeypot_clear, sig_valid, travel_valid, is_duplicate
    )

    return {
        "nic": nic,
        "fraud_score": fraud_score,
        "fraud_level": "VERIFIED" if fraud_score <= 25 else "SUSPICIOUS" if fraud_score <= 50 else "FRAUDULENT",
        "fraud_summary": fraud_summary,
        "layers": {
            "format":    {"valid": fmt_valid,       "reason": fmt_reason},
            "dob":       {"valid": dob_valid,        "reason": dob_reason},
            "letter":    {"valid": letter_valid,     "reason": letter_reason},
            "honeypot":  {"valid": honeypot_clear,   "reason": honeypot_reason},
            "signature": {"valid": sig_valid,        "reason": sig_reason},
            "travel":    {"valid": travel_valid,     "reason": travel_reason},
            "duplicate": {"valid": not is_duplicate, "reason": "Duplicate NIC found" if is_duplicate else "No duplicate"},
        }
    }