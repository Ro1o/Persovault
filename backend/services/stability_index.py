def compute_stability(driver):
    """
    Mauritius-tier aware behavioural stability score (0–100).
    """

    score = 100

    # 1️⃣ Threshold proximity penalty (12-point suspension rule)
    threshold_ratio = driver.current_points / 12
    score -= threshold_ratio * 40

    # 2️⃣ Frequency penalty
    score -= driver.offences_last_12m * 3

    # 3️⃣ Tier-weighted severity penalty
    weighted_severity = (
        driver.minor_offences * 1 +
        driver.moderate_offences * 2 +
        driver.severe_offences * 3
    )

    score -= weighted_severity * 4

    # 4️⃣ Recent offence clustering penalty
    if driver.days_since_last_offence < 30:
        score -= 10

    # 5️⃣ Long clean streak bonus
    if driver.days_since_last_offence > 180:
        score += 5

    # Clamp between 0 and 100
    score = max(min(score, 100), 0)

    return round(score, 2)