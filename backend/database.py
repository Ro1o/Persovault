import sqlite3
import json
import bcrypt
import random
import string
from datetime import datetime

DB_NAME = "passport_db.sqlite"


def init_db():

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT UNIQUE,
            password    TEXT,
            role        TEXT,
            full_name   TEXT,
            phone       TEXT,
            address     TEXT,
            driver_id   TEXT UNIQUE
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
            label                       INTEGER,
            recorded_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # NIC Security table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nic_records (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            username        TEXT UNIQUE,
            nic_number      TEXT UNIQUE,
            full_name       TEXT,
            date_of_birth   TEXT,
            ca_signature    TEXT,
            fraud_score     INTEGER DEFAULT 0,
            fraud_level     TEXT DEFAULT 'VERIFIED',
            registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Audit Log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            action      TEXT NOT NULL,
            username    TEXT,
            nic_number  TEXT,
            ip_address  TEXT,
            result      TEXT,
            details     TEXT,
            timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Offences table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS offences (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id   TEXT NOT NULL,
            title       TEXT NOT NULL,
            description TEXT,
            location    TEXT,
            severity    TEXT DEFAULT 'minor',
            points      INTEGER DEFAULT 1,
            status      TEXT DEFAULT 'active',
            offence_date TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# ---------------------------
# DRIVER ID GENERATION
# ---------------------------

def generate_driver_id() -> str:
    year = datetime.now().year
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    while True:
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        driver_id = f"DRV-{year}-{suffix}"
        cursor.execute("SELECT 1 FROM users WHERE driver_id=?", (driver_id,))
        if not cursor.fetchone():
            conn.close()
            return driver_id


# ---------------------------
# PASSWORD HASHING
# ---------------------------

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# ---------------------------
# USER MANAGEMENT
# ---------------------------

def create_user(user: dict) -> str:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    hashed_pw = hash_password(user["password"])

    driver_id = None
    if user.get("role") == "driver":
        driver_id = generate_driver_id()

    cursor.execute("""
        INSERT INTO users (username, password, role, full_name, phone, address, driver_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user["username"],
        hashed_pw,
        user["role"],
        user.get("full_name"),
        user.get("phone"),
        user.get("address"),
        driver_id,
    ))

    conn.commit()
    conn.close()
    return driver_id


def get_user(username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT username, password, role, full_name, driver_id FROM users WHERE username=?",
        (username,)
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "username":  row[0],
        "password":  row[1],
        "role":      row[2],
        "full_name": row[3],
        "driver_id": row[4],
    }


def get_profile(username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT username, role, full_name, phone, address, driver_id
        FROM users WHERE username=?
    """, (username,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "username":  row[0],
        "role":      row[1],
        "full_name": row[2],
        "phone":     row[3],
        "address":   row[4],
        "driver_id": row[5],
    }


def update_password(username: str, new_hashed_password: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET password=? WHERE username=?",
        (new_hashed_password, username)
    )
    conn.commit()
    conn.close()


# ---------------------------
# NIC SECURITY
# ---------------------------

def save_nic_record(username: str, nic_number: str, full_name: str,
                    date_of_birth: str, ca_signature: str,
                    fraud_score: int, fraud_level: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO nic_records
            (username, nic_number, full_name, date_of_birth, ca_signature, fraud_score, fraud_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (username, nic_number, full_name, date_of_birth, ca_signature, fraud_score, fraud_level))
    conn.commit()
    conn.close()


def get_nic_record(username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT nic_number, full_name, date_of_birth, ca_signature, fraud_score, fraud_level, registered_at
        FROM nic_records WHERE username=?
    """, (username,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "nic_number":    row[0],
        "full_name":     row[1],
        "date_of_birth": row[2],
        "ca_signature":  row[3],
        "fraud_score":   row[4],
        "fraud_level":   row[5],
        "registered_at": row[6],
    }


def nic_exists(nic_number: str) -> bool:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM nic_records WHERE nic_number=?", (nic_number,))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists


def get_all_nic_records():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, nic_number, full_name, fraud_score, fraud_level, registered_at
        FROM nic_records ORDER BY fraud_score DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [
        {"username": r[0], "nic_number": r[1], "full_name": r[2],
         "fraud_score": r[3], "fraud_level": r[4], "registered_at": r[5]}
        for r in rows
    ]


# ---------------------------
# AUDIT LOG
# ---------------------------

def log_audit(action: str, username: str = None, nic_number: str = None,
              ip_address: str = None, result: str = None, details: str = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_log (action, username, nic_number, ip_address, result, details)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (action, username, nic_number, ip_address, result, details))
    conn.commit()
    conn.close()


def get_audit_log(username: str = None, limit: int = 50):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    if username:
        cursor.execute("""
            SELECT action, username, nic_number, ip_address, result, details, timestamp
            FROM audit_log WHERE username=? ORDER BY timestamp DESC LIMIT ?
        """, (username, limit))
    else:
        cursor.execute("""
            SELECT action, username, nic_number, ip_address, result, details, timestamp
            FROM audit_log ORDER BY timestamp DESC LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {"action": r[0], "username": r[1], "nic_number": r[2],
         "ip_address": r[3], "result": r[4], "details": r[5], "timestamp": r[6]}
        for r in rows
    ]


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
    cursor.execute("SELECT passport_json FROM passports WHERE driver_id=?", (driver_id,))
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row[0]) for row in rows]


# ---------------------------
# DRIVER BEHAVIOUR (AI)
# ---------------------------

def save_driver_behaviour(driver_id: str, features: dict, label: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO driver_behaviour (
            driver_id, current_points, offences_last_12m, minor_offences,
            moderate_offences, severe_offences, days_since_last_offence,
            avg_days_between_offences, years_since_licence_issue,
            suspension_proximity, stability_index, trend_encoded, label
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
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT current_points, offences_last_12m, minor_offences, moderate_offences,
               severe_offences, days_since_last_offence, avg_days_between_offences,
               years_since_licence_issue, suspension_proximity, stability_index,
               trend_encoded, label
        FROM driver_behaviour WHERE label IS NOT NULL
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


# ---------------------------
# OFFENCES
# ---------------------------

def save_offence(driver_id: str, title: str, description: str,
                 location: str, severity: str, points: int,
                 offence_date: str, status: str = "active"):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO offences
            (driver_id, title, description, location, severity, points, status, offence_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (driver_id, title, description, location, severity, points, status, offence_date))
    conn.commit()
    conn.close()


def get_offences_by_driver(driver_id: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, description, location, severity, points, status, offence_date, created_at
        FROM offences WHERE driver_id=?
        ORDER BY offence_date DESC
    """, (driver_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id":           r[0],
            "title":        r[1],
            "description":  r[2],
            "location":     r[3],
            "severity":     r[4],
            "points":       r[5],
            "status":       r[6],
            "offence_date": r[7],
            "created_at":   r[8],
        }
        for r in rows
    ]


def get_driver_stats(driver_id: str) -> dict:
    SUSPENSION_THRESHOLD = 12
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COALESCE(SUM(points), 0)
        FROM offences WHERE driver_id=? AND status='active'
    """, (driver_id,))
    total_points = cursor.fetchone()[0]

    cursor.execute("""
        SELECT offence_date FROM offences
        WHERE driver_id=?
        ORDER BY offence_date DESC LIMIT 1
    """, (driver_id,))
    row = cursor.fetchone()

    clean_days = 0
    if row:
        try:
            last_date = datetime.strptime(row[0], "%Y-%m-%d")
            clean_days = (datetime.now() - last_date).days
        except Exception:
            clean_days = 0

    cursor.execute("""
        SELECT COUNT(*) FROM offences WHERE driver_id=? AND status='active'
    """, (driver_id,))
    active_count = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM offences WHERE driver_id=?
    """, (driver_id,))
    total_count = cursor.fetchone()[0]

    conn.close()

    return {
        "total_points":  total_points,
        "clean_days":    clean_days,
        "active_count":  active_count,
        "total_count":   total_count,
        "is_suspended":  total_points >= SUSPENSION_THRESHOLD,
    }


# ── NEW: Admin Stats ──────────────────────────────────────────
def get_admin_stats() -> dict:
    """
    Returns system-wide stats for the Admin Dashboard.
    Queries real data from the database.
    """
    SUSPENSION_THRESHOLD = 12
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Total drivers
    cursor.execute("SELECT COUNT(*) FROM users WHERE role='driver'")
    total_drivers = cursor.fetchone()[0]

    # Total police
    cursor.execute("SELECT COUNT(*) FROM users WHERE role='police'")
    total_police = cursor.fetchone()[0]

    # Total admins
    cursor.execute("SELECT COUNT(*) FROM users WHERE role='admin'")
    total_admins = cursor.fetchone()[0]

    # Suspended drivers (total active points >= threshold)
    cursor.execute("""
        SELECT COUNT(*) FROM (
            SELECT driver_id, SUM(points) as total
            FROM offences WHERE status='active'
            GROUP BY driver_id
            HAVING total >= ?
        )
    """, (SUSPENSION_THRESHOLD,))
    suspended_drivers = cursor.fetchone()[0]

    # High risk drivers (total active points >= 8, not yet suspended)
    cursor.execute("""
        SELECT COUNT(*) FROM (
            SELECT driver_id, SUM(points) as total
            FROM offences WHERE status='active'
            GROUP BY driver_id
            HAVING total >= 8 AND total < ?
        )
    """, (SUSPENSION_THRESHOLD,))
    high_risk_drivers = cursor.fetchone()[0]

    # Medium risk drivers (total active points 4-7)
    cursor.execute("""
        SELECT COUNT(*) FROM (
            SELECT driver_id, SUM(points) as total
            FROM offences WHERE status='active'
            GROUP BY driver_id
            HAVING total >= 4 AND total < 8
        )
    """)
    medium_risk_drivers = cursor.fetchone()[0]

    # Low risk = drivers with < 4 points (including clean)
    low_risk_drivers = total_drivers - high_risk_drivers - medium_risk_drivers - suspended_drivers

    # Total active offences
    cursor.execute("SELECT COUNT(*) FROM offences WHERE status='active'")
    total_active_offences = cursor.fetchone()[0]

    # Total NIC records registered
    cursor.execute("SELECT COUNT(*) FROM nic_records")
    total_nic_registered = cursor.fetchone()[0]

    # NIC fraud alerts (fraud_score > 25)
    cursor.execute("SELECT COUNT(*) FROM nic_records WHERE fraud_score > 25")
    nic_alerts = cursor.fetchone()[0]

    # 7-month offence trend (count of offences per month)
    trend_data = []
    now = datetime.now()
    for i in range(6, -1, -1):
        month_date = datetime(now.year, now.month, 1)
        # Go back i months
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        month_label = datetime(y, m, 1).strftime("%b")
        cursor.execute("""
            SELECT COUNT(*) FROM offences
            WHERE strftime('%Y', offence_date) = ?
            AND strftime('%m', offence_date) = ?
        """, (str(y), f"{m:02d}"))
        count = cursor.fetchone()[0]
        trend_data.append({"month": month_label, "offences": count})

    conn.close()

    return {
        "total_drivers":        total_drivers,
        "total_police":         total_police,
        "total_admins":         total_admins,
        "suspended_drivers":    suspended_drivers,
        "high_risk_drivers":    high_risk_drivers,
        "medium_risk_drivers":  medium_risk_drivers,
        "low_risk_drivers":     max(low_risk_drivers, 0),
        "total_active_offences": total_active_offences,
        "total_nic_registered": total_nic_registered,
        "nic_alerts":           nic_alerts,
        "offence_trend":        trend_data,
    }

# ---------------------------
# ADMIN — ALL DRIVERS
# ---------------------------

def get_all_drivers() -> list:
    """
    Returns all driver accounts with their penalty point totals.
    Used by the admin Driver Search page.
    """
    SUSPENSION_THRESHOLD = 12
    conn   = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.username, u.full_name, u.driver_id, u.phone, u.address,
               COALESCE(SUM(CASE WHEN o.status='active' THEN o.points ELSE 0 END), 0) as total_points,
               COUNT(CASE WHEN o.status='active' THEN 1 END) as active_offences,
               MAX(o.offence_date) as last_offence_date
        FROM users u
        LEFT JOIN offences o ON u.driver_id = o.driver_id
        WHERE u.role = 'driver'
        GROUP BY u.username
        ORDER BY total_points DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    drivers = []
    for r in rows:
        total_points    = r[5] or 0
        is_suspended    = total_points >= SUSPENSION_THRESHOLD
        active_offences = r[6] or 0

        if is_suspended:
            risk_level = "Suspended"
        elif total_points >= 8:
            risk_level = "High"
        elif total_points >= 4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        compliance  = "SUSPENDED" if is_suspended else "COMPLIANT"
        driver_id   = r[2] or "—"
        suffix      = driver_id.split("-")[2] if driver_id and "-" in driver_id else "AB123"
        licence_number = f"MU/2026/{suffix[:6]}"
        last_update = r[7] or "No offences"

        drivers.append({
            "username":        r[0],
            "full_name":       r[1] or "—",
            "driver_id":       driver_id,
            "licence_number":  licence_number,
            "total_points":    total_points,
            "active_offences": active_offences,
            "risk_level":      risk_level,
            "compliance":      compliance,
            "is_suspended":    is_suspended,
            "last_update":     last_update,
        })

    return drivers