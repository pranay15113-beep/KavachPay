# Realistic audio scenarios used for testing AI Voice-Clone / Deepfake detection
SCENARIOS = {
    "fake_bank_kyc": {
        "id": "fake_bank_kyc",
        "title": "SBI / HDFC Impersonation - Urgent KYC Suspension Threat",
        "caller_claimed_identity": "SBI Central Security Desk / Officer Sharma",
        "deepfake_probability": 94,
        "urgency_score": 96,
        "is_synthetic_voice": True,
        "risk_verdict": "HIGH_RISK_DEEPFAKE",
        "transcript": (
            "Hello, this is Officer Sharma calling from SBI Central Headquarters KYC Operations. "
            "Your NetBanking and UPI facility will be permanently deactivated within 30 minutes due to "
            "unverified biometric KYC. To avoid suspension and police reporting, you must immediately "
            "verify your Aadhaar number and read out the 6-digit confirmation OTP sent to your phone right now. "
            "Do not disconnect the call, or your account will be frozen immediately."
        ),
        "detected_tactics": [
            {
                "tactic": "Artificial Urgency & Time Pressure",
                "detected": True,
                "confidence": 0.98,
                "detail": "Caller demands immediate action within 30 minutes under threat of service suspension."
            },
            {
                "tactic": "Institutional Authority Coercion",
                "detected": True,
                "confidence": 0.95,
                "detail": "Falsely impersonating SBI Central Headquarters Security Officer."
            },
            {
                "tactic": "OTP / Credential Solicitation",
                "detected": True,
                "confidence": 0.99,
                "detail": "Directly demanding a 6-digit one-time password over telephone."
            },
            {
                "tactic": "Call Isolation / Coercion",
                "detected": True,
                "confidence": 0.92,
                "detail": "Instructed the victim: 'Do not disconnect the call'."
            }
        ],
        "acoustic_cues": {
            "pitch_uniformity": 0.92,       # Unnatural pitch constancy (synthetic vocoder artifact)
            "spectral_flatness": 0.88,      # Acoustic profile shows neural audio resynthesis
            "jitter_shimmer_anomaly": 0.94, # Lack of micro-laryngeal variations in human vocal cords
            "background_noise_profile": "Synthetic ambient studio room noise injected"
        },
        "safety_recommendations": [
            "Halt all communication immediately. Banks NEVER ask for OTPs or threaten deactivation over call.",
            "Trigger KavachPay 15-Minute Emergency UPI Freeze to protect existing account funds.",
            "Report caller number to Cyber Crime Portal (1930 / cybercrime.gov.in)."
        ],
        "auto_freeze_eligible": True
    },
    "ai_relative_emergency": {
        "id": "ai_relative_emergency",
        "title": "AI Cloned Relative - Emergency Money Request",
        "caller_claimed_identity": "Cloned Voice of Nephew / Son ('Aarav')",
        "deepfake_probability": 98,
        "urgency_score": 99,
        "is_synthetic_voice": True,
        "risk_verdict": "HIGH_RISK_DEEPFAKE",
        "transcript": (
            "Uncle... Uncle please help me, I am in terrible trouble! I met with a car accident near the highway "
            "and the police inspector has seized my phone and car. They are going to put me in jail unless I pay "
            "₹35,000 spot fine right now! Uncle please don't call Papa, he will panic. Please transfer ₹35,000 to "
            "this police inspector's UPI ID: police.cybercrime.notice@sbi right now! Please hurry Uncle!"
        ),
        "detected_tactics": [
            {
                "tactic": "Emotional Panic & Distress Simulation",
                "detected": True,
                "confidence": 0.99,
                "detail": "Voice synthesizes crying, shallow breathing, and acute emotional distress to bypass rational judgment."
            },
            {
                "tactic": "Third-Party Family Secrecy / Isolation",
                "detected": True,
                "confidence": 0.96,
                "detail": "Instructs caller not to inform parents ('Don't call Papa, he will panic')."
            },
            {
                "tactic": "Urgent Financial Extortion Demand",
                "detected": True,
                "confidence": 0.98,
                "detail": "Demands immediate transfer of ₹35,000 to an alleged police UPI ID."
            },
            {
                "tactic": "Voice Clone Acoustic Match",
                "detected": True,
                "confidence": 0.97,
                "detail": "Neural voice cloning model trained on public WhatsApp/Instagram voice clips detected."
            }
        ],
        "acoustic_cues": {
            "pitch_uniformity": 0.95,
            "spectral_flatness": 0.91,
            "jitter_shimmer_anomaly": 0.96,
            "background_noise_profile": "Cloned timbre match with robotic frequency band cutoffs (>8kHz artifact)"
        },
        "safety_recommendations": [
            "DO NOT send money. Call the relative back directly on their verified phone number via regular cellular call.",
            "Ask a challenge question only the real person would know (e.g., 'What was the name of our childhood pet?').",
            "Emergency UPI Transfer Freeze has been automatically recommended."
        ],
        "auto_freeze_eligible": True
    },
    "genuine_merchant": {
        "id": "genuine_merchant",
        "title": "Genuine Delivery Partner - Address Confirmation",
        "caller_claimed_identity": "Zomato Delivery Executive ('Ramesh')",
        "deepfake_probability": 4,
        "urgency_score": 12,
        "is_synthetic_voice": False,
        "risk_verdict": "GENUINE_VOICE",
        "transcript": (
            "Namaste sir, I am calling from Zomato. I have reached near your apartment building at Tower B. "
            "The security guard is asking for the flat number. Could you please confirm if it is flat 402? "
            "Thank you sir, I will deliver the food at the doorstep."
        ),
        "detected_tactics": [
            {
                "tactic": "Artificial Urgency & Time Pressure",
                "detected": False,
                "confidence": 0.05,
                "detail": "No pressure or deadline applied."
            },
            {
                "tactic": "OTP / Credential Solicitation",
                "detected": False,
                "confidence": 0.01,
                "detail": "No financial or authentication information requested."
            },
            {
                "tactic": "Emotional Manipulation",
                "detected": False,
                "confidence": 0.02,
                "detail": "Calm, conversational delivery inquiry."
            }
        ],
        "acoustic_cues": {
            "pitch_uniformity": 0.15,       # Natural human pitch modulation & breathing
            "spectral_flatness": 0.12,      # Authentic analog vocal tract harmonics
            "jitter_shimmer_anomaly": 0.08, # Organic human micro-frequency variations present
            "background_noise_profile": "Realistic outdoor traffic and vehicular acoustic reflections"
        },
        "safety_recommendations": [
            "Voice matches genuine human conversational patterns.",
            "No sensitive financial or credential requests detected. Safe to communicate."
        ],
        "auto_freeze_eligible": False
    }
}
