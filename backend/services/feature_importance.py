import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FEATURE_FILE = BASE_DIR / "ai" / "feature_importance.csv"


def get_feature_importance():
    """
    Reads feature importance values from CSV
    """

    features = []

    with open(FEATURE_FILE, mode="r") as file:
        reader = csv.DictReader(file)

        for row in reader:
            features.append({
                "feature": row["feature"],
                "importance": float(row["importance"])
            })

    features.sort(key=lambda x: x["importance"], reverse=True)

    return features