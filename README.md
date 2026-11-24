# 🛡️ KavachPay (कवच पे)
### Autonomous Pre-Transaction UPI Fraud Interceptor & AI Voice-Clone Shield
> **Built for Cybersecurity & FinTech Hackathons**  
> Protects users against UPI payment scams, disguised collect-request traps, and AI voice-clone impersonation **before money ever leaves their account**.

---

## ⚡ Quick Start (3-Step Setup)

### Step 1: Clone & Set Up Backend (Python FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI engine (running on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```
*The SQLite database (`kavachpay.db`) will auto-initialize and pre-seed with realistic Indian UPI scam registries, blacklisted VPAs, and transaction logs on startup.*

### Step 2: Set Up Frontend (React + Vite + Tailwind CSS)
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server (running on http://localhost:5173)
npm run dev
```

### Step 3: Open in Browser & Demo
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🚀 Core Features & Interactive Capabilities

### 1. 🛡️ Pre-Transaction UPI Fraud Interceptor (Main Feature)
A clean, mobile-first UPI payment simulator where users enter a VPA, Amount (₹), and Payment Note/QR payload.
- **Real-Time Risk Scoring Engine (0–100 Score)**:
  - **VPA Pattern Heuristics**: Detects phishing and impersonation keywords (`refund`, `kyc`, `customs`, `cbi`, `police`, `army`, `prize`, `lottery`, `support`, `cashback`, `fastag`).
  - **Disguised "Collect Request" Trap Detection**: Critical vector in Indian UPI. Scammers issue an incoming *Collect Request* claiming "To receive ₹15,000 lottery winning, enter your UPI PIN". KavachPay flags this trap with a 99% critical alert explaining that entering a PIN **debits** funds rather than crediting them.
  - **Crowdsourced SQLite Blacklist**: Instant cross-referencing against verified fraud reports and velocity patterns.
  - **Amount Variance Anomaly**: Evaluates spending outliers against the user's historical baseline profile.
- **Risk Intervention Modals**:
  - 🟢 **Safe Tier (0–29)**: Standard authorization with verified badge and instant celebratory feedback.
  - 🟡 **Amber Tier (30–69)**: Caution state with automated 5-minute cooling-off delay, clear hazard explanation, and mandatory user risk acknowledgment checkbox.
  - 🔴 **Red Tier (70–100)**: **High Risk Scam Intercepted & Blocked!** Funds never leave the account. Users can view matched indicators and report the VPA directly to the national blacklist registry.

### 2. 🎙️ AI Deepfake / Voice-Clone Scam Call Analyzer
Addresses the exponential rise of AI voice-cloning in India (e.g., fake digital arrests, family distress extortion, urgent KYC suspension).
- **Interactive Scenarios**:
  - 🔴 *Fake Bank KYC Urgent Call*: SBI/HDFC impersonation threatening NetBanking deactivation in 30 minutes.
  - 🔴 *AI Cloned Relative Emergency Request*: Voice clone of a nephew claiming to be held in police custody after a car crash, demanding ₹35,000 spot bail.
  - 🟢 *Genuine Merchant Confirmation*: Food delivery partner confirming address gate numbers.
  - 📁 *Custom Audio File Upload*: Drag & drop any `.wav` or `.mp3` for acoustic spectral inspection.
- **Deepfake Cues & Tactics Detected**:
  - Neural Vocoder Pitch Uniformity (F0 constancy) & Spectral Flatness.
  - Absence of natural organic vocal-cord micro-tremors (jitter/shimmer).
  - Linguistic Social Engineering markers (artificial urgency, authority coercion, OTP/PIN solicitation).
- **Automated 15-Minute Emergency UPI Freeze**:
  - One-click trigger that temporarily freezes all outgoing UPI transfers.
  - Displays a live countdown timer and prominently blocks transfers in the UPI Simulator until released.

### 3. 👤 Risk-Adaptive Behavioral Login (Biometrics)
- **Continuous Keystroke Cadence Logging**: Captures dwell time (key-hold duration) and flight time (inter-key velocity) in milliseconds.
- **Device & Behavioral Trust Score**: Real-time badge (e.g., `96% Trusted` vs. `18% Anomalous Login Flagged`).
- **Interactive Threat Simulation Toggles (For Judges/Evaluators)**:
  - 🤖 *Simulate Robotic / Credential-Stuffing Attack*: Injects keystrokes with <2ms velocity and uniform variance, immediately triggering an anomalous alert.
  - 🌐 *Simulate Tor / Anonymous VPN Proxy IP*: Drops trust score by 45 points.
- **Dynamic Step-Up Security Challenge**: If trust score falls below 65%, enforces a two-factor out-of-band verification modal (demo OTP: `123456`) before granting session access.

### 4. 📊 FinTech Trust & Fraud Analytics Dashboard
- **Prevented Fraud Volume (₹)**: Real-time counter of total rupees saved across all prevented transactions.
- **Interactive Recharts Visualizations**:
  - Category breakdown (Disguised Collect Requests, Impersonation VPAs, Voice Clone Extortion, QR Tampering, Digital Arrests).
  - 24-hour threat velocity and prevented volume trendline.
- **Live Threat Feed**: Real-time audit log of blocked transactions stored in SQLite.
- **Instant "Report Suspicious UPI ID" Form**: Immediately writes new scam handles and notes to the live SQLite blacklist database, updating the defense network on the fly.

---

## 🏗️ Architecture & Tech Stack

```
KavachPay/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application & CORS setup
│   │   ├── database.py             # SQLite connection & schema initializer
│   │   ├── models.py               # Database schemas
│   │   ├── schemas.py              # Pydantic request/response models
│   │   ├── seed_data.py            # Pre-seeded Indian UPI scam dataset
│   │   ├── audio_samples.py        # Voice scenario scripts & spectral profiles
│   │   ├── services/
│   │   │   ├── fraud_engine.py     # Heuristics, VPA check, collect trap detector
│   │   │   ├── deepfake_analyzer.py# Voice-clone acoustic & urgency analyzer
│   │   │   ├── behavioral_auth.py  # Keystroke cadence & trust scoring
│   │   │   └── gemini_service.py   # AI contextual insight (with offline fallback)
│   │   └── routers/
│   │       ├── auth.py             # Behavioral login & step-up OTP
│   │       ├── payment.py          # Pre-transaction interceptor & execution
│   │       ├── voice.py            # Audio inspection & emergency freeze
│   │       └── dashboard.py        # Stats, charts, and VPA reporting
│   ├── requirements.txt            # Python dependencies
│   └── test_backend.py             # Standalone verification script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Cyber status bar, balance, freeze banner
│   │   │   ├── PreTransactionModal.jsx # Green/Amber/Red intervention dialogs
│   │   │   ├── UpiPaymentSimulator.jsx # Feature 2: UPI fraud interceptor
│   │   │   ├── VoiceAnalyzer.jsx   # Feature 3: Deepfake scam call analyzer
│   │   │   ├── BehavioralLogin.jsx # Feature 1: Keystroke cadence profiler
│   │   │   ├── FraudDashboard.jsx  # Feature 4: Recharts analytics & blacklist
│   │   │   └── AudioWaveform.jsx   # Live audio frequency visualizer
│   │   ├── api.js                  # Centralized REST API client
│   │   ├── App.jsx                 # Main application view container
│   │   └── index.css               # Cyber neon styling, glow utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti
- **Backend**: FastAPI (Python 3.10+), Uvicorn, Pydantic v2
- **Database**: SQLite (built-in, zero external server requirement)
- **AI / Detection**: Rule-based heuristics, Acoustic vocoder signal processing, and Google Gemini API (with 100% deterministic offline fallback).

---

## 🎯 Hackathon Judge Demo Walkthrough Guide

Follow these exact steps to see all 4 core features in action:

1. **Test Pre-Transaction UPI Interception**:
   - In the **UPI Fraud Interceptor** tab, click **"Electricity Bill Refund Scam"** preset (`refund-support@okaxis`).
   - Click **"Scan Pre-Flight Threat"**.
   - Watch the **Red Scam Blocked Modal** appear, identifying the impersonation keyword and citing 47 previous victims in the SQLite registry.
   - Click **"Cashback Collect Request Trap"** (`paytm.cashback.winner@paytm`, ₹15,000). Click **"Scan Pre-Flight Threat"**. Notice how KavachPay flags that you are about to **DEBIT** ₹15,000 rather than receive it.
   - Click **"Genuine Kirana / Supermarket"** (`rahul.kirana@ybl`, ₹650). Click **"Scan Pre-Flight Threat"** and **"Authorize Secure Transfer"** to see instant safe confirmation and celebratory confetti.

2. **Test AI Voice-Clone Scam Call Analyzer**:
   - Switch to the **AI Voice Scam Analyzer** tab.
   - Click **"Fake Bank KYC Urgent Threat"** or **"AI Cloned Relative Emergency Request"**.
   - Click the play button on the waveform to inspect live spectral signal processing.
   - Review the **98% Deepfake Probability**, acoustic uniformity flags, and detected social engineering tactics.
   - Click **"Trigger 15-Minute Emergency UPI Freeze"**.
   - Switch back to the **UPI Fraud Interceptor** tab and notice the prominent red warning banner. Any attempt to send money is now automatically blocked with an emergency security lock!

3. **Test Behavioral Authentication (Keystroke Cadence)**:
   - Switch to the **Behavioral Biometrics** tab.
   - Type in the password field to see real-time dwell and flight time telemetry.
   - Toggle **"Simulate Robotic / Credential-Stuffing Attack"** and click **"Authenticate"**.
   - Watch the Trust Score plummet to **18%**, triggering the **Step-Up Security Challenge** modal. Enter `123456` to elevate trust back to 97%.

4. **Test Threat Intelligence & SQLite Reporting**:
   - Switch to the **Threat Feed** tab to inspect prevented fraud statistics and the 24-hour activity trendline.
   - In the **"Report Suspicious UPI ID"** form, enter `fake.customs.agent@okaxis`, select *Digital Arrest*, and click **"Report & Blacklist Immediately"**.
   - Observe the new handle immediately appear in the SQLite blacklist and sync into the active defense radar!

---

## 🔒 Security & Privacy Architecture
- **Offline First**: All heuristics, acoustic metrics, and pattern analyzers run locally with zero cloud leakage of bank credentials or voice recordings.
- **No Stored PINs**: KavachPay operates at the application layer prior to UPI PIN entry, ensuring full compliance with NPCI security guidelines.
- **Fail-Safe Fallback**: If external AI APIs are unreachable, deterministic local security policies guarantee 100% continuous defense.
