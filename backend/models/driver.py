from pydantic import BaseModel
from datetime import datetime

class Driver(BaseModel):
    driver_id: str

    current_points: int
    previous_points: int

    offences_last_12m: int
    minor_offences: int
    moderate_offences: int
    severe_offences: int

    days_since_last_offence: int
    avg_days_between_offences: int
    years_since_licence_issue: int

    last_sync: datetime