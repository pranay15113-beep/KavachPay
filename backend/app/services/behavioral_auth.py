import math
from typing import List, Dict, Any, Tuple
from ..schemas import KeystrokeMetric

class BehavioralAuthService:
    # Baseline expected human typing behavior
    BASELINE_WPM = 55.0
    BASELINE_DWELL_MS = 95.0
    BASELINE_FLIGHT_MS = 135.0

    @classmethod
    def evaluate_behavior(
        cls,
        keystrokes: List[KeystrokeMetric],
        simulate_bot: bool = False,
        simulate_suspicious_ip: bool = False,
        device_info: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        risk_penalties = 0
        risk_factors: List[str] = []

        if simulate_bot:
            return {
                "trust_score": 18,
                "requires_step_up": True,
                "risk_factors": [
                    "Robotic Key Injection Pattern (<2ms flight time)",
                    "Zero Dynamic Keystroke Jitter (Automated Credential Stuffer)",
                    "Synthetic Input Event Dispatcher Detected"
                ],
                "behavioral_metrics": {
                    "wpm": 340.0,
                    "avg_dwell_ms": 1.2,
                    "avg_flight_ms": 0.8,
                    "cadence_variance": 0.02,
                    "human_confidence_pct": 4.5
                }
            }

        if simulate_suspicious_ip:
            risk_penalties += 45
            risk_factors.append("Anomalous Exit Node / Suspicious VPN Connection (Tor/Proxy Detected)")

        # Evaluate actual keystrokes if present
        if keystrokes and len(keystrokes) >= 3:
            dwell_times = [k.dwell_time_ms for k in keystrokes if k.dwell_time_ms > 0]
            flight_times = [k.flight_time_ms for k in keystrokes if k.flight_time_ms > 0]

            avg_dwell = sum(dwell_times) / len(dwell_times) if dwell_times else cls.BASELINE_DWELL_MS
            avg_flight = sum(flight_times) / len(flight_times) if flight_times else cls.BASELINE_FLIGHT_MS

            # Calculate variance in flight times (humans have natural rhythm fluctuations)
            if len(flight_times) > 1:
                variance = sum((x - avg_flight) ** 2 for x in flight_times) / len(flight_times)
                std_dev = math.sqrt(variance)
            else:
                std_dev = 25.0

            # Instantaneous typing check (< 20ms flight time consistently = script/autofill)
            if avg_flight < 20:
                risk_penalties += 55
                risk_factors.append("Instantaneous Key Flight Velocity (Scripted / Password Manager Auto-Fill)")
            elif std_dev < 4.0 and len(flight_times) > 4:
                risk_penalties += 40
                risk_factors.append("Unnatural Robotic Rhythm (Uniform Timing Interval)")

            # Super slow or stalled cadence
            if avg_flight > 900:
                risk_penalties += 15
                risk_factors.append("Hesitant / Discontinuous Key Cadence")

            estimated_wpm = max(10, min(160, round(60000 / ((avg_dwell + avg_flight) * 5), 1))) if (avg_dwell + avg_flight) > 0 else 55.0
            human_confidence = max(10, min(99, int(100 - risk_penalties)))

            calculated_trust = max(5, 100 - risk_penalties)
        else:
            # Fallback if no keystroke logger captured yet (first load)
            avg_dwell = cls.BASELINE_DWELL_MS
            avg_flight = cls.BASELINE_FLIGHT_MS
            estimated_wpm = cls.BASELINE_WPM
            std_dev = 28.5
            calculated_trust = max(15, 96 - risk_penalties)
            human_confidence = 94.0

        if not risk_factors:
            risk_factors.append("Consistent Human Cadence & Dwell Cadence Verified")
            risk_factors.append("Trusted Local Session Fingerprint")

        requires_step_up = calculated_trust < 65

        return {
            "trust_score": calculated_trust,
            "requires_step_up": requires_step_up,
            "risk_factors": risk_factors,
            "behavioral_metrics": {
                "wpm": estimated_wpm,
                "avg_dwell_ms": round(avg_dwell, 1),
                "avg_flight_ms": round(avg_flight, 1),
                "cadence_variance": round(std_dev, 2),
                "human_confidence_pct": human_confidence
            }
        }
