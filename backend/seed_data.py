# backend/seed_data.py
#
# Pre-seeds the database with 10 fully detailed demo drivers.
# Each driver has:
#   - Full name, phone, address
#   - NIC number (valid Mauritius format: Letter+DDMMYY+6digits+Letter)
#   - Date of birth (matching NIC)
#   - Driving licence number
#   - CA digital signature for NIC
#   - Realistic offence history
#
# Run ONCE after deleting the old database:
#   cd backend
#   del passport_db.sqlite
#   python seed_data.py
#
# All accounts use password: Demo1234!

import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    init_db, hash_password, generate_driver_id,
    save_offence, get_user, save_nic_record
)
from nic_security import sign_nic
import sqlite3

DB_NAME = "passport_db.sqlite"


def seed_user(username, password, role, full_name, phone, address):
    """Inserts a user. Skips if already exists. Returns driver_id."""
    existing = get_user(username)
    if existing:
        print(f"  ⚠️  '{username}' already exists — skipping")
        return existing.get("driver_id")

    conn   = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    hashed_pw = hash_password(password)
    driver_id = generate_driver_id() if role == "driver" else None

    cursor.execute("""
        INSERT INTO users (username, password, role, full_name, phone, address, driver_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (username, hashed_pw, role, full_name, phone, address, driver_id))

    conn.commit()
    conn.close()

    print(f"  ✅ {role:8} | {username:22} | {driver_id or 'N/A'}")
    return driver_id


def register_nic(username, nic_number, full_name, date_of_birth):
    """Registers NIC with CA signature in nic_records table."""
    try:
        ca_signature = sign_nic(nic_number, full_name, date_of_birth)
        save_nic_record(username, nic_number, full_name, date_of_birth,
                        ca_signature, 0, "VERIFIED")
        print(f"     🔐 NIC registered: {nic_number}")
    except Exception as e:
        print(f"     ⚠️  NIC already registered or error: {e}")


def days_ago(n):
    return (datetime.now() - timedelta(days=n)).strftime("%Y-%m-%d")


def seed():
    print("\n" + "=" * 70)
    print("  PersoVault — Database Seeder (10 Drivers + Full Details)")
    print("=" * 70)
    init_db()

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 1: Alice Fernandez — CLEAN RECORD (LOW risk)
    # DOB: 15/03/1995 → NIC digits: 150395
    # ══════════════════════════════════════════════════════════════════
    d1 = seed_user(
        "alice.demo", "Demo1234!", "driver",
        "Alice Fernandez", "+230 5712 3456",
        "14 Labourdonnas Street, Port Louis"
    )
    if d1:
        register_nic("alice.demo", "F150395012345F", "Alice Fernandez", "1995-03-15")
        # No offences — perfect clean record

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 2: Bob Ramkhelawon — MINOR OFFENCES (LOW risk)
    # DOB: 22/07/1988 → NIC digits: 220788
    # ══════════════════════════════════════════════════════════════════
    d2 = seed_user(
        "bob.demo", "Demo1234!", "driver",
        "Bob Ramkhelawon", "+230 5723 4567",
        "89 Royal Road, Quatre Bornes"
    )
    if d2:
        register_nic("bob.demo", "R220788023456R", "Bob Ramkhelawon", "1988-07-22")
        save_offence(d2, "Speeding Violation",
                     "Exceeded speed limit by 15 km/h on M1 motorway",
                     "Port Louis", "minor", 2, days_ago(145))
        save_offence(d2, "Parking Violation",
                     "Parked in no-parking zone for over 2 hours",
                     "Curepipe", "minor", 1, days_ago(280))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 3: Charlie Moorghen — MODERATE OFFENCES (MEDIUM risk)
    # DOB: 08/11/1990 → NIC digits: 081190
    # ══════════════════════════════════════════════════════════════════
    d3 = seed_user(
        "charlie.demo", "Demo1234!", "driver",
        "Charlie Moorghen", "+230 5734 5678",
        "23 Vandermeersch Street, Rose Hill"
    )
    if d3:
        register_nic("charlie.demo", "M081190034567M", "Charlie Moorghen", "1990-11-08")
        save_offence(d3, "Mobile Phone Violation",
                     "Using mobile phone while driving on main road",
                     "Curepipe", "moderate", 3, days_ago(45))
        save_offence(d3, "Speeding — School Zone",
                     "Exceeded speed limit by 30 km/h in school zone",
                     "Quatre Bornes", "moderate", 4, days_ago(120))
        save_offence(d3, "Failure to Stop",
                     "Failed to stop at mandatory stop sign",
                     "Rose Hill", "minor", 2, days_ago(200))
        save_offence(d3, "Illegal Overtaking",
                     "Overtook on a solid white line near bridge",
                     "Port Louis", "minor", 2, days_ago(310))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 4: Diana Bundhoo — SEVERE OFFENCES (HIGH risk)
    # DOB: 03/05/1985 → NIC digits: 030585
    # ══════════════════════════════════════════════════════════════════
    d4 = seed_user(
        "diana.demo", "Demo1234!", "driver",
        "Diana Bundhoo", "+230 5745 6789",
        "5 Queen Victoria Avenue, Mahebourg"
    )
    if d4:
        register_nic("diana.demo", "B030585045678B", "Diana Bundhoo", "1985-05-03")
        save_offence(d4, "Dangerous Driving",
                     "Driving at excessive speed causing danger to public",
                     "Port Louis", "severe", 6, days_ago(30))
        save_offence(d4, "Drink Driving",
                     "Blood alcohol level above legal limit of 0.08%",
                     "Flacq", "severe", 8, days_ago(90))
        save_offence(d4, "Red Light Violation",
                     "Ran red light at busy intersection at speed",
                     "Curepipe", "moderate", 4, days_ago(150))
        save_offence(d4, "Speeding — School Zone",
                     "Exceeded 30 km/h school zone limit by 40 km/h",
                     "Quatre Bornes", "severe", 6, days_ago(220))
        save_offence(d4, "Mobile Phone Violation",
                     "Using phone while driving in heavy traffic",
                     "Rose Hill", "minor", 2, days_ago(290))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 5: Evan Bissessur — NEAR SUSPENSION (CRITICAL)
    # DOB: 17/09/1992 → NIC digits: 170992
    # ══════════════════════════════════════════════════════════════════
    d5 = seed_user(
        "evan.demo", "Demo1234!", "driver",
        "Evan Bissessur", "+230 5756 7890",
        "67 Sir Seewoosagur Ramgoolam Street, Beau Bassin"
    )
    if d5:
        register_nic("evan.demo", "B170992056789B", "Evan Bissessur", "1992-09-17")
        save_offence(d5, "Dangerous Driving",
                     "Weaving through traffic at high speed on motorway",
                     "Port Louis", "severe", 6, days_ago(20))
        save_offence(d5, "Speeding — Motorway",
                     "Exceeded 110 km/h motorway limit by 50 km/h",
                     "Mahebourg", "severe", 5, days_ago(55))
        save_offence(d5, "Failure to Stop for Police",
                     "Failed to stop when signalled by police officer",
                     "Curepipe", "severe", 6, days_ago(100))
        save_offence(d5, "Red Light Violation",
                     "Ran red light, near collision with pedestrian",
                     "Rose Hill", "moderate", 4, days_ago(160))
        save_offence(d5, "Illegal U-Turn",
                     "Performed illegal U-turn on dual carriageway",
                     "Quatre Bornes", "minor", 2, days_ago(210))
        save_offence(d5, "Speeding — Residential",
                     "Exceeded 60 km/h residential limit by 25 km/h",
                     "Flacq", "minor", 2, days_ago(260))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 6: Fatima Oozeer — IMPROVING (was high, now recovering)
    # DOB: 29/04/1993 → NIC digits: 290493
    # ══════════════════════════════════════════════════════════════════
    d6 = seed_user(
        "fatima.demo", "Demo1234!", "driver",
        "Fatima Oozeer", "+230 5767 8901",
        "12 Moka Road, Moka"
    )
    if d6:
        register_nic("fatima.demo", "O290493067890O", "Fatima Oozeer", "1993-04-29")
        # Old severe offences (expired) + recent clean period
        save_offence(d6, "Dangerous Driving",
                     "Driving dangerously in wet conditions",
                     "Port Louis", "severe", 6, days_ago(400), "expired")
        save_offence(d6, "Drink Driving",
                     "Breathalyser test failed at police checkpoint",
                     "Vacoas", "severe", 8, days_ago(365), "expired")
        save_offence(d6, "Speeding Violation",
                     "Exceeded limit by 20 km/h on main road",
                     "Curepipe", "minor", 2, days_ago(200))
        # Last 6 months clean — showing improvement

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 7: Kevin Leclezio — YOUNG DRIVER (occasional, medium risk)
    # DOB: 05/06/2001 → NIC digits: 050601
    # ══════════════════════════════════════════════════════════════════
    d7 = seed_user(
        "kevin.demo", "Demo1234!", "driver",
        "Kevin Leclezio", "+230 5778 9012",
        "45 Edith Cavell Street, Curepipe"
    )
    if d7:
        register_nic("kevin.demo", "L050601078901L", "Kevin Leclezio", "2001-06-05")
        save_offence(d7, "Speeding Violation",
                     "Exceeded speed limit by 25 km/h on motorway",
                     "Port Louis", "minor", 2, days_ago(60))
        save_offence(d7, "Failure to Wear Seatbelt",
                     "Driver and passenger not wearing seatbelts",
                     "Ebene", "minor", 1, days_ago(130))
        save_offence(d7, "Mobile Phone Violation",
                     "Using phone while driving, first offence",
                     "Rose Hill", "moderate", 3, days_ago(220))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 8: Priya Sookun — EXPERIENCED DRIVER (low risk, long history)
    # DOB: 11/01/1975 → NIC digits: 110175
    # ══════════════════════════════════════════════════════════════════
    d8 = seed_user(
        "priya.demo", "Demo1234!", "driver",
        "Priya Sookun", "+230 5789 0123",
        "78 Pope Hennessy Street, Port Louis"
    )
    if d8:
        register_nic("priya.demo", "S110175089012S", "Priya Sookun", "1975-01-11")
        save_offence(d8, "Parking Violation",
                     "Parked on double yellow lines in city centre",
                     "Port Louis", "minor", 1, days_ago(320))
        # Only 1 minor offence in 25 years of driving — excellent record

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 9: Marcus Ng — WORSENING TREND (escalating behaviour)
    # DOB: 14/08/1998 → NIC digits: 140898
    # ══════════════════════════════════════════════════════════════════
    d9 = seed_user(
        "marcus.demo", "Demo1234!", "driver",
        "Marcus Ng", "+230 5790 1234",
        "33 Sir William Newton Street, Port Louis"
    )
    if d9:
        register_nic("marcus.demo", "N140898090123N", "Marcus Ng", "1998-08-14")
        # Escalating pattern — offences getting more frequent and severe
        save_offence(d9, "Parking Violation",
                     "Parked in disabled bay without permit",
                     "Quatre Bornes", "minor", 1, days_ago(300))
        save_offence(d9, "Speeding Violation",
                     "Exceeded limit by 20 km/h on motorway",
                     "Port Louis", "minor", 2, days_ago(200))
        save_offence(d9, "Mobile Phone Violation",
                     "Using phone while driving in school zone",
                     "Curepipe", "moderate", 3, days_ago(120))
        save_offence(d9, "Speeding — School Zone",
                     "Exceeded school zone limit by 35 km/h",
                     "Rose Hill", "moderate", 4, days_ago(60))
        save_offence(d9, "Dangerous Driving",
                     "Aggressive overtaking causing danger",
                     "Mahebourg", "severe", 6, days_ago(15))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 10: Sandra Pillay — SUSPENDED (exceeded threshold)
    # DOB: 26/12/1982 → NIC digits: 261282
    # ══════════════════════════════════════════════════════════════════
    d10 = seed_user(
        "sandra.demo", "Demo1234!", "driver",
        "Sandra Pillay", "+230 5701 2345",
        "19 Bourbon Street, Flacq"
    )
    if d10:
        register_nic("sandra.demo", "P261282100234P", "Sandra Pillay", "1982-12-26")
        save_offence(d10, "Drink Driving",
                     "Blood alcohol level 3x above legal limit",
                     "Port Louis", "severe", 8, days_ago(25))
        save_offence(d10, "Dangerous Driving",
                     "Driving at 160 km/h in 60 km/h zone",
                     "Mahebourg", "severe", 6, days_ago(80))
        save_offence(d10, "Failure to Stop for Police",
                     "Led police on chase through residential area",
                     "Curepipe", "severe", 6, days_ago(140))
        save_offence(d10, "Red Light Violation",
                     "Ran 3 consecutive red lights",
                     "Rose Hill", "moderate", 4, days_ago(200))
        save_offence(d10, "Speeding — School Zone",
                     "Exceeded school zone limit by 50 km/h",
                     "Quatre Bornes", "severe", 6, days_ago(250))
        save_offence(d10, "Illegal Overtaking",
                     "Overtook on blind corner causing near head-on collision",
                     "Flacq", "moderate", 4, days_ago(300))

    # ── POLICE ─────────────────────────────────────────────────────────
    seed_user(
        "officer.demo", "Demo1234!", "police",
        "Officer Jean-Paul Labelle", "+230 5767 8901",
        "Port Louis Central Police Station"
    )

    # ── ADMIN ───────────────────────────────────────────────────────────
    seed_user(
        "admin.demo", "Demo1234!", "admin",
        "Admin Persovault", "+230 5778 9012",
        "PersoVault HQ, Ebene Cybercity"
    )

    print("\n" + "=" * 70)
    print("  Seeding complete! 10 drivers + 1 police + 1 admin")
    print("=" * 70)
    print("""
  All accounts — Password: Demo1234!
  ───────────────────────────────────────────────────────────────────
  USERNAME         FULL NAME              NIC              RISK
  ───────────────────────────────────────────────────────────────────
  alice.demo       Alice Fernandez        F150395012345F   CLEAN
  bob.demo         Bob Ramkhelawon        R220788023456R   LOW
  charlie.demo     Charlie Moorghen       M081190034567M   MEDIUM
  diana.demo       Diana Bundhoo          B030585045678B   HIGH
  evan.demo        Evan Bissessur         B170992056789B   CRITICAL
  fatima.demo      Fatima Oozeer          O290493067890O   IMPROVING
  kevin.demo       Kevin Leclezio         L050601078901L   MEDIUM
  priya.demo       Priya Sookun           S110175089012S   LOW
  marcus.demo      Marcus Ng              N140898090123N   WORSENING
  sandra.demo      Sandra Pillay          P261282100234P   SUSPENDED
  ───────────────────────────────────────────────────────────────────
  officer.demo     Officer Jean-Paul Labelle               Police
  admin.demo       Admin Persovault                        Admin
    """)


if __name__ == "__main__":
    seed()