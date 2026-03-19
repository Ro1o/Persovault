import sqlite3
import json

DB_NAME = "passport_db.sqlite"


def init_db():

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            full_name TEXT,
            phone TEXT,
            address TEXT
        )
    """)

    # Passport table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS passports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id TEXT,
            passport_json TEXT
        )
    """)

    # Driver behaviour table (used for AI retraining)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS driver_behaviour (
            id                          INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id                   TEXT NOT NULL,
            current_points              REAL,
            offences_last_12m           INTEGER,
            minor_offences              INTEGER,
            moderate_offences           INTEGER,
            severe_offences             INTEGER,
            days_since_last_offence     REAL,
            avg_days_between_offences   REAL,
            years_since_licence_issue   REAL,
            suspension_proximity        REAL,
            stability_index             REAL,
            trend_encoded               INTEGER,
            label                       INTEGER,   -- 1 = at risk of suspension, 0 = safe
            recorded_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# ---------------------------
# USER MANAGEMENT
# ---------------------------

def create_user(user: dict):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO users (username, password, role, full_name, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user["username"],
        user["password"],
        user["role"],
        user.get("full_name"),
        user.get("phone"),
        user.get("address")
    ))

    conn.commit()
    conn.close()


def get_user(username: str):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT username, password, role FROM users WHERE username=?",
        (username,)
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "username": row[0],
        "password": row[1],
        "role": row[2]
    }


# ---------------------------
# PASSPORT MANAGEMENT
# ---------------------------

def save_passport(passport: dict):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO passports (driver_id, passport_json) VALUES (?, ?)",
        (passport["driver_id"], json.dumps(passport))
    )

    conn.commit()
    conn.close()


def get_passports_by_driver(driver_id: str):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT passport_json FROM passports WHERE driver_id=?",
        (driver_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    return [json.loads(row[0]) for row in rows]


# ---------------------------
# DRIVER BEHAVIOUR (AI)
# ---------------------------

def save_driver_behaviour(driver_id: str, features: dict, label: int):
    """
    Call this whenever a driver logs in or their data is updated,
    so the AI retraining always has fresh real data to learn from.
    """

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO driver_behaviour (
            driver_id,
            current_points,
            offences_last_12m,
            minor_offences,
            moderate_offences,
            severe_offences,
            days_since_last_offence,
            avg_days_between_offences,
            years_since_licence_issue,
            suspension_proximity,
            stability_index,
            trend_encoded,
            label
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        driver_id,
        features.get("current_points"),
        features.get("offences_last_12m"),
        features.get("minor_offences"),
        features.get("moderate_offences"),
        features.get("severe_offences"),
        features.get("days_since_last_offence"),
        features.get("avg_days_between_offences"),
        features.get("years_since_licence_issue"),
        features.get("suspension_proximity"),
        features.get("stability_index"),
        features.get("trend_encoded"),
        label
    ))

    conn.commit()
    conn.close()


def get_all_driver_behaviour():
    """
    Returns all recorded driver behaviour rows.
    Used by the weekly retraining workflow.
    """

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            current_points,
            offences_last_12m,
            minor_offences,
            moderate_offences,
            severe_offences,
            days_since_last_offence,
            avg_days_between_offences,
            years_since_licence_issue,
            suspension_proximity,
            stability_index,
            trend_encoded,
            label
        FROM driver_behaviour
        WHERE label IS NOT NULL
    """)

    rows = cursor.fetchall()
    conn.close()

    columns = [
        "current_points", "offences_last_12m", "minor_offences",
        "moderate_offences", "severe_offences", "days_since_last_offence",
        "avg_days_between_offences", "years_since_licence_issue",
        "suspension_proximity", "stability_index", "trend_encoded", "label"
    ]

    return [dict(zip(columns, row)) for row in rows]