def compute_behaviour_score(stability, proximity, trend):
    """
    Converts behaviour indicators into a score from 0-100
    """

    score = stability

    # proximity penalty
    score -= proximity * 30

    # trend penalty
    if trend == "INCREASING":
        score -= 15

    if trend == "IMPROVING":
        score += 5

    # clamp score
    score = max(0, min(100, score))

    return round(score)