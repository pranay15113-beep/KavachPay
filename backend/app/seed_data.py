from datetime import datetime, timedelta
import json
import sqlite3

SEED_VPAS = [
    (
        "refund-support@okaxis",
        "REFUND_PHISHING",
        "CRITICAL",
        47,
        0.98,
        "Electricity board overpayment refund lure asking users to scan QR / approve collect request.",
        "Axis Bank",
        1
    ),
    (
        "sbi.yono.kyc.update@okhdfcbank",
        "KYC_PHISHING",
        "CRITICAL",
        89,
        0.99,
        "SMS threat claiming YONO account suspension within 24 hours unless unblocking fee is transferred.",
        "HDFC Bank (Mismatched from SBI)",
        1
    ),
    (
        "paytm.cashback.winner@paytm",
        "COLLECT_TRAP",
        "HIGH",
        31,
        0.95,
        "Collect request disguised as ₹5,000 Scratch Card Cashback where entering UPI PIN debits victim.",
        "Paytm Payments Bank",
        1
    ),
    (
        "customs.officer.rahul@icici",
        "DIGITAL_ARREST",
        "CRITICAL",
        64,
        0.99,
        "FedEx / DHL contraband parcel extortion scam impersonating Customs & Narcotics Control Bureau.",
        "ICICI Bank",
        1
    ),
    (
        "indianarmy.canteen.orders@okicici",
        "IMPERSONATION",
        "HIGH",
        28,
        0.94,
        "OLX furniture seller impersonating Indian Army officer demanding advance booking deposit.",
        "ICICI Bank",
        1
    ),
    (
        "airtel.sim.block.help@ybl",
        "KYC_PHISHING",
        "HIGH",
        19,
        0.92,
        "Fake SIM deactivation notice threatening mobile tower blockage unless re-verification payment made.",
        "Yes Bank",
        1
    ),
    (
        "police.cybercrime.notice@sbi",
        "DIGITAL_ARREST",
        "CRITICAL",
        112,
        0.99,
        "Fake Supreme Court / Cyber Cell warrant for money laundering, demanding penalty transfer to escape arrest.",
        "State Bank of India",
        1
    ),
    (
        "lottery.kbc.jackpot@oksbi",
        "LOTTERY_SCAM",
        "HIGH",
        43,
        0.96,
        "WhatsApp audio message claiming ₹25 Lakh KBC lottery winner; requires registration fee payment.",
        "State Bank of India",
        1
    ),
    (
        "crypto.earn.guaranteed@okaxis",
        "INVESTMENT_FRAUD",
        "HIGH",
        22,
        0.93,
        "Telegram part-time job task / crypto daily compounding yield scam.",
        "Axis Bank",
        1
    )
]

SEED_TRANSACTIONS = [
    ("rahul@kavach", "kirana.supermart@okaxis", 840.0, "PAY", "Weekly Groceries", 6, "SAFE", "APPROVED", "[]", 1),
    ("rahul@kavach", "bescom.electricity.karnataka@sbi", 1420.0, "PAY", "Electricity Utility Bill", 4, "SAFE", "APPROVED", "[]", 2),
    ("rahul@kavach", "zomato.order@icici", 490.0, "PAY", "Dinner Order", 5, "SAFE", "APPROVED", "[]", 3),
    ("rahul@kavach", "police.cybercrime.notice@sbi", 45000.0, "PAY", "Immediate Bail Release Fee", 98, "RED", "BLOCKED", '["Flagged in National UPI Scam Registry", "Institutional Authority Spoofing", "Extreme Amount Anomaly"]', 4),
    ("rahul@kavach", "paytm.cashback.winner@paytm", 18500.0, "COLLECT_REQUEST", "Claim ₹18,500 Scratch Card Cashback - Enter PIN", 95, "RED", "BLOCKED", '["Disguised Collect Request Trap Detected", "Lottery/Cashback Scam Lure"]', 5),
    ("rahul@kavach", "apollo.pharmacy@ybl", 1150.0, "PAY", "Prescription Medicines", 8, "SAFE", "APPROVED", "[]", 6),
    ("rahul@kavach", "customs.officer.rahul@icici", 25000.0, "PAY", "Customs Clearance Penalty Fee", 94, "RED", "BLOCKED", '["Impersonation of Government / Customs Official", "Blacklist Registry Match"]', 7),
]

SEED_REPORTS = [
    ("refund-support@okaxis", "Electricity Bill Phishing", "Received WhatsApp message claiming power will be cut tonight at 9:30 PM unless ₹12 verification fee is paid via UPI.", "CONFIRMED"),
    ("police.cybercrime.notice@sbi", "Digital Arrest / Fake Warrant", "Scammer video called dressed in police uniform with fake CBI background demanding ₹45,000 spot fine for money laundering.", "CONFIRMED"),
    ("airtel.sim.block.help@ybl", "SIM KYC Deactivation", "Automated IVR call stating SIM will expire in 2 hours unless Aadhaar KYC fee is transferred.", "CONFIRMED")
]

def seed_database(conn: sqlite3.Connection):
    cursor = conn.cursor()

    # User
    cursor.execute("SELECT id FROM users WHERE username = 'rahul.verma'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (username, full_name, upi_id, balance, phone, baseline_wpm, baseline_dwell_time, baseline_flight_time, device_fingerprint)
        VALUES ('rahul.verma', 'Rahul Verma', 'rahul@kavach', 74500.0, '+91 98765 43210', 58.0, 95.0, 135.0, 'trusted-chrome-session-9843')
        """)

    # Blacklisted VPAs
    for vpa, cat, sev, rep_cnt, conf, reason, bank, active in SEED_VPAS:
        cursor.execute("SELECT id FROM blacklisted_vpas WHERE vpa = ?", (vpa,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO blacklisted_vpas (vpa, category, severity, report_count, confidence_score, risk_reason, associated_bank, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (vpa, cat, sev, rep_cnt, conf, reason, bank, active))

    # Transactions
    cursor.execute("SELECT count(*) as cnt FROM transactions")
    row = cursor.fetchone()
    if row and row["cnt"] == 0:
        for sender, rec, amt, t_type, note, r_score, r_tier, act, flags, days_ago in SEED_TRANSACTIONS:
            dt = (datetime.utcnow() - timedelta(days=days_ago)).isoformat()
            cursor.execute("""
            INSERT INTO transactions (sender_upi, receiver_vpa, amount, transaction_type, note, risk_score, risk_tier, action_taken, flags_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (sender, rec, amt, t_type, note, r_score, r_tier, act, flags, dt))

    # Reports
    cursor.execute("SELECT count(*) as cnt FROM threat_reports")
    row = cursor.fetchone()
    if row and row["cnt"] == 0:
        for vpa, cat, desc, status in SEED_REPORTS:
            cursor.execute("""
            INSERT INTO threat_reports (vpa, category, description, status)
            VALUES (?, ?, ?, ?)
            """, (vpa, cat, desc, status))

    conn.commit()
