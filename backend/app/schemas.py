from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Behavioral Authentication Schemas ---
class KeystrokeMetric(BaseModel):
    key: str
    dwell_time_ms: float
    flight_time_ms: float

class LoginRequest(BaseModel):
    username: str
    password: str
    simulate_bot: bool = False
    simulate_suspicious_ip: bool = False
    keystrokes: List[KeystrokeMetric] = []
    device_info: Optional[Dict[str, Any]] = None

class LoginResponse(BaseModel):
    success: bool
    requires_step_up: bool
    user: Optional[Dict[str, Any]] = None
    trust_score: int # 0 to 100
    risk_factors: List[str]
    behavioral_metrics: Dict[str, Any]
    session_token: Optional[str] = None
    message: str

class StepUpVerifyRequest(BaseModel):
    username: str
    otp_code: str
    challenge_type: str = "OTP" # OTP or BIOMETRIC

class StepUpVerifyResponse(BaseModel):
    success: bool
    trust_score: int
    message: str
    session_token: Optional[str] = None

# --- UPI Payment & Fraud Interceptor Schemas ---
class PaymentRiskCheckRequest(BaseModel):
    sender_upi: str = "user@kavach"
    receiver_vpa: str
    amount: float
    transaction_type: str = "PAY" # "PAY" or "COLLECT_REQUEST" or "QR_PAY"
    note: Optional[str] = ""
    qr_payload: Optional[str] = None

class RiskSignal(BaseModel):
    code: str
    title: str
    description: str
    severity: str # "CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"
    weight: int

class PaymentRiskCheckResponse(BaseModel):
    receiver_vpa: str
    amount: float
    transaction_type: str
    risk_score: int # 0 - 100
    risk_tier: str # "SAFE" (0-30), "AMBER" (31-70), "RED" (71-100)
    decision: str # "ALLOW", "CAUTION_COOLING_OFF", "BLOCK"
    signals: List[RiskSignal]
    explanation: str
    cooling_off_seconds: int = 0
    is_account_frozen: bool = False
    freeze_reason: Optional[str] = None
    gemini_insights: Optional[str] = None

class PaymentExecuteRequest(BaseModel):
    sender_upi: str = "user@kavach"
    receiver_vpa: str
    amount: float
    transaction_type: str = "PAY"
    note: Optional[str] = ""
    override_cooling_off: bool = False
    user_acknowledged_risk: bool = False

class PaymentExecuteResponse(BaseModel):
    success: bool
    transaction_id: str
    status: str # "COMPLETED", "BLOCKED", "COOLING_OFF_ACTIVE"
    risk_score: int
    message: str
    new_balance: float
    timestamp: str

# --- AI Voice Clone / Deepfake Analyzer Schemas ---
class VoiceScenarioRequest(BaseModel):
    scenario_id: str # "fake_bank_kyc", "ai_relative_emergency", "genuine_merchant"

class SocialEngineeringTactic(BaseModel):
    tactic: str
    detected: bool
    confidence: float
    detail: str

class VoiceAnalyzeResponse(BaseModel):
    scenario_id: Optional[str] = None
    title: str
    caller_claimed_identity: str
    deepfake_probability: int # 0 to 100%
    urgency_score: int # 0 to 100%
    is_synthetic_voice: bool
    risk_verdict: str # "HIGH_RISK_DEEPFAKE", "SUSPICIOUS", "GENUINE_VOICE"
    transcript: str
    detected_tactics: List[SocialEngineeringTactic]
    acoustic_cues: Dict[str, Any]
    safety_recommendations: List[str]
    auto_freeze_eligible: bool
    account_is_frozen: bool

class FreezeToggleRequest(BaseModel):
    freeze_duration_minutes: int = 15
    reason: str = "AI Voice-Clone Scam Detected"
    action: str = "FREEZE" # "FREEZE" or "UNFREEZE"

class FreezeStatusResponse(BaseModel):
    is_frozen: bool
    remaining_seconds: int
    freeze_reason: Optional[str]
    frozen_until: Optional[str]

# --- Dashboard & Threat Reporting Schemas ---
class ThreatReportCreate(BaseModel):
    vpa: str
    category: str
    description: str
    evidence_url: Optional[str] = ""
    reporter_contact: Optional[str] = "Anonymous"

class ThreatReportResponse(BaseModel):
    id: int
    vpa: str
    category: str
    description: str
    timestamp: datetime
    status: str

class BlacklistEntry(BaseModel):
    id: int
    vpa: str
    category: str
    severity: str
    report_count: int
    risk_reason: str
    last_reported: datetime

class DashboardStatsResponse(BaseModel):
    total_prevented_inr: float
    total_blocked_scams: int
    avg_risk_intercept_score: float
    active_threats_count: int
    scam_category_breakdown: List[Dict[str, Any]]
    recent_intercepts: List[Dict[str, Any]]
    hourly_intercept_trend: List[Dict[str, Any]]
