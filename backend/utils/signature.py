import hmac
import hashlib
import json
from datetime import datetime, timezone
import copy


SECRET_KEY = "super_secret_key_change_this"


def sign_passport(passport: dict) -> str:
    """
    Generates HMAC-SHA256 signature of passport dictionary.
    """
    passport_string = json.dumps(passport, sort_keys=True)

    signature = hmac.new(
        SECRET_KEY.encode(),
        passport_string.encode(),
        hashlib.sha256
    ).hexdigest()

    return signature


def verify_passport(passport: dict) -> tuple[bool, str]:
    """
    Verifies:
    - Signature integrity
    - Expiry validity

    Returns:
        (True, "VALID") if valid
        (False, reason) if invalid
    """

    provided_signature = passport.get("signature")
    if not provided_signature:
        return False, "Missing signature"

    # Deep copy to avoid modifying original
    passport_copy = copy.deepcopy(passport)
    passport_copy.pop("signature", None)

    expected_signature = sign_passport(passport_copy)

    # Signature integrity check
    if not hmac.compare_digest(provided_signature, expected_signature):
        return False, "Signature mismatch (tampering detected)"

    # Expiry check (timezone-aware)
    metadata = passport.get("metadata", {})
    expires_at_str = metadata.get("expires_at")

    if not expires_at_str:
        return False, "Missing expiry metadata"

    try:
        expires_at = datetime.fromisoformat(expires_at_str)
    except Exception:
        return False, "Invalid expiry format"

    current_time = datetime.now(timezone.utc)

    if current_time > expires_at:
        return False, "Passport expired"

    return True, "VALID"