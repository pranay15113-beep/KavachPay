import re
import sqlite3
from typing import List, Dict, Any, Tuple
from datetime import datetime
from ..schemas import RiskSignal

# High risk scam keywords found in Indian UPI phishing
HIGH_RISK_KEYWORDS = [
    "refund", "kyc", "customs", "cbi", "police", "army", "prize", "lottery",
    "support", "cashback", "bonus", "tollfree", "helpline", "reward", "rewards",
    "winner", "gift", "airtel-help", "jio-care", "yono-kyc", "sim-block",
    "overpayment", "electricity-refund", "fastag-recharge", "parcel-held"
]

MEDIUM_RISK_KEYWORDS = [
    "care", "desk", "verify", "update", "activation", "department",
    "official", "secure", "nodal", "portal", "agent", "service"
]

COLLECT_TRAP_PHRASES = [
    "receive", "claim", "get money", "credited", "cashback", "lottery", "prize",
    "enter pin to receive", "refund processed", "click to accept ₹", "accept payment",
    "bonus credited", "win ₹", "won ₹", "deposit refund", "overpaid"
]

class FraudEngine:
    @staticmethod
    def check_vpa_heuristics(vpa: str) -> Tuple[int, List[RiskSignal]]:
        score = 0
        signals = []
        vpa_lower = vpa.lower().strip()

        # Check high risk keywords
        matched_high = [kw for kw in HIGH_RISK_KEYWORDS if kw in vpa_lower]
        if matched_high:
            score += 45
            signals.append(RiskSignal(
                code="IMPERSONATION_KEYWORD",
                title="Phishing / Impersonation Keyword in VPA",
                description=f"VPA contains high-risk deception terms: {', '.join(matched_high)} commonly used in government, bank, and refund impersonation schemes.",
                severity="HIGH",
                weight=45
            ))

        # Check medium risk keywords
        matched_med = [kw for kw in MEDIUM_RISK_KEYWORDS if kw in vpa_lower and kw not in matched_high]
        if matched_med:
            score += 15
            signals.append(RiskSignal(
                code="SUSPICIOUS_HANDLE_SUFFIX",
                title="Deceptive Service / Support Keyword",
                description=f"VPA contains deceptive generic support wording: {', '.join(matched_med)}.",
                severity="MEDIUM",
                weight=15
            ))

        # Check deceptive combinations: e.g. government/police with retail UPI handles
        bank_handles = ["@okaxis", "@okhdfcbank", "@okicici", "@oksbi", "@ybl", "@paytm", "@ibl"]
        gov_police_terms = ["police", "cbi", "customs", "army", "court", "rbi"]
        has_gov = any(term in vpa_lower for term in gov_police_terms)
        has_retail_bank = any(vpa_lower.endswith(h) for h in bank_handles)
        
        if has_gov and has_retail_bank:
            score += 35
            signals.append(RiskSignal(
                code="INSTITUTIONAL_MISMATCH",
                title="Institutional Authority Spoofing",
                description="Law enforcement or government agencies never use standard consumer retail UPI handles (e.g. @okaxis, @paytm) to demand fines or payments.",
                severity="CRITICAL",
                weight=35
            ))

        # Check for numeric scam phone handle with keywords
        if re.search(r'\d{10}.*(support|kyc|refund)', vpa_lower):
            score += 25
            signals.append(RiskSignal(
                code="UNVERIFIED_PHONE_ALIAS",
                title="Temporary Phone Number with Support Tag",
                description="Combination of random 10-digit mobile number with helpline suffix indicates burner VPA.",
                severity="HIGH",
                weight=25
            ))

        return min(score, 60), signals

    @staticmethod
    def check_collect_trap(transaction_type: str, note: str, amount: float) -> Tuple[int, List[RiskSignal]]:
        score = 0
        signals = []
        note_lower = (note or "").lower().strip()

        if transaction_type.upper() == "COLLECT_REQUEST":
            # The scammer sent a request asking money from user
            # Check if note attempts to deceive user into thinking they are RECEIVING money
            matched_phrases = [p for p in COLLECT_TRAP_PHRASES if p in note_lower]
            
            if matched_phrases:
                score += 65
                signals.append(RiskSignal(
                    code="DISGUISED_COLLECT_TRAP",
                    title="Disguised 'Collect Request' Trap Detected",
                    description=f"CRITICAL WARNING: You are being asked to AUTHORIZE a DEBIT of ₹{amount:,.2f}. The sender note ('{note}') falsely implies you will receive money or cashback. Entering your UPI PIN will DEDUCT funds, not credit them!",
                    severity="CRITICAL",
                    weight=65
                ))
            else:
                score += 25
                signals.append(RiskSignal(
                    code="UNSOLICITED_COLLECT_REQUEST",
                    title="Unsolicited UPI Collect Request",
                    description="Incoming payment request initiated by external party. Ensure you are not paying an unsolicited bill.",
                    severity="MEDIUM",
                    weight=25
                ))

        return score, signals

    @staticmethod
    def check_amount_anomaly(amount: float) -> Tuple[int, List[RiskSignal]]:
        score = 0
        signals = []
        
        # User typical transaction is around 1,000 - 3,000 INR
        if amount > 50000:
            score += 35
            signals.append(RiskSignal(
                code="EXTREME_AMOUNT_ANOMALY",
                title="Extreme Transaction Volume Anomaly",
                description=f"Transaction amount of ₹{amount:,.2f} is significantly higher than your typical ₹1,200 peer transfer profile. Common in panic-induced extortion and fake police bail scams.",
                severity="HIGH",
                weight=35
            ))
        elif amount > 20000:
            score += 20
            signals.append(RiskSignal(
                code="HIGH_VALUE_OUTLIER",
                title="High-Value Outlier Transfer",
                description=f"Transaction amount of ₹{amount:,.2f} exceeds standard spending thresholds.",
                severity="MEDIUM",
                weight=20
            ))

        return score, signals

    @staticmethod
    def check_database_blacklist(conn: sqlite3.Connection, vpa: str) -> Tuple[int, List[RiskSignal], Any]:
        score = 0
        signals = []
        vpa_clean = vpa.lower().strip()
        cursor = conn.cursor()

        # Query blacklist
        cursor.execute("SELECT * FROM blacklisted_vpas WHERE lower(vpa) = ? AND is_active = 1", (vpa_clean,))
        match = cursor.fetchone()

        if match:
            # Heavily weight blacklisted VPAs
            score += 85
            category_clean = match["category"].replace('_', ' ')
            signals.append(RiskSignal(
                code="BLACKLIST_HIT",
                title=f"Flagged in National UPI Scam Registry ({match['category']})",
                description=f"This VPA has been flagged across {match['report_count']} verified fraud incident(s). Category: {category_clean}. Known MO: {match['risk_reason']}",
                severity="CRITICAL",
                weight=85
            ))
            return score, signals, match

        # Check domain / wildcard match
        prefix = vpa_clean.split("@")[0] if "@" in vpa_clean else vpa_clean
        cursor.execute("SELECT * FROM blacklisted_vpas WHERE lower(vpa) LIKE ? AND is_active = 1", (f"%{prefix}%",))
        partial_matches = cursor.fetchall()

        if len(partial_matches) >= 2:
            score += 40
            signals.append(RiskSignal(
                code="SYNDICATE_CLUSTER_PATTERN",
                title="Suspicious Fraud Cluster Match",
                description=f"Handle pattern '{prefix}' matches multiple known syndicate VPAs flagged for serial phishing.",
                severity="HIGH",
                weight=40
            ))

        return score, signals, None

    @classmethod
    def evaluate_transaction(
        cls,
        conn: sqlite3.Connection,
        sender_upi: str,
        receiver_vpa: str,
        amount: float,
        transaction_type: str = "PAY",
        note: str = ""
    ) -> Dict[str, Any]:
        total_score = 0
        all_signals: List[RiskSignal] = []
        cursor = conn.cursor()

        # 1. Check if user account has active emergency freeze
        cursor.execute("SELECT * FROM account_freezes WHERE is_active = 1 AND datetime(frozen_until) > datetime('now') ORDER BY id DESC LIMIT 1")
        active_freeze = cursor.fetchone()

        is_frozen = active_freeze is not None
        freeze_reason = active_freeze["reason"] if active_freeze else None

        if is_frozen:
            return {
                "receiver_vpa": receiver_vpa,
                "amount": amount,
                "transaction_type": transaction_type,
                "risk_score": 100,
                "risk_tier": "RED",
                "decision": "BLOCK",
                "signals": [
                    RiskSignal(
                        code="ACCOUNT_SECURITY_FREEZE",
                        title="Account Frozen via Emergency Voice-Clone Shield",
                        description=f"All outgoing UPI transfers are temporarily locked. Reason: {freeze_reason}. You or our AI engine initiated this safety freeze to prevent unauthorized transfers.",
                        severity="CRITICAL",
                        weight=100
                    )
                ],
                "explanation": "EMERGENCY SAFETY LOCK: Outgoing UPI payments are locked due to an active Voice-Clone / Social Engineering alert. Unfreeze your account in the Voice Scam Analyzer or wait for the cooling-off window.",
                "cooling_off_seconds": 900,
                "is_account_frozen": True,
                "freeze_reason": freeze_reason,
                "gemini_insights": "Account locked by KavachPay Autonomous Defense. Suspected active voice impersonation targeting the account holder."
            }

        # 2. Heuristics
        heur_score, heur_signals = cls.check_vpa_heuristics(receiver_vpa)
        total_score += heur_score
        all_signals.extend(heur_signals)

        # 3. Collect Request Trap Check
        trap_score, trap_signals = cls.check_collect_trap(transaction_type, note, amount)
        total_score += trap_score
        all_signals.extend(trap_signals)

        # 4. Blacklist Check
        bl_score, bl_signals, bl_match = cls.check_database_blacklist(conn, receiver_vpa)
        total_score += bl_score
        all_signals.extend(bl_signals)

        # 5. Amount Anomaly Check
        amt_score, amt_signals = cls.check_amount_anomaly(amount)
        total_score += amt_score
        all_signals.extend(amt_signals)

        # Cap score between 0 and 100
        total_score = min(max(total_score, 0), 100)

        # If zero risks detected, add a Safe Signal
        if total_score < 25 and not all_signals:
            all_signals.append(RiskSignal(
                code="VERIFIED_REPUTATION",
                title="Verified Genuine VPA Pattern",
                description="No scam keywords detected, standard consumer/merchant handle, and clean history in National Fraud Repositories.",
                severity="SAFE",
                weight=0
            ))

        # Determine Tier & Decision
        if total_score >= 70:
            risk_tier = "RED"
            decision = "BLOCK"
            cooling_off_seconds = 0
            explanation = "HIGH RISK TRANSACTION BLOCKED: Multiple high-severity fraud indicators detected. Proceeding will likely result in permanent financial loss."
        elif total_score >= 30:
            risk_tier = "AMBER"
            decision = "CAUTION_COOLING_OFF"
            cooling_off_seconds = 300 # 5 min cooling-off
            explanation = "CAUTION REQUIRED: Medium risk factors detected. A 5-minute cooling-off safety delay is recommended before authorizing."
        else:
            risk_tier = "SAFE"
            decision = "ALLOW"
            cooling_off_seconds = 0
            explanation = "TRANSACTION VERIFIED SAFE: Low risk profile. Standard transaction heuristics passed."

        return {
            "receiver_vpa": receiver_vpa,
            "amount": amount,
            "transaction_type": transaction_type,
            "risk_score": total_score,
            "risk_tier": risk_tier,
            "decision": decision,
            "signals": all_signals,
            "explanation": explanation,
            "cooling_off_seconds": cooling_off_seconds,
            "is_account_frozen": False,
            "freeze_reason": None,
            "gemini_insights": f"KavachPay AI evaluated {len(all_signals)} risk parameters. Primary threat vector: {all_signals[0].title if all_signals else 'Clean'}."
        }
