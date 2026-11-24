import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, CheckCircle, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PreTransactionModal({
  isOpen,
  onClose,
  riskData,
  onConfirmPayment,
  onReportVpa,
  isExecuting
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [countdown, setCountdown] = useState(10); // Simulated 10s cooling-off demo timer
  const [coolingOffActive, setCoolingOffActive] = useState(false);

  useEffect(() => {
    if (isOpen && riskData?.risk_tier === 'AMBER') {
      setCoolingOffActive(true);
      setCountdown(10);
      setAcknowledged(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCoolingOffActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, riskData]);

  if (!isOpen || !riskData) return null;

  const isRed = riskData.risk_tier === 'RED' || riskData.is_account_frozen;
  const isAmber = riskData.risk_tier === 'AMBER' && !riskData.is_account_frozen;
  const isSafe = riskData.risk_tier === 'SAFE' && !riskData.is_account_frozen;

  const handleSafeConfirm = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onConfirmPayment(false);
  };

  const handleAmberConfirm = () => {
    onConfirmPayment(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl transition-all relative overflow-hidden ${
          isRed
            ? 'bg-[#0f0710] border-red-500/60 glow-danger'
            : isAmber
            ? 'bg-[#120d04] border-amber-500/60 glow-amber'
            : 'bg-[#06120e] border-emerald-500/60 glow-safe'
        }`}
      >
        {/* Ambient Top Glow Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isRed
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse'
              : isAmber
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600'
              : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600'
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isRed
                  ? 'bg-red-950/80 border border-red-500 text-red-400'
                  : isAmber
                  ? 'bg-amber-950/80 border border-amber-500 text-amber-400'
                  : 'bg-emerald-950/80 border border-emerald-500 text-emerald-400'
              }`}
            >
              {isRed && <ShieldAlert className="w-7 h-7" />}
              {isAmber && <AlertTriangle className="w-7 h-7" />}
              {isSafe && <ShieldCheck className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                    isRed
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : isAmber
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isRed ? 'HIGH RISK SCAM BLOCKED' : isAmber ? 'CAUTION: RISK ELEVATED' : 'VERIFIED SAFE TRANSFER'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Risk Score: <strong className={isRed ? 'text-red-400' : isAmber ? 'text-amber-400' : 'text-emerald-400'}>{riskData.risk_score}/100</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {isRed
                  ? 'KavachPay Interceptor Halted Transaction'
                  : isAmber
                  ? 'Cooling-Off Period & Verification Required'
                  : 'Pre-Transaction Heuristics Passed'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
          >
            ✕
          </button>
        </div>

        {/* Transfer Metadata Summary */}
        <div className="bg-[#050814] rounded-xl p-3 border border-slate-800/80 mb-4 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Recipient VPA</span>
            <span className="text-cyan-300 font-bold text-sm">{riskData.receiver_vpa}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Amount</span>
            <span className="text-white font-bold text-sm">₹{Number(riskData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Explanation Banner */}
        <div
          className={`p-3.5 rounded-xl border text-xs leading-relaxed mb-4 ${
            isRed
              ? 'bg-red-950/40 border-red-500/30 text-red-200'
              : isAmber
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <p className="font-medium">{riskData.explanation}</p>
        </div>

        {/* Detected Risk Signals List */}
        <div className="mb-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Heuristic & Reputational Indicators ({riskData.signals?.length || 0})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {riskData.signals?.map((sig, idx) => (
              <div
                key={idx}
                className="bg-[#090d21] border border-slate-800/80 rounded-lg p-2.5 flex items-start space-x-2 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {sig.severity === 'CRITICAL' && <XCircle className="w-4 h-4 text-red-400" />}
                  {sig.severity === 'HIGH' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  {sig.severity === 'MEDIUM' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {sig.severity === 'SAFE' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{sig.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">+{sig.weight} pts</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini / Cyber AI Insights */}
        {riskData.gemini_insights && (
          <div className="bg-[#070b1a] border border-cyan-900/40 rounded-xl p-3 mb-5">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>KavachPay AI Autonomous Defense Insight</span>
            </div>
            <p className="text-xs text-slate-300 italic">"{riskData.gemini_insights}"</p>
          </div>
        )}

        {/* Action Controls by Tier */}
        {isRed && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onReportVpa(riskData.receiver_vpa, 'Blacklist Block Confirmation')}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold font-mono bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Block & Report VPA</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-medium font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            >
              Cancel Transfer (Safe)
            </button>
          </div>
        )}

        {isAmber && (
          <div className="space-y-3">
            <label className="flex items-start space-x-2 cursor-pointer bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/40">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-amber-600 text-amber-500 focus:ring-amber-500 bg-slate-900"
              />
              <span className="text-xs text-amber-200">
                I acknowledge the elevated risk profile and confirm that I have verified the payee's identity offline.
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                disabled={!acknowledged || isExecuting}
                onClick={handleAmberConfirm}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                  acknowledged && !isExecuting
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {coolingOffActive ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Cooling-off Active ({countdown}s)</span>
                  </>
                ) : (
                  <>
                    <span>Override Cooling-Off & Pay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Abort
              </button>
            </div>
          </div>
        )}

        {isSafe && (
          <div className="flex items-center gap-3">
            <button
              disabled={isExecuting}
              onClick={handleSafeConfirm}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isExecuting ? 'Processing Secure Transfer...' : 'Authorize Secure Transfer (₹' + Number(riskData.amount).toFixed(2) + ')'}</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
