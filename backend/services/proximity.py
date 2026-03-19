def compute_proximity(driver):
    """
    Computes suspension threshold proximity ratio.
    """
    return round(driver.current_points / 12, 2)