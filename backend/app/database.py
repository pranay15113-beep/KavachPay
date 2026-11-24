import sqlite3
import os

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "..", "kavachpay.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        upi_id TEXT UNIQUE NOT NULL,
        balance REAL DEFAULT 74500.0,
        phone TEXT DEFAULT '+91 98765 43210',
        baseline_wpm REAL DEFAULT 58.0,
        baseline_dwell_time REAL DEFAULT 95.0,
        baseline_flight_time REAL DEFAULT 140.0,
        device_fingerprint TEXT DEFAULT 'trusted-chrome-session-9843',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Blacklisted VPAs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blacklisted_vpas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vpa TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        severity TEXT DEFAULT 'HIGH',
        report_count INTEGER DEFAULT 1,
        confidence_score REAL DEFAULT 0.95,
        risk_reason TEXT NOT NULL,
        associated_bank TEXT DEFAULT 'Unknown',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_reported TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_upi TEXT NOT NULL,
        receiver_vpa TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT DEFAULT 'PAY',
        note TEXT DEFAULT '',
        risk_score INTEGER NOT NULL,
        risk_tier TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        flags_json TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Threat Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threat_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vpa TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        evidence_url TEXT DEFAULT '',
        reporter_contact TEXT DEFAULT 'Anonymous',
        status TEXT DEFAULT 'CONFIRMED',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Voice Analysis Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS voice_analysis_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        call_id TEXT NOT NULL,
        scenario_title TEXT NOT NULL,
        deepfake_probability REAL NOT NULL,
        urgency_score REAL NOT NULL,
        social_tactics_json TEXT NOT NULL,
        transcript TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        freeze_triggered INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Account Freezes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS account_freezes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 0,
        frozen_until TEXT,
        reason TEXT DEFAULT 'Manual or AI Threat Freeze',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
