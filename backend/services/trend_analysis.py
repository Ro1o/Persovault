def calculate_trend(driver):
    """
    Determines behavioural direction based on penalty progression.
    """

    if driver.current_points > driver.previous_points:
        return "INCREASING"

    elif driver.current_points < driver.previous_points:
        return "DECREASING"

    else:
        return "STABLE"