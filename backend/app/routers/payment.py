import json
import sqlite3
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from ..schemas import (
    PaymentRiskCheckRequest,
    PaymentRiskCheckResponse,
    PaymentExecuteRequest,
    PaymentExecuteResponse
)
from ..services.fraud_engine import FraudEngine
from ..services.gemini_service import GeminiService

router = APIRouter(prefix="/api/payment", tags=["Pre-Transaction Fraud Interceptor"])

@router.get("/presets")
def get_payment_presets():
    return [
        {
            "id": "preset_refund_phish",
            "name": "Electricity Bill Refund Scam",
            "vpa": "refund-support@okaxis",
            "amount": 12.0,
            "type": "PAY",
            "note": "Electricity Overpayment Refund Verification Fee",
            "expected_tier": "RED",
            "description": "Scammer urges victim to pay ₹12 'service fee' to claim ₹3,500 electricity refund, stealing credentials."
        },
        {
            "id": "preset_collect_trap",
            "name": "Cashback 'Collect Request' Trap",
            "vpa": "paytm.cashback.winner@paytm",
            "amount": 15000.0,
            "type": "COLLECT_REQUEST",
            "note": "Claim ₹15,000 Scratch Card Cashback - Enter UPI PIN",
            "expected_tier": "RED",
            "description": "Disguised collect request claiming user won ₹15,000. Authorizing debits ₹15,000 instantly!"
        },
        {
            "id": "preset_digital_arrest",
            "name": "Digital Arrest / Fake Warrant Bail",
            "vpa": "police.cybercrime.notice@sbi",
            "amount": 45000.0,
            "type": "PAY",
            "note": "Immediate Bail Release Penalty - Case #CY492",
            "expected_tier": "RED",
            "description": "High-value extortion payment demanding funds to avert fake police/customs arrest."
        },
        {
            "id": "preset_olx_army",
            "name": "OLX Army Officer Advance Deposit",
            "vpa": "indianarmy.canteen.orders@okicici",
            "amount": 8500.0,
            "type": "PAY",
            "note": "Army Canteen Sofa Booking Deposit",
            "expected_tier": "AMBER",
            "description": "Impersonates armed forces officer selling used car/furniture, asking deposit."
        },
        {
            "id": "preset_genuine_grocery",
            "name": "Genuine Kirana / Supermarket",
            "vpa": "rahul.kirana@ybl",
            "amount": 650.0,
            "type": "PAY",
            "note": "Rice and daily provisions",
            "expected_tier": "SAFE",
            "description": "Standard daily peer-to-merchant payment with clean reputational history."
        }
    ]

@router.post("/check-risk", response_model=PaymentRiskCheckResponse)
def check_payment_risk(request: PaymentRiskCheckRequest, conn: sqlite3.Connection = Depends(get_db)):
    result = FraudEngine.evaluate_transaction(
        conn=conn,
        sender_upi=request.sender_upi,
        receiver_vpa=request.receiver_vpa,
        amount=request.amount,
        transaction_type=request.transaction_type,
        note=request.note or ""
    )

    # Enrich with Gemini / Heuristic context
    gemini_insight = GeminiService.analyze_vpa_context(
        vpa=request.receiver_vpa,
        amount=request.amount,
        note=request.note or "",
        signals=[s.dict() for s in result["signals"]]
    )
    result["gemini_insights"] = gemini_insight

    return PaymentRiskCheckResponse(**result)

@router.post("/execute", response_model=PaymentExecuteResponse)
def execute_payment(request: PaymentExecuteRequest, conn: sqlite3.Connection = Depends(get_db)):
    # Re-evaluate risk
    risk_eval = FraudEngine.evaluate_transaction(
        conn=conn,
        sender_upi=request.sender_upi,
        receiver_vpa=request.receiver_vpa,
        amount=request.amount,
        transaction_type=request.transaction_type,
        note=request.note or ""
    )

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users LIMIT 1")
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    risk_score = risk_eval["risk_score"]
    risk_tier = risk_eval["risk_tier"]
    signals_json = json.dumps([s.dict() for s in risk_eval["signals"]])

    # If Red Tier (Score >= 70): Hard Block
    if risk_tier == "RED":
        # Log blocked transaction
        cursor.execute("""
        INSERT INTO transactions (sender_upi, receiver_vpa, amount, transaction_type, note, risk_score, risk_tier, action_taken, flags_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'BLOCKED', ?, ?)
        """, (
            request.sender_upi,
            request.receiver_vpa,
            request.amount,
            request.transaction_type,
            request.note or "",
            risk_score,
            risk_tier,
            signals_json,
            datetime.utcnow().isoformat()
        ))
        conn.commit()

        return PaymentExecuteResponse(
            success=False,
            transaction_id=f"TXN-BLOCKED-{int(datetime.utcnow().timestamp())}",
            status="BLOCKED",
            risk_score=risk_score,
            message="KavachPay Interceptor blocked this transaction. High likelihood of fraudulent diversion.",
            new_balance=user["balance"],
            timestamp=datetime.utcnow().isoformat()
        )

    # If Amber Tier (30 - 70): Requires explicit risk acknowledgment
    if risk_tier == "AMBER" and not request.user_acknowledged_risk and not request.override_cooling_off:
        return PaymentExecuteResponse(
            success=False,
            transaction_id="",
            status="COOLING_OFF_ACTIVE",
            risk_score=risk_score,
            message="Cooling-off safety window active. User risk acknowledgment required.",
            new_balance=user["balance"],
            timestamp=datetime.utcnow().isoformat()
        )

    # Safe or acknowledged Amber: Allow debit
    if user["balance"] < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient bank balance.")

    new_balance = user["balance"] - request.amount
    action_taken = "APPROVED" if risk_tier == "SAFE" else "COOLING_OFF_OVERRIDE"

    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user["id"]))
    cursor.execute("""
    INSERT INTO transactions (sender_upi, receiver_vpa, amount, transaction_type, note, risk_score, risk_tier, action_taken, flags_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        request.sender_upi,
        request.receiver_vpa,
        request.amount,
        request.transaction_type,
        request.note or "",
        risk_score,
        risk_tier,
        action_taken,
        signals_json,
        datetime.utcnow().isoformat()
    ))
    conn.commit()

    return PaymentExecuteResponse(
        success=True,
        transaction_id=f"UPI-KVCH-{int(datetime.utcnow().timestamp())}",
        status="COMPLETED",
        risk_score=risk_score,
        message=f"₹{request.amount:,.2f} securely transferred to {request.receiver_vpa}.",
        new_balance=new_balance,
        timestamp=datetime.utcnow().isoformat()
    )
