from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(100))
    upi_id = Column(String(100), unique=True)
    balance = Column(Float, default=74500.0)
    phone = Column(String(15), default="+91 98765 43210")
    baseline_wpm = Column(Float, default=58.0)
    baseline_dwell_time = Column(Float, default=95.0)  # ms
    baseline_flight_time = Column(Float, default=140.0) # ms
    device_fingerprint = Column(String(100), default="trusted-macbook-brave-session")
    created_at = Column(DateTime, default=datetime.utcnow)

class BlacklistedVPA(Base):
    __tablename__ = "blacklisted_vpas"

    id = Column(Integer, primary_key=True, index=True)
    vpa = Column(String(100), unique=True, index=True)
    category = Column(String(50)) # IMPERSONATION, COLLECT_TRAP, KYC_PHISHING, LOTTERY_SCAM, EXTORTION, QR_TAMPER
    severity = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    report_count = Column(Integer, default=1)
    confidence_score = Column(Float, default=0.95)
    risk_reason = Column(Text)
    associated_bank = Column(String(50), default="Unknown")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_reported = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    sender_upi = Column(String(100))
    receiver_vpa = Column(String(100), index=True)
    amount = Column(Float)
    transaction_type = Column(String(30), default="PAY") # PAY, COLLECT_REQUEST, QR_PAY
    note = Column(String(255), default="")
    risk_score = Column(Integer) # 0 to 100
    risk_tier = Column(String(20)) # SAFE, AMBER, RED
    action_taken = Column(String(30)) # APPROVED, BLOCKED, COOLING_OFF_OVERRIDE, REJECTED
    flags_json = Column(Text, default="[]") # JSON string of detected flags
    created_at = Column(DateTime, default=datetime.utcnow)

class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id = Column(Integer, primary_key=True, index=True)
    vpa = Column(String(100), index=True)
    category = Column(String(50))
    description = Column(Text)
    evidence_url = Column(String(255), default="")
    reporter_contact = Column(String(50), default="Anonymous")
    status = Column(String(30), default="CONFIRMED")
    timestamp = Column(DateTime, default=datetime.utcnow)

class VoiceAnalysisLog(Base):
    __tablename__ = "voice_analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(50))
    scenario_title = Column(String(100))
    deepfake_probability = Column(Float)
    urgency_score = Column(Float)
    social_tactics_json = Column(Text)
    transcript = Column(Text)
    recommended_action = Column(String(100))
    freeze_triggered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AccountFreeze(Base):
    __tablename__ = "account_freezes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    is_active = Column(Boolean, default=False)
    frozen_until = Column(DateTime, nullable=True)
    reason = Column(String(255), default="Manual or AI Threat Freeze")
    created_at = Column(DateTime, default=datetime.utcnow)
