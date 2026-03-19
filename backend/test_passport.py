from models.driver import Driver  # adjust path if needed
from services.passport_generator import generate_passport
from datetime import datetime

# Create test driver
driver = Driver(
    driver_id="DRV123",
    current_points=12,
    previous_points=10,
    offences_last_12m=4,
    minor_offences=1,
    moderate_offences=1,
    severe_offences=2,
    days_since_last_offence=15,
    avg_days_between_offences=45,
    years_since_licence_issue=8,
    last_sync=datetime.utcnow()
)

passport = generate_passport(driver, verification_mode="ONLINE")

print(passport)