import sys
from app.database import init_db, get_connection
from app.seed_data import seed_database
from app.services.fraud_engine import FraudEngine
from app.services.deepfake_analyzer import DeepfakeAnalyzerService
from app.services.behavioral_auth import BehavioralAuthService
from app.schemas import KeystrokeMetric

def main():
    print("[1/5] Initializing SQLite database tables...")
    init_db()
    conn = get_connection()
    seed_database(conn)
    print("Database seeded successfully.")

    print("[2/5] Testing Pre-Transaction Fraud Interceptor heuristics...")
    # Test 1: High risk phishing VPA
    res1 = FraudEngine.evaluate_transaction(
        conn=conn,
        sender_upi="rahul@kavach",
        receiver_vpa="refund-support@okaxis",
        amount=12.0,
        transaction_type="PAY"
    )
    print(f"Test 1 (refund-support@okaxis): Score={res1['risk_score']}, Tier={res1['risk_tier']}, Decision={res1['decision']}")
    assert res1["risk_tier"] == "RED", "Expected RED tier for blacklisted refund VPA"

    # Test 2: Collect trap
    res2 = FraudEngine.evaluate_transaction(
        conn=conn,
        sender_upi="rahul@kavach",
        receiver_vpa="lottery.seller@paytm",
        amount=15000.0,
        transaction_type="COLLECT_REQUEST",
        note="Click here to claim ₹15,000 cash prize"
    )
    print(f"Test 2 (Collect Request Trap): Score={res2['risk_score']}, Tier={res2['risk_tier']}, Decision={res2['decision']}")
    assert res2["risk_tier"] == "RED", "Expected RED tier for disguised collect trap"

    # Test 3: Safe Merchant
    res3 = FraudEngine.evaluate_transaction(
        conn=conn,
        sender_upi="rahul@kavach",
        receiver_vpa="rahul.kirana@ybl",
        amount=450.0,
        transaction_type="PAY"
    )
    print(f"Test 3 (Safe Merchant): Score={res3['risk_score']}, Tier={res3['risk_tier']}, Decision={res3['decision']}")
    assert res3["risk_tier"] == "SAFE", "Expected SAFE tier for clean merchant"

    print("[3/5] Testing Behavioral Authentication...")
    # Test 4: Bot simulation
    res4 = BehavioralAuthService.evaluate_behavior([], simulate_bot=True)
    print(f"Test 4 (Bot Simulation): Trust Score={res4['trust_score']}, Requires Step-up={res4['requires_step_up']}")
    assert res4["requires_step_up"] is True

    # Test 5: Human keystroke simulation
    human_keys = [
        KeystrokeMetric(key="r", dwell_time_ms=88, flight_time_ms=130),
        KeystrokeMetric(key="a", dwell_time_ms=92, flight_time_ms=145),
        KeystrokeMetric(key="h", dwell_time_ms=95, flight_time_ms=120),
        KeystrokeMetric(key="u", dwell_time_ms=85, flight_time_ms=155),
        KeystrokeMetric(key="l", dwell_time_ms=90, flight_time_ms=135),
    ]
    res5 = BehavioralAuthService.evaluate_behavior(human_keys)
    print(f"Test 5 (Human Cadence): Trust Score={res5['trust_score']}, Requires Step-up={res5['requires_step_up']}")
    assert res5["trust_score"] >= 90

    print("[4/5] Testing Deepfake Voice Analyzer...")
    res6 = DeepfakeAnalyzerService.analyze_scenario(conn, "fake_bank_kyc")
    print(f"Test 6 (Fake Bank KYC): Prob={res6.deepfake_probability}%, Urgency={res6.urgency_score}%, Verdict={res6.risk_verdict}")
    assert res6.deepfake_probability > 90

    print("[5/5] Testing 15-Minute Emergency UPI Freeze Trigger...")
    freeze_res = DeepfakeAnalyzerService.set_freeze_status(conn, action="FREEZE", duration_minutes=15)
    assert freeze_res["is_frozen"] is True
    # Now verify transaction interceptor blocks all payments due to freeze
    res7 = FraudEngine.evaluate_transaction(conn=conn, sender_upi="rahul@kavach", receiver_vpa="rahul.kirana@ybl", amount=20.0)
    print(f"Test 7 (Freeze Intercept): Risk Score={res7['risk_score']}, Tier={res7['risk_tier']}, IsFrozen={res7['is_account_frozen']}")
    assert res7["is_account_frozen"] is True and res7["risk_tier"] == "RED"

    # Clean up freeze for subsequent tests
    DeepfakeAnalyzerService.set_freeze_status(conn, action="UNFREEZE")
    print("Emergency freeze unfreezed.")

    conn.close()
    print("\nALL BACKEND CORE ENGINE TESTS PASSED 100%!")

if __name__ == "__main__":
    main()
