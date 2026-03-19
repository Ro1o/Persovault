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
from database import init_db, create_user, get_user, save_driver_behaviour, verify_password


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

    create_user(user)

    return {"message": "Account created successfully"}


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
        "message": "Login successful",
        "username": db_user["username"],
        "role": db_user["role"]
    }


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
    """
    Generates a passport and returns it as a QR code image.
    This ensures the JSON is never modified by copy-paste.
    """
    import qrcode

    # Generate passport
    passport = generate_passport(driver, verification_mode)

    # Serialize to JSON string — exact same string that will be verified
    passport_json = json_lib.dumps(passport, separators=(',', ':'))

    # Generate QR code
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(passport_json)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Return as PNG image
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

        # Parse JSON — handle double-encoded strings
        try:
            passport = json_lib.loads(raw_str)
            if isinstance(passport, str):
                passport = json_lib.loads(passport)
        except Exception:
            return {"verification_result": "TAMPERED", "reason": "Invalid JSON"}

        is_valid, reason = verify_passport(passport)

        if is_valid:
            return {"verification_result": "VALID", "reason": reason}
        else:
            return {"verification_result": "TAMPERED", "reason": reason}

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
            driver_id="DRV001",
            current_points=6,
            previous_points=4,
            offences_last_12m=3,
            minor_offences=1,
            moderate_offences=1,
            severe_offences=1,
            days_since_last_offence=45,
            avg_days_between_offences=120,
            years_since_licence_issue=8,
            last_sync="2026-03-17"
        ),

        Driver(
            driver_id="DRV002",
            current_points=2,
            previous_points=1,
            offences_last_12m=1,
            minor_offences=1,
            moderate_offences=0,
            severe_offences=0,
            days_since_last_offence=200,
            avg_days_between_offences=300,
            years_since_licence_issue=10,
            last_sync="2026-03-17"
        ),

        Driver(
            driver_id="DRV003",
            current_points=10,
            previous_points=8,
            offences_last_12m=5,
            minor_offences=2,
            moderate_offences=2,
            severe_offences=1,
            days_since_last_offence=20,
            avg_days_between_offences=50,
            years_since_licence_issue=4,
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

    return {
        "feature_importance": features
    }