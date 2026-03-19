from services.stability_index import compute_stability
from services.trend_analysis import calculate_trend
from services.proximity import compute_proximity
from services.risk_classifier import classify_risk


def risk_distribution(drivers):
    """
    Calculates system-wide risk distribution
    """

    result = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0
    }

    for driver in drivers:

        stability = compute_stability(driver)
        trend = calculate_trend(driver)
        proximity = compute_proximity(driver)

        risk = classify_risk(stability, proximity, trend)

        result[risk["risk_level"]] += 1

    return result


def offence_distribution(drivers):
    """
    Counts offence categories across all drivers
    """

    minor = 0
    moderate = 0
    severe = 0

    for d in drivers:
        minor += d.minor_offences
        moderate += d.moderate_offences
        severe += d.severe_offences

    return {
        "minor": minor,
        "moderate": moderate,
        "severe": severe
    }


def behaviour_scores(drivers):
    """
    Calculates behaviour score for each driver
    """

    scores = []

    for driver in drivers:

        stability = compute_stability(driver)
        trend = calculate_trend(driver)
        proximity = compute_proximity(driver)

        risk = classify_risk(stability, proximity, trend)

        risk_score = risk["risk_score"]

        # Behaviour score formula
        behaviour_score = round(100 - (risk_score * 100), 2)

        scores.append({
            "driver_id": driver.driver_id,
            "behaviour_score": behaviour_score,
            "risk_level": risk["risk_level"]
        })

    return scores


def average_behaviour_score(drivers):
    """
    Calculates average behaviour score across all drivers
    """

    scores = behaviour_scores(drivers)

    if len(scores) == 0:
        return 0

    total = sum(d["behaviour_score"] for d in scores)

    return round(total / len(scores), 2)