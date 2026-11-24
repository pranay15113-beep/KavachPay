import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Bot,
  Globe,
  KeyRound,
  User,
  Activity,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export default function BehavioralLogin({ onLoginSuccess, currentTrustScore, onTrustScoreUpdate }) {
  const [username, setUsername] = useState('rahul.verma');
  const [password, setPassword] = useState('SuperSecret#2026');
  const [simulateBot, setSimulateBot] = useState(false);
  const [simulateSuspiciousIp, setSimulateSuspiciousIp] = useState(false);
  
  // Keystroke dynamics tracking
  const [keystrokes, setKeystrokes] = useState([]);
  const lastKeyUpTimeRef = useRef(0);
  const keyDownTimesRef = useRef({});

  // Auth Result State
  const [loading, setLoading] = useState(false);
  const [authResponse, setAuthResponse] = useState(null);
  
  // Step-Up 2FA Modal
  const [showStepUpModal, setShowStepUpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Capture keystroke dwell & flight times
  const handleKeyDown = (e) => {
    if (!keyDownTimesRef.current[e.key]) {
      keyDownTimesRef.current[e.key] = performance.now();
    }
  };

  const handleKeyUp = (e) => {
    const keyUpTime = performance.now();
    const keyDownTime = keyDownTimesRef.current[e.key] || (keyUpTime - 95);
    delete keyDownTimesRef.current[e.key];

    const dwellTime = Math.max(10, Math.min(400, keyUpTime - keyDownTime));
    const flightTime = lastKeyUpTimeRef.current ? Math.max(10, Math.min(800, keyDownTime - lastKeyUpTimeRef.current)) : 130;
    lastKeyUpTimeRef.current = keyUpTime;

    setKeystrokes((prev) => [
      ...prev.slice(-15),
      {
        key: e.key.length === 1 ? e.key : 'special',
        dwell_time_ms: Math.round(dwellTime),
        flight_time_ms: Math.round(flightTime),
      },
    ]);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.login({
        username,
        password,
        simulate_bot: simulateBot,
        simulate_suspicious_ip: simulateSuspiciousIp,
        keystrokes,
        device_info: {
          userAgent: navigator.userAgent,
          screen: `${window.innerWidth}x${window.innerHeight}`,
        },
      });

      setAuthResponse(res);
      if (onTrustScoreUpdate) onTrustScoreUpdate(res.trust_score);

      if (res.requires_step_up) {
        setShowStepUpModal(true);
      } else if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      console.error('Login error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      const res = await api.stepUpVerify({
        username,
        otp_code: otpCode,
        challenge_type: 'OTP',
      });
      if (res.success) {
        setShowStepUpModal(false);
        if (onTrustScoreUpdate) onTrustScoreUpdate(res.trust_score);
        setAuthResponse((prev) => ({
          ...prev,
          success: true,
          requires_step_up: false,
          trust_score: res.trust_score,
          message: res.message,
        }));
        if (onLoginSuccess) {
          onLoginSuccess(authResponse?.user);
        }
      }
    } catch (err) {
      console.error('OTP error', err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Compute live visual metrics
  const avgDwell = keystrokes.length
    ? Math.round(keystrokes.reduce((acc, k) => acc + k.dwell_time_ms, 0) / keystrokes.length)
    : 95;
  const avgFlight = keystrokes.length
    ? Math.round(keystrokes.reduce((acc, k) => acc + k.flight_time_ms, 0) / keystrokes.length)
    : 135;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Feature Intro */}
      <div className="bg-gradient-to-r from-[#0c1228] via-[#0f183b] to-[#0c1228] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Zero-Friction Continuous Behavioral Biometrics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              Risk-Adaptive Behavioral Authentication
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Analyzes micro-rhythms in keystroke cadence (dwell and flight intervals) and session trust. Seamlessly admits verified humans with high trust while enforcing step-up challenges on automated credential stuffers.
            </p>
          </div>

          {/* Current Score Badge */}
          <div
            className={`px-4 py-3 rounded-2xl border font-mono text-right ${
              currentTrustScore >= 70
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 glow-safe'
                : 'bg-red-950/50 border-red-500/40 text-red-300 glow-danger'
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Device & Biometric Trust</div>
            <div className="text-2xl font-black">{currentTrustScore}% Trusted</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Login Form */}
        <div className="lg:col-span-7 bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <span className="font-mono font-bold text-sm text-white">Continuous Biometric Login Gateway</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Keystroke Logger Active</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                User Handle / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl pl-11 pr-4 py-3 text-sm text-cyan-300 font-mono outline-none transition-all"
                  placeholder="rahul.verma"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Account Passphrase (Type naturally to train cadence)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl pl-11 pr-4 py-3 text-sm text-cyan-300 font-mono outline-none transition-all tracking-widest"
                  placeholder="••••••••••••"
                  required
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Type in the fields to see flight & dwell telemetry update in real time.
              </span>
            </div>

            {/* Simulation Attack Controls */}
            <div className="p-4 rounded-2xl bg-[#050814] border border-slate-800 space-y-3">
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider block font-bold">
                Threat Simulation Sandbox (For Evaluator Testing):
              </span>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer bg-[#080d21]">
                <div className="flex items-center space-x-2.5">
                  <Bot className={`w-4 h-4 ${simulateBot ? 'text-red-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Simulate Robotic / Credential-Stuffing Attack
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Dispatches key events with &lt;2ms velocity and uniform variance
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simulateBot}
                  onChange={(e) => setSimulateBot(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer bg-[#080d21]">
                <div className="flex items-center space-x-2.5">
                  <Globe className={`w-4 h-4 ${simulateSuspiciousIp ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Simulate Tor / Anonymous VPN Proxy IP
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Simulates suspicious autonomous system number (ASN) origin
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simulateSuspiciousIp}
                  onChange={(e) => setSimulateSuspiciousIp(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold font-mono bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Biometrics...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate with Behavioral Profiler</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Keystroke Telemetry & Evaluation Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Keystroke Rhythm Telemetry</span>
              <span className="text-cyan-400 text-[10px]">Live Capture</span>
            </h3>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#050814] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Dwell Time (Key Pressed)</span>
                <span className="text-xl font-bold font-mono text-cyan-400">{avgDwell} ms</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Human Avg: 80-120ms</span>
              </div>
              <div className="bg-[#050814] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Flight Time (Inter-Key)</span>
                <span className="text-xl font-bold font-mono text-cyan-400">{avgFlight} ms</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Human Avg: 90-180ms</span>
              </div>
            </div>

            {/* Captured Keystroke Trail */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Recent Key Events ({keystrokes.length})
              </span>
              <div className="bg-[#050814] rounded-xl p-3 border border-slate-800/80 min-h-[90px] flex flex-wrap gap-1.5 items-center">
                {keystrokes.length === 0 ? (
                  <span className="text-xs text-slate-600 font-mono italic">Start typing above to record cadence...</span>
                ) : (
                  keystrokes.map((k, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-[10px] font-mono bg-[#0c1433] border border-cyan-800/60 text-cyan-300"
                    >
                      {k.key} <span className="text-slate-500">{k.dwell_time_ms}ms</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Last Login Verdict Banner */}
          {authResponse && (
            <div
              className={`p-5 rounded-2xl border transition-all animate-fade-in ${
                authResponse.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 glow-safe text-emerald-200'
                  : 'bg-red-950/40 border-red-500/50 glow-danger text-red-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-mono font-bold text-sm mb-1.5">
                {authResponse.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Behavioral Cadence Verified (Trust Score: {authResponse.trust_score}%)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span>Anomalous Cadence Flagged (Trust Score: {authResponse.trust_score}%)</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{authResponse.message}</p>

              {/* Risk Factors */}
              {authResponse.risk_factors?.length > 0 && (
                <ul className="mt-3 space-y-1 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                  {authResponse.risk_factors.map((rf, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span>•</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step-Up 2FA Challenge Modal */}
      {showStepUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0f0714] border border-red-500/60 rounded-2xl p-6 shadow-2xl glow-danger relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500 text-red-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase">
                  STEP-UP SECURITY CHALLENGE
                </span>
                <h3 className="text-base font-bold text-white">Anomalous Cadence Detected</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your keystroke velocity matched automated credential-stuffing patterns. Please complete two-factor authentication to verify you are a genuine human user.
            </p>

            <div className="mb-4">
              <label className="text-xs font-mono text-slate-400 block mb-1.5">
                Enter 6-Digit Out-Of-Band OTP (Demo Code: 123456)
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full bg-[#050814] border border-slate-700 focus:border-red-400 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-cyan-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2"
              >
                <span>{verifyingOtp ? 'Verifying...' : 'Verify & Elevate Trust'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowStepUpModal(false)}
                className="py-3 px-4 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
