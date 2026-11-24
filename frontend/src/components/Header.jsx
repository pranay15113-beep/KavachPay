import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, AlertTriangle, UserCheck, Smartphone } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  userProfile,
  freezeStatus,
  onUnfreeze,
  authTrustScore
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#050814]/90 backdrop-blur-md border-b border-cyan-900/30">
      {/* Active 15-Minute Emergency Freeze Alert Banner */}
      {freezeStatus?.is_frozen && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-500/40 px-4 py-2 text-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
              <span className="font-semibold text-red-200">
                EMERGENCY UPI FREEZE ACTIVE:
              </span>
              <span className="text-red-300/90 text-xs sm:text-sm">
                All outgoing UPI debits locked ({Math.floor(freezeStatus.remaining_seconds / 60)}m {freezeStatus.remaining_seconds % 60}s remaining).
              </span>
            </div>
            <button
              onClick={onUnfreeze}
              className="text-xs bg-red-500 hover:bg-red-400 text-black font-bold px-3 py-1 rounded-md transition-all shadow-md shadow-red-500/30 flex items-center space-x-1"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Release Safety Lock</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Shield Status */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('payment')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070c1e] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  Kavach<span className="text-cyan-400">Pay</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  v1.0 DEFENSE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>NPCI / UPI Autonomous Interceptor</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#090f26] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'payment'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UPI Fraud Interceptor
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'voice'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>AI Voice Scam Analyzer</span>
              {freezeStatus?.is_frozen && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'auth'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Behavioral Biometrics
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Threat Intelligence
            </button>
          </nav>

          {/* User Account / Trust Badge */}
          <div className="flex items-center space-x-3">
            {/* Account Balance */}
            <div className="hidden sm:block text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400">Protected Balance</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                ₹{Number(userProfile?.balance || 74500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Behavioral Trust Score Pill */}
            <div
              onClick={() => setActiveTab('auth')}
              className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center space-x-1.5 border transition-all ${
                authTrustScore >= 70
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:border-emerald-500'
                  : 'bg-red-950/60 text-red-300 border-red-500/30 hover:border-red-500 animate-pulse'
              }`}
              title="Click to inspect Behavioral Cadence & Biometrics"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{authTrustScore}% Trust</span>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-[11px]">
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-2 py-1 rounded ${activeTab === 'payment' ? 'text-cyan-300 font-bold bg-cyan-950/60' : 'text-slate-400'}`}
          >
            UPI Intercept
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-2 py-1 rounded ${activeTab === 'voice' ? 'text-cyan-300 font-bold bg-cyan-950/60' : 'text-slate-400'}`}
          >
            Voice Clone
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-2 py-1 rounded ${activeTab === 'auth' ? 'text-cyan-300 font-bold bg-cyan-950/60' : 'text-slate-400'}`}
          >
            Behavioral
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded ${activeTab === 'dashboard' ? 'text-cyan-300 font-bold bg-cyan-950/60' : 'text-slate-400'}`}
          >
            Threat Feed
          </button>
        </div>
      </div>
    </header>
  );
}
