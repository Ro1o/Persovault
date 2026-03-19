def validate_driver(driver):
    if driver.current_points >= 12:
        return "SUSPENDED"
    elif driver.current_points >= 10:
        return "WARNING"
    else:
        return "VALID"