from ai_engine import BehaviouralAIEngine

engine = BehaviouralAIEngine()

sample_driver = {
    "current_points": 12,
    "offences_last_12m": 4,
    "minor_offences": 1,
    "moderate_offences": 1,
    "severe_offences": 2,
    "days_since_last_offence": 10,
    "avg_days_between_offences": 40,
    "years_since_licence_issue": 8,
    "suspension_proximity": 12/15,
    "stability_index": 45,
    "trend_encoded": 1
}

result = engine.predict(sample_driver)

print(result)