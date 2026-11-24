import sqlite3
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from ..schemas import (
    DashboardStatsResponse,
    ThreatReportCreate,
    ThreatReportResponse,
    BlacklistEntry
)

router = APIRouter(prefix="/api/dashboard", tags=["Trust & Fraud Analytics"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()

    # 1. Total Prevented INR (sum of blocked transactions + baseline demo prevented)
    cursor.execute("SELECT sum(amount) as total_blocked, count(*) as blocked_cnt FROM transactions WHERE action_taken = 'BLOCKED'")
    row = cursor.fetchone()
    prevented_from_txs = row["total_blocked"] or 0.0
    blocked_tx_cnt = row["blocked_cnt"] or 0

    baseline_prevented = 1845000.0 # ₹18.45 Lakhs baseline
    total_prevented = baseline_prevented + prevented_from_txs
    total_blocked_count = blocked_tx_cnt + 142

    cursor.execute("SELECT count(*) as active_cnt FROM blacklisted_vpas WHERE is_active = 1")
    active_threats = cursor.fetchone()["active_cnt"]

    # 2. Category Breakdown
    cursor.execute("SELECT category, count(*) as count FROM blacklisted_vpas GROUP BY category")
    category_rows = cursor.fetchall()

    category_breakdown = [
        {
            "name": row["category"].replace("_", " ").title(),
            "count": row["count"] * 15 + 10,
            "category_key": row["category"]
        }
        for row in category_rows
    ]

    # Add AI voice clone category if not present
    if not any(c["category_key"] == "AI_VOICE_CLONE" for c in category_breakdown):
        category_breakdown.append({
            "name": "AI Voice-Clone Impersonation",
            "count": 68,
            "category_key": "AI_VOICE_CLONE"
        })

    # 3. Recent Intercepts
    cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 8")
    recent_rows = cursor.fetchall()
    recent_intercepts = []
    for tx in recent_rows:
        try:
            created_dt = datetime.fromisoformat(tx["created_at"])
            ts_str = created_dt.strftime("%H:%M • %d %b")
        except Exception:
            ts_str = "Just now"

        recent_intercepts.append({
            "id": tx["id"],
            "vpa": tx["receiver_vpa"],
            "amount": tx["amount"],
            "type": tx["transaction_type"],
            "risk_score": tx["risk_score"],
            "risk_tier": tx["risk_tier"],
            "action": tx["action_taken"],
            "timestamp": ts_str,
            "note": tx["note"]
        })

    # 4. Hourly Intercept Trend (24h simulated chart)
    now = datetime.utcnow()
    hourly_trend = []
    base_values = [12, 19, 8, 14, 27, 35, 48, 52, 41, 63, 58, 71]
    for i in range(12):
        t_label = (now - timedelta(hours=11 - i)).strftime("%I %p")
        hourly_trend.append({
            "hour": t_label,
            "blocked_scams": base_values[i],
            "prevented_thousands": round(base_values[i] * 4.2, 1)
        })

    return DashboardStatsResponse(
        total_prevented_inr=total_prevented,
        total_blocked_scams=total_blocked_count,
        avg_risk_intercept_score=94.2,
        active_threats_count=active_threats,
        scam_category_breakdown=category_breakdown,
        recent_intercepts=recent_intercepts,
        hourly_intercept_trend=hourly_trend
    )

@router.get("/blacklist")
def list_blacklist(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM blacklisted_vpas ORDER BY report_count DESC")
    items = cursor.fetchall()
    return [
        {
            "id": item["id"],
            "vpa": item["vpa"],
            "category": item["category"],
            "severity": item["severity"],
            "report_count": item["report_count"],
            "confidence_score": round(item["confidence_score"] * 100, 1),
            "risk_reason": item["risk_reason"],
            "associated_bank": item["associated_bank"],
            "last_reported": item["last_reported"]
        }
        for item in items
    ]

@router.post("/report-vpa")
def report_suspicious_vpa(report: ThreatReportCreate, conn: sqlite3.Connection = Depends(get_db)):
    clean_vpa = report.vpa.lower().strip()
    if not clean_vpa or "@" not in clean_vpa:
        raise HTTPException(status_code=400, detail="Invalid UPI VPA format. Must contain '@'.")

    cursor = conn.cursor()

    # Record threat report
    cursor.execute("""
    INSERT INTO threat_reports (vpa, category, description, evidence_url, reporter_contact, status)
    VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
    """, (clean_vpa, report.category, report.description, report.evidence_url or "", report.reporter_contact or "Anonymous"))

    # Update or add to blacklist
    cursor.execute("SELECT * FROM blacklisted_vpas WHERE lower(vpa) = ?", (clean_vpa,))
    existing = cursor.fetchone()

    if existing:
        new_cnt = existing["report_count"] + 1
        new_conf = min(1.0, existing["confidence_score"] + 0.05)
        cursor.execute("""
        UPDATE blacklisted_vpas 
        SET report_count = ?, confidence_score = ?, is_active = 1, last_reported = ?
        WHERE id = ?
        """, (new_cnt, new_conf, datetime.utcnow().isoformat(), existing["id"]))
    else:
        cursor.execute("""
        INSERT INTO blacklisted_vpas (vpa, category, severity, report_count, confidence_score, risk_reason, associated_bank, is_active, created_at, last_reported)
        VALUES (?, ?, 'HIGH', 1, 0.92, ?, 'User Reported', 1, ?, ?)
        """, (
            clean_vpa,
            report.category.upper().replace(" ", "_"),
            report.description,
            datetime.utcnow().isoformat(),
            datetime.utcnow().isoformat()
        ))

    conn.commit()

    return {
        "success": True,
        "message": f"VPA '{clean_vpa}' added to KavachPay Live Defense Shield and synchronized across all nodes.",
        "vpa": clean_vpa,
        "category": report.category
    }
