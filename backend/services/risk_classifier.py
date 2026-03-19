def classify_risk(stability, proximity, trend):
    """
    Classifies driver risk level using deterministic logic
    and returns both risk score and level.
    """

    # Immediate high-risk if very close to suspension
    if proximity >= 0.8:
        return {
            "risk_score": 0.9,
            "risk_level": "HIGH"
        }

    # Increasing behaviour with low stability
    if trend == "INCREASING" and stability < 40:
        return {
            "risk_score": 0.8,
            "risk_level": "HIGH"
        }

    # Medium risk zone
    if stability < 60 or proximity >= 0.5:
        return {
            "risk_score": 0.5,
            "risk_level": "MEDIUM"
        }

    return {
        "risk_score": 0.2,
        "risk_level": "LOW"
    }