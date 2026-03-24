from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json as json_lib
import io

from models.driver import Driver

from services.validation_engine import validate_driver
from services.stability_index import compute_stability
from services.trend_analysis import calculate_trend
from services.trust_manager import compute_trust
from services.proximity import compute_proximity
from services.risk_classifier import classify_risk
from services.passport_generator import generate_passport
from services.behaviour_score import compute_behaviour_score
from services.feature_importance import get_feature_importance

from utils.signature import verify_passport

from services.analytics_engine import (
    risk_distribution,
    offence_distribution,
    average_behaviour_score
)

# Database
from database import (
    init_db, create_user, get_user, save_driver_behaviour, verify_password,
    save_nic_record, get_nic_record, nic_exists, get_all_nic_records,
    log_audit, get_audit_log,
    get_profile, update_password, hash_password,
    save_offence, get_offences_by_driver, get_driver_stats,
    get_admin_stats, get_all_drivers,
)

# NIC Security
from nic_security import (
    validate_nic_full, sign_nic,
    check_rate_limit, record_failed_attempt
)


app = FastAPI()

# Initialize SQLite database
init_db()


# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post("/signup")
def signup(user: dict):

    existing = get_user(user["username"])

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    driver_id = create_user(user)

    return {
        "message":   "Account created successfully",
        "username":  user["username"],
        "role":      user["role"],
        "driver_id": driver_id,
    }


@app.post("/login")
def login(user: dict):

    db_user = get_user(user["username"])

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user["password"], db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    if db_user["role"] != user["role"]:
        raise HTTPException(status_code=403, detail="Invalid role")

    return {
        "message":   "Login successful",
        "username":  db_user["username"],
        "role":      db_user["role"],
        "full_name": db_user["full_name"],
        "driver_id": db_user["driver_id"],
    }


# ============================================================
# PROFILE
# ============================================================

@app.get("/profile/{username}")
def get_user_profile(username: str):
    """
    Returns full profile data for the logged-in user.
    Reads all fields stored at signup: full_name, phone, address, driver_id.
    """
    profile = get_profile(username)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile


@app.post("/change-password")
def change_password(data: dict):
    """
    Changes a user's password.

    Body: { username, current_password, new_password }

    Flow:
    1. Load user from DB
    2. Verify current_password against stored bcrypt hash
    3. Hash new_password
    4. Save new hash to DB
    """
    username         = data.get("username")
    current_password = data.get("current_password")
    new_password     = data.get("new_password")

    if not username or not current_password or not new_password:
        raise HTTPException(status_code=400, detail="username, current_password and new_password are required")

    db_user = get_user(username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(current_password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    new_hashed = hash_password(new_password)
    update_password(username, new_hashed)

    return {"message": "Password changed successfully"}


# ============================================================
# OFFENCES — BEHAVIOUR HISTORY
# ============================================================

@app.post("/offence")
def add_offence(data: dict):
    """
    Records a new offence for a driver.
    Called by police when issuing a violation.

    Body:
    {
        driver_id:    "DRV-2026-XXXXXX",
        title:        "Speeding Violation",
        description:  "Exceeded speed limit by 20km/h",
        location:     "Port Louis",
        severity:     "minor" | "moderate" | "severe",
        points:       2,
        offence_date: "2026-03-24",
        status:       "active"   (optional, defaults to active)
    }
    """
    driver_id    = data.get("driver_id")
    title        = data.get("title")
    description  = data.get("description", "")
    location     = data.get("location", "")
    severity     = data.get("severity", "minor")
    points       = data.get("points", 1)
    offence_date = data.get("offence_date")
    status       = data.get("status", "active")

    if not driver_id or not title or not offence_date:
        raise HTTPException(status_code=400, detail="driver_id, title and offence_date are required")

    save_offence(driver_id, title, description, location, severity, points, offence_date, status)
    return {"message": "Offence recorded successfully"}


@app.get("/offences/{driver_id}")
def list_offences(driver_id: str):
    """Returns all offences for a driver ordered by date descending."""
    offences = get_offences_by_driver(driver_id)
    return {"offences": offences}


@app.get("/driver-stats/{driver_id}")
def driver_stats(driver_id: str):
    """
    Returns behaviour summary stats:
    - total_points, clean_days, active_count, total_count
    """
    stats = get_driver_stats(driver_id)
    return stats


# ============================================================
# NIC SECURITY — 7-LAYER FRAUD DETECTION
# ============================================================

@app.post("/register-nic")
async def register_nic(request: Request, data: dict):
    """
    Registers a NIC with full 7-layer security validation.
    
    Flow:
    1. Rate limit check — block brute force attempts
    2. Run all 7 security layers via validate_nic_full()
    3. If fraud score > 50, reject registration
    4. Generate CA digital signature
    5. Store NIC + signature in database
    6. Log everything in audit trail
    """
    ip = request.client.host
    username   = data.get("username")
    nic        = data.get("nic_number", "").upper().strip()
    full_name  = data.get("full_name", "")
    dob        = data.get("date_of_birth", "")

    # ── Rate Limiting ─────────────────────────────────────────
    rate_ok, rate_msg = check_rate_limit(ip)
    if not rate_ok:
        log_audit("RATE_LIMIT_BLOCKED", username, nic, ip, "BLOCKED", rate_msg)
        raise HTTPException(status_code=429, detail=rate_msg)

    # ── Duplicate Check ────────────────────────────────────────
    is_duplicate = nic_exists(nic)

    # ── Run All 7 Security Layers ─────────────────────────────
    result = validate_nic_full(
        nic=nic,
        full_name=full_name,
        date_of_birth=dob,
        stored_signature=None,
        station=None,
        is_duplicate=is_duplicate,
        ip_address=ip,
    )

    fraud_score = result["fraud_score"]
    fraud_level = result["fraud_level"]

    # ── Block Fraudulent NICs ─────────────────────────────────
    if fraud_level == "FRAUDULENT":
        record_failed_attempt(ip)
        log_audit("REGISTRATION_BLOCKED", username, nic, ip, "FRAUDULENT",
                  result["fraud_summary"])
        raise HTTPException(
            status_code=400,
            detail={
                "message": "NIC registration failed — fraud detected",
                "fraud_score": fraud_score,
                "fraud_level": fraud_level,
                "details": result["layers"],
            }
        )

    # ── Generate CA Digital Signature ────────────────────────
    ca_signature = sign_nic(nic, full_name, dob)

    # ── Store NIC Record ──────────────────────────────────────
    try:
        save_nic_record(username, nic, full_name, dob, ca_signature, fraud_score, fraud_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"NIC already registered: {str(e)}")

    # ── Log Success ───────────────────────────────────────────
    log_audit("REGISTRATION_SUCCESS", username, nic, ip, fraud_level,
              f"Score: {fraud_score}/100 — {result['fraud_summary']}")

    return {
        "message": "NIC registered successfully",
        "fraud_score": fraud_score,
        "fraud_level": fraud_level,
        "ca_signature": ca_signature[:16] + "...",
        "security_layers": result["layers"],
    }


@app.get("/verify-nic/{username}")
async def verify_nic(username: str, request: Request, station: str = None):
    """
    Verifies a driver's NIC integrity from their Identity Wallet.
    """
    ip = request.client.host

    record = get_nic_record(username)
    if not record:
        raise HTTPException(status_code=404, detail="No NIC record found for this user")

    result = validate_nic_full(
        nic=record["nic_number"],
        full_name=record["full_name"],
        date_of_birth=record["date_of_birth"],
        stored_signature=record["ca_signature"],
        station=station,
        is_duplicate=False,
        ip_address=ip,
    )

    action = "SIGNATURE_VERIFIED" if result["layers"]["signature"]["valid"] else "SIGNATURE_FAILED"
    log_audit(action, username, record["nic_number"], ip,
              result["fraud_level"], result["fraud_summary"])

    return {
        "nic_number":      record["nic_number"],
        "full_name":       record["full_name"],
        "fraud_score":     result["fraud_score"],
        "fraud_level":     result["fraud_level"],
        "fraud_summary":   result["fraud_summary"],
        "registered_at":   record["registered_at"],
        "security_layers": result["layers"],
    }


@app.get("/admin/stats")
def admin_stats():
    """Returns real system-wide stats for the Admin Dashboard."""
    return get_admin_stats()


@app.get("/admin/users")
def admin_users():
    """Returns all driver accounts with real penalty points and risk levels."""
    return {"drivers": get_all_drivers()}


@app.get("/admin/nic-monitor")
def nic_monitor():
    return {"nic_records": get_all_nic_records()}

@app.get("/admin/audit-log")
def audit_log(username: str = None, limit: int = 50):
    return {"audit_log": get_audit_log(username, limit)}


# ============================================================
# DRIVER VALIDATION
# ============================================================

@app.post("/validate-driver")
def validate(
    driver: Driver,
    verification_mode: str = Query("ONLINE", enum=["ONLINE", "OFFLINE"])
):
    passport = generate_passport(driver, verification_mode)
    return passport


# ============================================================
# QR CODE GENERATION
# ============================================================

@app.post("/generate-qr")
def generate_qr(
    driver: Driver,
    verification_mode: str = Query("ONLINE", enum=["ONLINE", "OFFLINE"])
):
    import qrcode

    passport = generate_passport(driver, verification_mode)
    passport_json = json_lib.dumps(passport, separators=(',', ':'))

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(passport_json)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


# ============================================================
# PASSPORT VERIFICATION
# ============================================================

@app.post("/verify-passport")
async def verify(request: Request):

    try:
        raw_body = await request.body()
        raw_str = raw_body.decode("utf-8").strip()

        try:
            passport = json_lib.loads(raw_str)
            if isinstance(passport, str):
                passport = json_lib.loads(passport)
        except Exception:
            return {"verification_result": "TAMPERED", "reason": "Invalid JSON"}

        is_valid, reason = verify_passport(passport)

        if is_valid:
            return {
                "verification_result": "VALID",
                "reason": reason,
                "passport": passport,
            }
        else:
            return {
                "verification_result": "TAMPERED",
                "reason": reason,
                "passport": passport,
            }

    except Exception as e:
        return {"verification_result": "TAMPERED", "reason": str(e)}


# ============================================================
# AI RISK PREDICTION
# ============================================================

@app.post("/predict-risk")
def predict_risk(driver: Driver):

    stability = compute_stability(driver)
    trend = calculate_trend(driver)
    proximity = compute_proximity(driver)

    risk_result = classify_risk(stability, proximity, trend)

    risk_score = risk_result["risk_score"]
    risk_level = risk_result["risk_level"]

    behaviour_score = round(100 - (risk_score * 100))

    try:
        features = {
            "current_points":            driver.current_points,
            "offences_last_12m":         driver.offences_last_12m,
            "minor_offences":            driver.minor_offences,
            "moderate_offences":         driver.moderate_offences,
            "severe_offences":           driver.severe_offences,
            "days_since_last_offence":   driver.days_since_last_offence,
            "avg_days_between_offences": driver.avg_days_between_offences,
            "years_since_licence_issue": driver.years_since_licence_issue,
            "suspension_proximity":      proximity,
            "stability_index":           stability,
            "trend_encoded":             1 if trend == "WORSENING" else (-1 if trend == "IMPROVING" else 0),
        }

        label = 1 if risk_level == "HIGH" else 0

        save_driver_behaviour(driver.driver_id, features, label)

    except Exception as e:
        print(f"⚠️  Could not save driver behaviour: {e}")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "behaviour_score": behaviour_score,
        "trend": trend
    }


# ============================================================
# SYSTEM ANALYTICS
# ============================================================

@app.get("/analytics")
def analytics():

    drivers = [
        Driver(
            driver_id="DRV001", current_points=6, previous_points=4,
            offences_last_12m=3, minor_offences=1, moderate_offences=1,
            severe_offences=1, days_since_last_offence=45,
            avg_days_between_offences=120, years_since_licence_issue=8,
            last_sync="2026-03-17"
        ),
        Driver(
            driver_id="DRV002", current_points=2, previous_points=1,
            offences_last_12m=1, minor_offences=1, moderate_offences=0,
            severe_offences=0, days_since_last_offence=200,
            avg_days_between_offences=300, years_since_licence_issue=10,
            last_sync="2026-03-17"
        ),
        Driver(
            driver_id="DRV003", current_points=10, previous_points=8,
            offences_last_12m=5, minor_offences=2, moderate_offences=2,
            severe_offences=1, days_since_last_offence=20,
            avg_days_between_offences=50, years_since_licence_issue=4,
            last_sync="2026-03-17"
        )
    ]

    return {
        "risk_distribution": risk_distribution(drivers),
        "offence_distribution": offence_distribution(drivers),
        "average_behaviour_score": average_behaviour_score(drivers)
    }


# ============================================================
# EXPLAINABLE AI
# ============================================================

@app.get("/feature-importance")
def feature_importance():
    features = get_feature_importance()
    return {"feature_importance": features}