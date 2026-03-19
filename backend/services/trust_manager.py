from datetime import datetime, timezone

def compute_trust(driver, verification_mode: str):
    """
    Computes trust level based on data freshness and verification mode.
    """

    now = datetime.now(timezone.utc)
    delta = now - driver.last_sync

    hours_since_sync = delta.total_seconds() / 3600

    # If online, always high trust
    if verification_mode == "ONLINE":
        return "HIGH"

    # If offline, evaluate data freshness
    if hours_since_sync < 24:
        return "HIGH"
    elif hours_since_sync < 72:
        return "MEDIUM"
    else:
        return "LOW"