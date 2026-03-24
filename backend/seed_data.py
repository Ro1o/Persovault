# backend/seed_data.py
#
# Pre-seeds the database with 25 fully detailed demo drivers.
# Each driver has:
#   - Full name, phone, address
#   - NIC number (valid Mauritius format: Letter+DDMMYY+6digits+Letter)
#   - Date of birth (matching NIC)
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
    print("  PersoVault — Database Seeder (25 Drivers + Full Details)")
    print("=" * 70)
    init_db()

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 1: Alice Fernandez — CLEAN RECORD
    # DOB: 15/03/1995 → NIC: F150395012345F
    # ══════════════════════════════════════════════════════════════════
    d1 = seed_user("alice.demo", "Demo1234!", "driver",
        "Alice Fernandez", "+230 5712 3456", "14 Labourdonnas Street, Port Louis")
    if d1:
        register_nic("alice.demo", "F150395012345F", "Alice Fernandez", "1995-03-15")

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 2: Bob Ramkhelawon — LOW RISK
    # DOB: 22/07/1988 → NIC: R220788023456R
    # ══════════════════════════════════════════════════════════════════
    d2 = seed_user("bob.demo", "Demo1234!", "driver",
        "Bob Ramkhelawon", "+230 5723 4567", "89 Royal Road, Quatre Bornes")
    if d2:
        register_nic("bob.demo", "R220788023456R", "Bob Ramkhelawon", "1988-07-22")
        save_offence(d2, "Speeding Violation", "Exceeded speed limit by 15 km/h on M1 motorway",
                     "Port Louis", "minor", 2, days_ago(145))
        save_offence(d2, "Parking Violation", "Parked in no-parking zone for over 2 hours",
                     "Curepipe", "minor", 1, days_ago(280))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 3: Charlie Moorghen — MEDIUM RISK
    # DOB: 08/11/1990 → NIC: M081190034567M
    # ══════════════════════════════════════════════════════════════════
    d3 = seed_user("charlie.demo", "Demo1234!", "driver",
        "Charlie Moorghen", "+230 5734 5678", "23 Vandermeersch Street, Rose Hill")
    if d3:
        register_nic("charlie.demo", "M081190034567M", "Charlie Moorghen", "1990-11-08")
        save_offence(d3, "Mobile Phone Violation", "Using mobile phone while driving on main road",
                     "Curepipe", "moderate", 3, days_ago(45))
        save_offence(d3, "Speeding — School Zone", "Exceeded speed limit by 30 km/h in school zone",
                     "Quatre Bornes", "moderate", 4, days_ago(120))
        save_offence(d3, "Failure to Stop", "Failed to stop at mandatory stop sign",
                     "Rose Hill", "minor", 2, days_ago(200))
        save_offence(d3, "Illegal Overtaking", "Overtook on a solid white line near bridge",
                     "Port Louis", "minor", 2, days_ago(310))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 4: Diana Bundhoo — HIGH RISK
    # DOB: 03/05/1985 → NIC: B030585045678B
    # ══════════════════════════════════════════════════════════════════
    d4 = seed_user("diana.demo", "Demo1234!", "driver",
        "Diana Bundhoo", "+230 5745 6789", "5 Queen Victoria Avenue, Mahebourg")
    if d4:
        register_nic("diana.demo", "B030585045678B", "Diana Bundhoo", "1985-05-03")
        save_offence(d4, "Dangerous Driving", "Driving at excessive speed causing danger to public",
                     "Port Louis", "severe", 6, days_ago(30))
        save_offence(d4, "Drink Driving", "Blood alcohol level above legal limit of 0.08%",
                     "Flacq", "severe", 8, days_ago(90))
        save_offence(d4, "Red Light Violation", "Ran red light at busy intersection at speed",
                     "Curepipe", "moderate", 4, days_ago(150))
        save_offence(d4, "Speeding — School Zone", "Exceeded 30 km/h school zone limit by 40 km/h",
                     "Quatre Bornes", "severe", 6, days_ago(220))
        save_offence(d4, "Mobile Phone Violation", "Using phone while driving in heavy traffic",
                     "Rose Hill", "minor", 2, days_ago(290))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 5: Evan Bissessur — CRITICAL (near suspension)
    # DOB: 17/09/1992 → NIC: B170992056789B
    # ══════════════════════════════════════════════════════════════════
    d5 = seed_user("evan.demo", "Demo1234!", "driver",
        "Evan Bissessur", "+230 5756 7890", "67 Sir Seewoosagur Ramgoolam Street, Beau Bassin")
    if d5:
        register_nic("evan.demo", "B170992056789B", "Evan Bissessur", "1992-09-17")
        save_offence(d5, "Dangerous Driving", "Weaving through traffic at high speed on motorway",
                     "Port Louis", "severe", 6, days_ago(20))
        save_offence(d5, "Speeding — Motorway", "Exceeded 110 km/h motorway limit by 50 km/h",
                     "Mahebourg", "severe", 5, days_ago(55))
        save_offence(d5, "Failure to Stop for Police", "Failed to stop when signalled by police officer",
                     "Curepipe", "severe", 6, days_ago(100))
        save_offence(d5, "Red Light Violation", "Ran red light, near collision with pedestrian",
                     "Rose Hill", "moderate", 4, days_ago(160))
        save_offence(d5, "Illegal U-Turn", "Performed illegal U-turn on dual carriageway",
                     "Quatre Bornes", "minor", 2, days_ago(210))
        save_offence(d5, "Speeding — Residential", "Exceeded 60 km/h residential limit by 25 km/h",
                     "Flacq", "minor", 2, days_ago(260))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 6: Fatima Oozeer — IMPROVING
    # DOB: 29/04/1993 → NIC: O290493067890O
    # ══════════════════════════════════════════════════════════════════
    d6 = seed_user("fatima.demo", "Demo1234!", "driver",
        "Fatima Oozeer", "+230 5767 8901", "12 Moka Road, Moka")
    if d6:
        register_nic("fatima.demo", "O290493067890O", "Fatima Oozeer", "1993-04-29")
        save_offence(d6, "Dangerous Driving", "Driving dangerously in wet conditions",
                     "Port Louis", "severe", 6, days_ago(400), "expired")
        save_offence(d6, "Drink Driving", "Breathalyser test failed at police checkpoint",
                     "Vacoas", "severe", 8, days_ago(365), "expired")
        save_offence(d6, "Speeding Violation", "Exceeded limit by 20 km/h on main road",
                     "Curepipe", "minor", 2, days_ago(200))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 7: Kevin Leclezio — MEDIUM RISK (young driver)
    # DOB: 05/06/2001 → NIC: L050601078901L
    # ══════════════════════════════════════════════════════════════════
    d7 = seed_user("kevin.demo", "Demo1234!", "driver",
        "Kevin Leclezio", "+230 5778 9012", "45 Edith Cavell Street, Curepipe")
    if d7:
        register_nic("kevin.demo", "L050601078901L", "Kevin Leclezio", "2001-06-05")
        save_offence(d7, "Speeding Violation", "Exceeded speed limit by 25 km/h on motorway",
                     "Port Louis", "minor", 2, days_ago(60))
        save_offence(d7, "Failure to Wear Seatbelt", "Driver and passenger not wearing seatbelts",
                     "Ebene", "minor", 1, days_ago(130))
        save_offence(d7, "Mobile Phone Violation", "Using phone while driving, first offence",
                     "Rose Hill", "moderate", 3, days_ago(220))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 8: Priya Sookun — LOW RISK (experienced driver)
    # DOB: 11/01/1975 → NIC: S110175089012S
    # ══════════════════════════════════════════════════════════════════
    d8 = seed_user("priya.demo", "Demo1234!", "driver",
        "Priya Sookun", "+230 5789 0123", "78 Pope Hennessy Street, Port Louis")
    if d8:
        register_nic("priya.demo", "S110175089012S", "Priya Sookun", "1975-01-11")
        save_offence(d8, "Parking Violation", "Parked on double yellow lines in city centre",
                     "Port Louis", "minor", 1, days_ago(320))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 9: Marcus Ng — WORSENING TREND
    # DOB: 14/08/1998 → NIC: N140898090123N
    # ══════════════════════════════════════════════════════════════════
    d9 = seed_user("marcus.demo", "Demo1234!", "driver",
        "Marcus Ng", "+230 5790 1234", "33 Sir William Newton Street, Port Louis")
    if d9:
        register_nic("marcus.demo", "N140898090123N", "Marcus Ng", "1998-08-14")
        save_offence(d9, "Parking Violation", "Parked in disabled bay without permit",
                     "Quatre Bornes", "minor", 1, days_ago(300))
        save_offence(d9, "Speeding Violation", "Exceeded limit by 20 km/h on motorway",
                     "Port Louis", "minor", 2, days_ago(200))
        save_offence(d9, "Mobile Phone Violation", "Using phone while driving in school zone",
                     "Curepipe", "moderate", 3, days_ago(120))
        save_offence(d9, "Speeding — School Zone", "Exceeded school zone limit by 35 km/h",
                     "Rose Hill", "moderate", 4, days_ago(60))
        save_offence(d9, "Dangerous Driving", "Aggressive overtaking causing danger",
                     "Mahebourg", "severe", 6, days_ago(15))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 10: Sandra Pillay — SUSPENDED
    # DOB: 26/12/1982 → NIC: P261282100234P
    # ══════════════════════════════════════════════════════════════════
    d10 = seed_user("sandra.demo", "Demo1234!", "driver",
        "Sandra Pillay", "+230 5701 2345", "19 Bourbon Street, Flacq")
    if d10:
        register_nic("sandra.demo", "P261282100234P", "Sandra Pillay", "1982-12-26")
        save_offence(d10, "Drink Driving", "Blood alcohol level 3x above legal limit",
                     "Port Louis", "severe", 8, days_ago(25))
        save_offence(d10, "Dangerous Driving", "Driving at 160 km/h in 60 km/h zone",
                     "Mahebourg", "severe", 6, days_ago(80))
        save_offence(d10, "Failure to Stop for Police", "Led police on chase through residential area",
                     "Curepipe", "severe", 6, days_ago(140))
        save_offence(d10, "Red Light Violation", "Ran 3 consecutive red lights",
                     "Rose Hill", "moderate", 4, days_ago(200))
        save_offence(d10, "Speeding — School Zone", "Exceeded school zone limit by 50 km/h",
                     "Quatre Bornes", "severe", 6, days_ago(250))
        save_offence(d10, "Illegal Overtaking", "Overtook on blind corner causing near head-on collision",
                     "Flacq", "moderate", 4, days_ago(300))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 11: Raj Gopaul — LOW RISK
    # DOB: 12/03/1991 → NIC: G120391110111G
    # ══════════════════════════════════════════════════════════════════
    d11 = seed_user("raj.demo", "Demo1234!", "driver",
        "Raj Gopaul", "+230 5702 3456", "56 Remy Ollier Street, Port Louis")
    if d11:
        register_nic("raj.demo", "G120391110111G", "Raj Gopaul", "1991-03-12")
        save_offence(d11, "Parking Violation", "Parked in restricted zone near market",
                     "Port Louis", "minor", 1, days_ago(190))
        save_offence(d11, "Speeding Violation", "Exceeded limit by 10 km/h on main road",
                     "Rose Hill", "minor", 2, days_ago(350))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 12: Nadia Currimjee — CLEAN RECORD
    # DOB: 05/08/1996 → NIC: C050896120122C
    # ══════════════════════════════════════════════════════════════════
    d12 = seed_user("nadia.demo", "Demo1234!", "driver",
        "Nadia Currimjee", "+230 5713 4567", "8 Desforges Street, Port Louis")
    if d12:
        register_nic("nadia.demo", "C050896120122C", "Nadia Currimjee", "1996-08-05")
        # No offences — perfect clean record

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 13: Vikram Poonith — MEDIUM RISK
    # DOB: 18/11/1987 → NIC: P181187130133P
    # ══════════════════════════════════════════════════════════════════
    d13 = seed_user("vikram.demo", "Demo1234!", "driver",
        "Vikram Poonith", "+230 5724 5678", "34 Labourdonnais Street, Mapou")
    if d13:
        register_nic("vikram.demo", "P181187130133P", "Vikram Poonith", "1987-11-18")
        save_offence(d13, "Speeding Violation", "Exceeded motorway limit by 20 km/h",
                     "Port Louis", "minor", 2, days_ago(80))
        save_offence(d13, "Mobile Phone Violation", "Using phone at traffic lights",
                     "Ebene", "moderate", 3, days_ago(160))
        save_offence(d13, "Illegal Parking", "Parked blocking fire hydrant access",
                     "Quatre Bornes", "minor", 1, days_ago(240))
        save_offence(d13, "Failure to Wear Seatbelt", "No seatbelt on dual carriageway",
                     "Mahebourg", "minor", 1, days_ago(320))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 14: Marie-Laure Rivalland — LOW RISK
    # DOB: 25/06/1994 → NIC: R250694140144R
    # ══════════════════════════════════════════════════════════════════
    d14 = seed_user("laure.demo", "Demo1234!", "driver",
        "Marie-Laure Rivalland", "+230 5735 6789", "12 Lislet Geoffroy Street, Curepipe")
    if d14:
        register_nic("laure.demo", "R250694140144R", "Marie-Laure Rivalland", "1994-06-25")
        save_offence(d14, "Parking Violation", "Parked on pavement obstructing pedestrians",
                     "Curepipe", "minor", 1, days_ago(210))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 15: Jean-Claude Malbrook — HIGH RISK
    # DOB: 09/02/1979 → NIC: M090279150155M
    # ══════════════════════════════════════════════════════════════════
    d15 = seed_user("jean.demo", "Demo1234!", "driver",
        "Jean-Claude Malbrook", "+230 5746 7890", "27 Nicolay Road, Port Louis")
    if d15:
        register_nic("jean.demo", "M090279150155M", "Jean-Claude Malbrook", "1979-02-09")
        save_offence(d15, "Drink Driving", "Failed breathalyser at police checkpoint",
                     "Port Louis", "severe", 8, days_ago(40))
        save_offence(d15, "Dangerous Driving", "Overtaking on double white lines at high speed",
                     "Flacq", "severe", 6, days_ago(110))
        save_offence(d15, "Speeding — School Zone", "Exceeded school zone limit by 45 km/h",
                     "Rose Hill", "moderate", 4, days_ago(180))
        save_offence(d15, "Red Light Violation", "Ran red light at busy junction",
                     "Vacoas", "moderate", 3, days_ago(250))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 16: Anita Bhunjun — CLEAN RECORD
    # DOB: 30/07/2000 → NIC: B300700160166B
    # ══════════════════════════════════════════════════════════════════
    d16 = seed_user("anita.demo", "Demo1234!", "driver",
        "Anita Bhunjun", "+230 5757 8901", "3 Anglican Church Street, Mahebourg")
    if d16:
        register_nic("anita.demo", "B300700160166B", "Anita Bhunjun", "2000-07-30")
        # No offences — clean record

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 17: Thierry Leung Shing — MEDIUM RISK
    # DOB: 14/04/1983 → NIC: L140483170177L
    # ══════════════════════════════════════════════════════════════════
    d17 = seed_user("thierry.demo", "Demo1234!", "driver",
        "Thierry Leung Shing", "+230 5768 9012", "19 Eugene Laurent Street, Rose Hill")
    if d17:
        register_nic("thierry.demo", "L140483170177L", "Thierry Leung Shing", "1983-04-14")
        save_offence(d17, "Speeding Violation", "Exceeded limit by 18 km/h near school",
                     "Rose Hill", "minor", 2, days_ago(95))
        save_offence(d17, "Illegal Overtaking", "Overtook on solid white line near junction",
                     "Port Louis", "moderate", 3, days_ago(175))
        save_offence(d17, "Failure to Wear Seatbelt", "Passenger not wearing seatbelt",
                     "Curepipe", "minor", 1, days_ago(260))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 18: Pooja Ramful — LOW RISK
    # DOB: 22/09/1997 → NIC: R220997180188R
    # ══════════════════════════════════════════════════════════════════
    d18 = seed_user("pooja.demo", "Demo1234!", "driver",
        "Pooja Ramful", "+230 5779 0123", "44 Julius Nyerere Avenue, Rose Hill")
    if d18:
        register_nic("pooja.demo", "R220997180188R", "Pooja Ramful", "1997-09-22")
        save_offence(d18, "Parking Violation", "Parked in loading zone during business hours",
                     "Port Louis", "minor", 1, days_ago(175))
        save_offence(d18, "Speeding Violation", "Exceeded residential limit by 12 km/h",
                     "Quatre Bornes", "minor", 2, days_ago(310))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 19: Olivier Ribot — WORSENING TREND
    # DOB: 03/12/1975 → NIC: R031275190199R
    # ══════════════════════════════════════════════════════════════════
    d19 = seed_user("olivier.demo", "Demo1234!", "driver",
        "Olivier Ribot", "+230 5780 1234", "88 Swami Sivananda Avenue, Quatre Bornes")
    if d19:
        register_nic("olivier.demo", "R031275190199R", "Olivier Ribot", "1975-12-03")
        save_offence(d19, "Parking Violation", "Parked blocking driveway",
                     "Quatre Bornes", "minor", 1, days_ago(280))
        save_offence(d19, "Speeding Violation", "Exceeded limit by 15 km/h on motorway",
                     "Port Louis", "minor", 2, days_ago(190))
        save_offence(d19, "Mobile Phone Violation", "Using phone while driving on main road",
                     "Ebene", "moderate", 3, days_ago(110))
        save_offence(d19, "Speeding — School Zone", "Exceeded school zone limit by 30 km/h",
                     "Vacoas", "moderate", 4, days_ago(45))
        save_offence(d19, "Dangerous Driving", "Tailgating at high speed on motorway",
                     "Port Louis", "severe", 6, days_ago(10))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 20: Yasmine Sulliman — CLEAN RECORD
    # DOB: 17/05/2002 → NIC: S170502200200S
    # ══════════════════════════════════════════════════════════════════
    d20 = seed_user("yasmine.demo", "Demo1234!", "driver",
        "Yasmine Sulliman", "+230 5791 2345", "6 Archibald Street, Vacoas")
    if d20:
        register_nic("yasmine.demo", "S170502200200S", "Yasmine Sulliman", "2002-05-17")
        # No offences — clean record

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 21: Kiran Beetul — MEDIUM RISK
    # DOB: 28/10/1989 → NIC: B281089210211B
    # ══════════════════════════════════════════════════════════════════
    d21 = seed_user("kiran.demo", "Demo1234!", "driver",
        "Kiran Beetul", "+230 5702 3456", "15 Dr Edgar Laurent Street, Moka")
    if d21:
        register_nic("kiran.demo", "B281089210211B", "Kiran Beetul", "1989-10-28")
        save_offence(d21, "Mobile Phone Violation", "Using phone while driving near school",
                     "Moka", "moderate", 3, days_ago(70))
        save_offence(d21, "Speeding Violation", "Exceeded limit by 22 km/h on main road",
                     "Curepipe", "minor", 2, days_ago(150))
        save_offence(d21, "Illegal Parking", "Parked in no-stopping zone",
                     "Port Louis", "minor", 1, days_ago(230))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 22: Chloé Descroizilles — LOW RISK
    # DOB: 11/01/1998 → NIC: D110198220222D
    # ══════════════════════════════════════════════════════════════════
    d22 = seed_user("chloe.demo", "Demo1234!", "driver",
        "Chloé Descroizilles", "+230 5713 4567", "22 Chaussée Street, Port Louis")
    if d22:
        register_nic("chloe.demo", "D110198220222D", "Chloé Descroizilles", "1998-01-11")
        save_offence(d22, "Speeding Violation", "Exceeded residential limit by 8 km/h",
                     "Floreal", "minor", 1, days_ago(240))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 23: Rohit Seechurn — HIGH RISK
    # DOB: 06/07/1984 → NIC: S060784230233S
    # ══════════════════════════════════════════════════════════════════
    d23 = seed_user("rohit.demo", "Demo1234!", "driver",
        "Rohit Seechurn", "+230 5724 5678", "39 Farquhar Street, Port Louis")
    if d23:
        register_nic("rohit.demo", "S060784230233S", "Rohit Seechurn", "1984-07-06")
        save_offence(d23, "Dangerous Driving", "Racing on public road causing danger",
                     "Port Louis", "severe", 6, days_ago(35))
        save_offence(d23, "Drink Driving", "Blood alcohol above legal limit at checkpoint",
                     "Mahebourg", "severe", 8, days_ago(95))
        save_offence(d23, "Red Light Violation", "Ran red light at main junction",
                     "Curepipe", "moderate", 4, days_ago(165))
        save_offence(d23, "Speeding — Motorway", "Exceeded 110 km/h limit by 40 km/h",
                     "Port Louis", "moderate", 3, days_ago(240))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 24: Aurélie Grondin — SUSPENDED
    # DOB: 19/03/1993 → NIC: G190393240244G
    # ══════════════════════════════════════════════════════════════════
    d24 = seed_user("aurelie.demo", "Demo1234!", "driver",
        "Aurélie Grondin", "+230 5735 6789", "7 Monseigneur Gonin Street, Port Louis")
    if d24:
        register_nic("aurelie.demo", "G190393240244G", "Aurélie Grondin", "1993-03-19")
        save_offence(d24, "Drink Driving", "Blood alcohol 2x above legal limit",
                     "Vacoas", "severe", 8, days_ago(30))
        save_offence(d24, "Dangerous Driving", "Driving against traffic on dual carriageway",
                     "Port Louis", "severe", 6, days_ago(85))
        save_offence(d24, "Failure to Stop for Police", "Failed to stop at police checkpoint",
                     "Rose Hill", "severe", 6, days_ago(145))
        save_offence(d24, "Red Light Violation", "Ran red light causing near accident",
                     "Quatre Bornes", "moderate", 4, days_ago(210))
        save_offence(d24, "Speeding — School Zone", "Exceeded school limit by 45 km/h",
                     "Curepipe", "severe", 6, days_ago(270))

    # ══════════════════════════════════════════════════════════════════
    # DRIVER 25: Deven Mahadoo — MEDIUM RISK (young driver)
    # DOB: 08/11/2001 → NIC: M081101250255M
    # ══════════════════════════════════════════════════════════════════
    d25 = seed_user("deven.demo", "Demo1234!", "driver",
        "Deven Mahadoo", "+230 5746 7890", "51 Ollier Street, Beau Bassin")
    if d25:
        register_nic("deven.demo", "M081101250255M", "Deven Mahadoo", "2001-11-08")
        save_offence(d25, "Speeding Violation", "Exceeded limit by 20 km/h on motorway",
                     "Port Louis", "minor", 2, days_ago(55))
        save_offence(d25, "Failure to Wear Seatbelt", "Driver not wearing seatbelt on motorway",
                     "Mahebourg", "minor", 1, days_ago(120))
        save_offence(d25, "Mobile Phone Violation", "Using phone while driving, second offence",
                     "Ebene", "moderate", 3, days_ago(185))
        save_offence(d25, "Illegal Parking", "Parked in disabled bay without permit",
                     "Quatre Bornes", "minor", 1, days_ago(250))

    # ── POLICE ─────────────────────────────────────────────────────────
    seed_user("officer.demo", "Demo1234!", "police",
        "Officer Jean-Paul Labelle", "+230 5767 8901", "Port Louis Central Police Station")

    # ── ADMIN ───────────────────────────────────────────────────────────
    seed_user("admin.demo", "Demo1234!", "admin",
        "Admin Persovault", "+230 5778 9012", "PersoVault HQ, Ebene Cybercity")

    print("\n" + "=" * 70)
    print("  Seeding complete! 25 drivers + 1 police + 1 admin")
    print("=" * 70)
    print("""
  All accounts — Password: Demo1234!
  ────────────────────────────────────────────────────────────────────────
  USERNAME         FULL NAME                  NIC              RISK
  ────────────────────────────────────────────────────────────────────────
  alice.demo       Alice Fernandez            F150395012345F   CLEAN
  bob.demo         Bob Ramkhelawon            R220788023456R   LOW
  charlie.demo     Charlie Moorghen           M081190034567M   MEDIUM
  diana.demo       Diana Bundhoo              B030585045678B   HIGH
  evan.demo        Evan Bissessur             B170992056789B   CRITICAL
  fatima.demo      Fatima Oozeer              O290493067890O   IMPROVING
  kevin.demo       Kevin Leclezio             L050601078901L   MEDIUM
  priya.demo       Priya Sookun               S110175089012S   LOW
  marcus.demo      Marcus Ng                  N140898090123N   WORSENING
  sandra.demo      Sandra Pillay              P261282100234P   SUSPENDED
  raj.demo         Raj Gopaul                 G120391110111G   LOW
  nadia.demo       Nadia Currimjee            C050896120122C   CLEAN
  vikram.demo      Vikram Poonith             P181187130133P   MEDIUM
  laure.demo       Marie-Laure Rivalland      R250694140144R   LOW
  jean.demo        Jean-Claude Malbrook       M090279150155M   HIGH
  anita.demo       Anita Bhunjun              B300700160166B   CLEAN
  thierry.demo     Thierry Leung Shing        L140483170177L   MEDIUM
  pooja.demo       Pooja Ramful               R220997180188R   LOW
  olivier.demo     Olivier Ribot              R031275190199R   WORSENING
  yasmine.demo     Yasmine Sulliman           S170502200200S   CLEAN
  kiran.demo       Kiran Beetul               B281089210211B   MEDIUM
  chloe.demo       Chloé Descroizilles        D110198220222D   LOW
  rohit.demo       Rohit Seechurn             S060784230233S   HIGH
  aurelie.demo     Aurélie Grondin            G190393240244G   SUSPENDED
  deven.demo       Deven Mahadoo              M081101250255M   MEDIUM
  ────────────────────────────────────────────────────────────────────────
  officer.demo     Officer Jean-Paul Labelle                   Police
  admin.demo       Admin Persovault                            Admin
    """)


if __name__ == "__main__":
    seed()