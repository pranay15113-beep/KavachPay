import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from ..schemas import LoginRequest, LoginResponse, StepUpVerifyRequest, StepUpVerifyResponse
from ..services.behavioral_auth import BehavioralAuthService

router = APIRouter(prefix="/api/auth", tags=["Behavioral Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
    user = cursor.fetchone()
    if not user:
        cursor.execute("SELECT * FROM users LIMIT 1")
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not initialized")

    eval_result = BehavioralAuthService.evaluate_behavior(
        keystrokes=request.keystrokes,
        simulate_bot=request.simulate_bot,
        simulate_suspicious_ip=request.simulate_suspicious_ip,
        device_info=request.device_info
    )

    trust_score = eval_result["trust_score"]
    requires_step_up = eval_result["requires_step_up"]

    session_token = None
    if not requires_step_up:
        session_token = f"sess_trusted_{user['username']}_{int(trust_score)}"

    message = (
        "High-trust behavioral fingerprint verified." 
        if not requires_step_up 
        else "Anomalous behavioral cadence flagged. Step-up security challenge required."
    )

    return LoginResponse(
        success=not requires_step_up,
        requires_step_up=requires_step_up,
        user={
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "upi_id": user["upi_id"],
            "balance": user["balance"],
            "phone": user["phone"]
        },
        trust_score=trust_score,
        risk_factors=eval_result["risk_factors"],
        behavioral_metrics=eval_result["behavioral_metrics"],
        session_token=session_token,
        message=message
    )

@router.post("/step-up-verify", response_model=StepUpVerifyResponse)
def step_up_verify(request: StepUpVerifyRequest, conn: sqlite3.Connection = Depends(get_db)):
    if len(request.otp_code.strip()) == 6:
        return StepUpVerifyResponse(
            success=True,
            trust_score=97,
            message="Two-Factor Out-Of-Band Authentication Verified. Step-up authorization granted.",
            session_token=f"sess_elevated_{request.username}_97"
        )
    raise HTTPException(status_code=400, detail="Invalid OTP code. Enter any 6-digit code for demonstration.")

@router.get("/profile")
def get_profile(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users LIMIT 1")
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not initialized")
    return {
        "id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "upi_id": user["upi_id"],
        "balance": user["balance"],
        "phone": user["phone"],
        "baseline_wpm": user["baseline_wpm"],
        "baseline_dwell_time": user["baseline_dwell_time"],
        "baseline_flight_time": user["baseline_flight_time"]
    }
