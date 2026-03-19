# ai/dataset_generator.py

import random
import csv
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import SUSPENSION_THRESHOLD

TOTAL_DRIVERS = 15000
OUTPUT_FILE = "ai/synthetic_drivers.csv"


# -----------------------------
# Cluster Definitions
# -----------------------------

CLUSTERS = {
    "SAFE": {
        "size_ratio": 0.40,
        "monthly_offence_prob": 0.05,
        "severity_dist": [0.8, 0.2, 0.0]
    },
    "OCCASIONAL": {
        "size_ratio": 0.30,
        "monthly_offence_prob": 0.15,
        "severity_dist": [0.6, 0.3, 0.1]
    },
    "ESCALATING": {
        "size_ratio": 0.20,
        "monthly_offence_prob": 0.30,
        "severity_dist": [0.4, 0.4, 0.2]
    },
    "CHRONIC": {
        "size_ratio": 0.10,
        "monthly_offence_prob": 0.50,
        "severity_dist": [0.2, 0.3, 0.5]
    }
}


# -----------------------------
# Helper Functions
# -----------------------------

def generate_initial_points(cluster_name):
    if cluster_name == "SAFE":
        return random.randint(0, 4)
    elif cluster_name == "OCCASIONAL":
        return random.randint(3, 8)
    elif cluster_name == "ESCALATING":
        return random.randint(6, 12)
    else:
        return random.randint(10, 14)


def simulate_six_months(cluster_name, current_points):
    cluster = CLUSTERS[cluster_name]

    points = current_points
    minor = 0
    moderate = 0
    severe = 0

    days_since_last_offence = random.randint(0, 180)
    avg_days_between_offences = random.randint(30, 120)

    monthly_prob = cluster["monthly_offence_prob"]

    for month in range(6):

        # Escalation effect for ESCALATING cluster
        if cluster_name == "ESCALATING":
            monthly_prob += 0.02

        # Behavioural noise
        noise = random.uniform(-0.05, 0.05)
        effective_prob = max(0, min(1, monthly_prob + noise))

        if random.random() < effective_prob:

            # Random severe spike event
            if random.random() < 0.03:
                severity_choice = "severe"
            else:
                severity_choice = random.choices(
                    ["minor", "moderate", "severe"],
                    weights=cluster["severity_dist"]
                )[0]

            if severity_choice == "minor":
                points += random.randint(2, 4)
                minor += 1
            elif severity_choice == "moderate":
                points += random.randint(4, 6)
                moderate += 1
            else:
                points += random.randint(8, 10)
                severe += 1

            days_since_last_offence = 0
            avg_days_between_offences = max(10, avg_days_between_offences - 5)

        else:
            days_since_last_offence += 30

            # Behavioural recovery
            if days_since_last_offence > 120:
                avg_days_between_offences += random.randint(2, 5)

    return (
        points,
        minor,
        moderate,
        severe,
        days_since_last_offence,
        avg_days_between_offences
    )


def encode_trend(current_points, projected_points):
    if projected_points > current_points:
        return 1
    elif projected_points < current_points:
        return -1
    else:
        return 0


# -----------------------------
# Main Generator
# -----------------------------

def generate_dataset():

    rows = []

    for cluster_name, cluster_data in CLUSTERS.items():

        cluster_size = int(TOTAL_DRIVERS * cluster_data["size_ratio"])

        for _ in range(cluster_size):

            current_points = generate_initial_points(cluster_name)

            (
                projected_points,
                minor,
                moderate,
                severe,
                days_since_last_offence,
                avg_days_between_offences
            ) = simulate_six_months(cluster_name, current_points)

            suspension_proximity = current_points / SUSPENSION_THRESHOLD

            stability_index = max(
                0,
                100 - (suspension_proximity * 40)
                - (minor * 2 + moderate * 4 + severe * 6)
            )

            trend_encoded = encode_trend(current_points, projected_points)

            # Label based on suspension threshold
            label = 1 if projected_points >= SUSPENSION_THRESHOLD else 0

            # Label noise (2% misclassification)
            if random.random() < 0.02:
                label = 1 - label

            # Observation noise
            observed_offences = minor + moderate + severe + random.choice([-1, 0, 0, 1])
            observed_offences = max(0, observed_offences)

            row = [
                current_points,
                observed_offences,
                minor,
                moderate,
                severe,
                days_since_last_offence,
                avg_days_between_offences,
                random.randint(1, 25),
                suspension_proximity,
                stability_index,
                trend_encoded,
                label
            ]

            rows.append(row)

    # Write CSV
    with open(OUTPUT_FILE, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            "current_points",
            "offences_last_12m",
            "minor_offences",
            "moderate_offences",
            "severe_offences",
            "days_since_last_offence",
            "avg_days_between_offences",
            "years_since_licence_issue",
            "suspension_proximity",
            "stability_index",
            "trend_encoded",
            "label"
        ])
        writer.writerows(rows)

    print(f"Dataset generated with {len(rows)} drivers.")


if __name__ == "__main__":
    generate_dataset()