import sqlite3

conn = sqlite3.connect("passport_db.sqlite")

u = conn.execute("SELECT driver_id FROM users WHERE username='evan.demo'").fetchone()
if u:
    driver_id = u[0]
    o = conn.execute("SELECT COUNT(*) FROM offences WHERE driver_id=?", (driver_id,)).fetchone()
    print(f"Evan driver_id : {driver_id}")
    print(f"Evan offences  : {o[0]}")
else:
    print("evan.demo not found in users table")

print()
print("All users and their offence counts:")
rows = conn.execute("""
    SELECT u.username, u.driver_id, COUNT(o.id) as offence_count
    FROM users u
    LEFT JOIN offences o ON u.driver_id = o.driver_id
    WHERE u.role = 'driver'
    GROUP BY u.username
    ORDER BY offence_count DESC
""").fetchall()
for r in rows:
    print(f"  {r[0]:20} | {r[1]:20} | {r[2]} offences")

conn.close()