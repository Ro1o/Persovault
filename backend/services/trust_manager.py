from datetime import datetime, timezone

def compute_trust(driver, verification_mode: str):
    """
    Computes trust level based on data freshness and verification mode.
    """

    now = datetime.now(timezone.utc)

    # Make last_sync timezone-aware if it isn't already
    last_sync = driver.last_sync
    if isinstance(last_sync, datetime):
        if last_sync.tzinfo is None:
            last_sync = last_sync.replace(tzinfo=timezone.utc)
    else:
        # If it's a string, parse it
        try:
            last_sync = datetime.fromisoformat(str(last_sync)).replace(tzinfo=timezone.utc)
        except Exception:
            last_sync = now  # fallback to now if parsing fails

    delta = now - last_sync
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