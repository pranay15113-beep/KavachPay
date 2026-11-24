import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  QrCode,
  Send,
  Download,
  Info,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import PreTransactionModal from './PreTransactionModal';

export default function UpiPaymentSimulator({ onBalanceUpdate, freezeStatus, onNavigateToDashboard }) {
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  
  // Form State
  const [receiverVpa, setReceiverVpa] = useState('refund-support@okaxis');
  const [amount, setAmount] = useState('12');
  const [transactionType, setTransactionType] = useState('PAY'); // PAY, COLLECT_REQUEST, QR_PAY
  const [note, setNote] = useState('Electricity Overpayment Refund Verification Fee');
  
  // Engine State
  const [isScanning, setIsScanning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await api.getPaymentPresets();
      setPresets(data);
    } catch (err) {
      console.error('Failed to load presets', err);
    }
  };

  const handleApplyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setReceiverVpa(preset.vpa);
    setAmount(preset.amount.toString());
    setTransactionType(preset.type);
    setNote(preset.note);
    setExecutionResult(null);
    setRiskData(null);
  };

  // Run Pre-Flight Threat Scan
  const handleScanThreat = async () => {
    if (!receiverVpa || !amount) return;
    setIsScanning(true);
    setExecutionResult(null);
    try {
      const result = await api.checkPaymentRisk({
        receiver_vpa: receiverVpa.trim(),
        amount: parseFloat(amount) || 0,
        transaction_type: transactionType,
        note: note.trim(),
      });
      setRiskData(result);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Scan error', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Execute Payment
  const handleConfirmPayment = async (overrideCoolingOff = false) => {
    setIsExecuting(true);
    try {
      const result = await api.executePayment({
        receiver_vpa: receiverVpa.trim(),
        amount: parseFloat(amount) || 0,
        transaction_type: transactionType,
        note: note.trim(),
        override_cooling_off: overrideCoolingOff,
        user_acknowledged_risk: overrideCoolingOff,
      });

      setExecutionResult(result);
      setIsModalOpen(false);

      if (result.success && onBalanceUpdate) {
        onBalanceUpdate(result.new_balance);
      }
    } catch (err) {
      console.error('Execute error', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReportVpa = async (vpaToReport, desc) => {
    try {
      await api.reportVpa({
        vpa: vpaToReport,
        category: 'IMPERSONATION_PHISHING',
        description: desc || 'Flagged and blocked in KavachPay pre-transaction simulator.',
      });
      setIsModalOpen(false);
      setExecutionResult({
        success: false,
        status: 'BLOCKED_AND_REPORTED',
        risk_score: 98,
        message: `VPA ${vpaToReport} permanently reported and synced to National Threat Registry.`,
      });
      if (onNavigateToDashboard) onNavigateToDashboard();
    } catch (err) {
      console.error('Report error', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Feature Intro Card */}
      <div className="bg-gradient-to-r from-[#0b1329] via-[#0d1838] to-[#0b1329] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Autonomous Pre-Transaction Protection Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              UPI Scam & Trap Interceptor
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Analyzes VPA pattern heuristics, detects disguised "Collect-Request" traps, cross-references SQLite crowdsourced blacklists, and intercepts fraudulent money transfers before funds leave your bank.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#070b1a] px-4 py-3 rounded-xl border border-cyan-900/60 font-mono text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-emerald-400 font-bold">Heuristic Defense Active</div>
              <div className="text-[11px] text-slate-400">Zero-Latency Client-Side Guard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Attack & Defense Scenarios (Click to Load):</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">5 Scenarios Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => {
            const isRed = p.expected_tier === 'RED';
            const isAmber = p.expected_tier === 'AMBER';
            const isSelected = selectedPresetId === p.id;

            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-800 bg-[#090e24]/70 hover:border-slate-700 hover:bg-[#0c1433]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-white flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRed ? 'bg-red-400' : isAmber ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span>{p.name}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isRed
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : isAmber
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {p.expected_tier}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 truncate mb-1">{p.vpa}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Payment Simulator Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mobile UPI Simulator Interface */}
        <div className="lg:col-span-7 bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span className="font-mono font-bold text-sm text-white">UPI Payment Gateway Simulator</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              SANDBOX SIMULATION
            </span>
          </div>

          <div className="space-y-5">
            {/* Transaction Type Selector */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Transaction Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType('PAY')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-1.5 border ${
                    transactionType === 'PAY'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Direct Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('COLLECT_REQUEST')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-1.5 border ${
                    transactionType === 'COLLECT_REQUEST'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Collect Trap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('QR_PAY')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-1.5 border ${
                    transactionType === 'QR_PAY'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Payload</span>
                </button>
              </div>

              {transactionType === 'COLLECT_REQUEST' && (
                <div className="mt-2 bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5 text-[11px] text-amber-200 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Simulating incoming UPI Collect Request. Scammers disguise these as "Cashback" or "Receive Lottery" to trick victims into entering their UPI PIN.
                  </span>
                </div>
              )}
            </div>

            {/* Payee VPA / UPI ID Input */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Recipient UPI VPA / Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={receiverVpa}
                  onChange={(e) => {
                    setReceiverVpa(e.target.value);
                    setRiskData(null);
                  }}
                  placeholder="e.g. refund-support@okaxis"
                  className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-cyan-300 font-mono outline-none transition-all placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setReceiverVpa('refund-support@okaxis')}
                  className="absolute right-3 top-3 text-[11px] font-mono text-slate-500 hover:text-cyan-400"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Amount (₹) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Transfer Amount (₹)
                </label>
                <span className="text-[11px] font-mono text-slate-500">Historical Peer Avg: ₹1,200</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-bold text-slate-500 font-mono">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setRiskData(null);
                  }}
                  placeholder="1000"
                  className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-white font-mono outline-none transition-all"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center space-x-2 mt-2">
                {['12', '650', '8500', '15000', '45000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setRiskData(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      amount === amt
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Note / Remarks */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Payment Remark / Request Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setRiskData(null);
                }}
                placeholder="e.g. Claim ₹15,000 Scratch Card Cashback"
                className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder-slate-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={isScanning || !receiverVpa || !amount}
                onClick={handleScanThreat}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-xs font-bold font-mono bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Signals...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Scan Pre-Flight Threat</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isScanning || isExecuting || !receiverVpa || !amount}
                onClick={handleScanThreat}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>Authorize Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Risk Radar & Results Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Threat Status Card */}
          <div className="bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Risk Evaluation Radar</span>
              <span className="text-cyan-400 text-[10px]">Real-time Heuristics</span>
            </h3>

            {/* Risk Gauge Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 text-xs font-mono">
                <span className="text-slate-400">Threat Probability</span>
                <span
                  className={`font-bold text-sm ${
                    riskData?.risk_tier === 'RED'
                      ? 'text-red-400'
                      : riskData?.risk_tier === 'AMBER'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {riskData ? `${riskData.risk_score} / 100` : 'Ready to Scan'}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    riskData?.risk_tier === 'RED'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-sm shadow-red-500'
                      : riskData?.risk_tier === 'AMBER'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  }`}
                  style={{ width: `${riskData ? riskData.risk_score : 15}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0 (Safe)</span>
                <span>30 (Caution)</span>
                <span>70 (Scam Block)</span>
                <span>100 (Critical)</span>
              </div>
            </div>

            {/* Core Check Parameters */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050814] border border-slate-800">
                <span className="text-slate-400">VPA Deceptive Phishing Check</span>
                <span className="text-cyan-400 text-[11px]">Pattern Engine Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050814] border border-slate-800">
                <span className="text-slate-400">Disguised Collect Trap Detection</span>
                <span className="text-cyan-400 text-[11px]">NPCI Trap Analyzer</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050814] border border-slate-800">
                <span className="text-slate-400">Crowdsourced Scam SQLite Blacklist</span>
                <span className="text-cyan-400 text-[11px]">340+ VPAs Synced</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050814] border border-slate-800">
                <span className="text-slate-400">Amount Variance Anomaly</span>
                <span className="text-cyan-400 text-[11px]">Sigma Deviation</span>
              </div>
            </div>
          </div>

          {/* Execution Result Banner */}
          {executionResult && (
            <div
              className={`p-5 rounded-2xl border transition-all animate-fade-in ${
                executionResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 glow-safe text-emerald-200'
                  : 'bg-red-950/40 border-red-500/50 glow-danger text-red-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-mono font-bold text-sm mb-1">
                {executionResult.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Transaction Authorized & Completed</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span>Payment Blocked by KavachPay</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{executionResult.message}</p>
              {executionResult.transaction_id && (
                <div className="mt-2 text-[11px] font-mono text-slate-400">
                  Ref ID: {executionResult.transaction_id}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pre-Transaction Intervention Modal (Green / Amber / Red) */}
      <PreTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        riskData={riskData}
        onConfirmPayment={handleConfirmPayment}
        onReportVpa={handleReportVpa}
        isExecuting={isExecuting}
      />
    </div>
  );
}
