import React, { useState, useEffect } from 'react';
import { api } from './api';
import Header from './components/Header';
import UpiPaymentSimulator from './components/UpiPaymentSimulator';
import VoiceAnalyzer from './components/VoiceAnalyzer';
import BehavioralLogin from './components/BehavioralLogin';
import FraudDashboard from './components/FraudDashboard';
import { ShieldCheck, Lock, Activity, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' | 'voice' | 'auth' | 'dashboard'
  const [userProfile, setUserProfile] = useState({
    username: 'rahul.verma',
    full_name: 'Rahul Verma',
    balance: 74500.0,
    upi_id: 'rahul@kavach',
  });
  const [freezeStatus, setFreezeStatus] = useState({ is_frozen: false, remaining_seconds: 0 });
  const [authTrustScore, setAuthTrustScore] = useState(96);

  useEffect(() => {
    loadInitialState();
    // Poll freeze status every 5 seconds to keep synchronized
    const interval = setInterval(checkFreeze, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialState = async () => {
    try {
      const [profileData, freezeData] = await Promise.all([
        api.getProfile(),
        api.getFreezeStatus(),
      ]);
      if (profileData) setUserProfile(profileData);
      if (freezeData) setFreezeStatus(freezeData);
    } catch (err) {
      console.warn('Initial state fetch (server may be booting)', err);
    }
  };

  const checkFreeze = async () => {
    try {
      const data = await api.getFreezeStatus();
      if (data) setFreezeStatus(data);
    } catch (err) {
      // Ignore polling errors
    }
  };

  const handleUnfreeze = async () => {
    try {
      const res = await api.toggleFreeze('UNFREEZE');
      setFreezeStatus(res);
    } catch (err) {
      console.error('Failed to unfreeze', err);
    }
  };

  const handleBalanceUpdate = (newBal) => {
    setUserProfile((prev) => ({ ...prev, balance: newBal }));
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Cybersecurity Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        freezeStatus={freezeStatus}
        onUnfreeze={handleUnfreeze}
        authTrustScore={authTrustScore}
      />

      {/* Main Feature Content Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'payment' && (
          <UpiPaymentSimulator
            onBalanceUpdate={handleBalanceUpdate}
            freezeStatus={freezeStatus}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceAnalyzer
            freezeStatus={freezeStatus}
            onFreezeUpdate={(status) => setFreezeStatus(status)}
          />
        )}

        {activeTab === 'auth' && (
          <BehavioralLogin
            onLoginSuccess={(user) => {
              if (user) setUserProfile((prev) => ({ ...prev, ...user }));
              setActiveTab('payment');
            }}
            currentTrustScore={authTrustScore}
            onTrustScoreUpdate={(score) => setAuthTrustScore(score)}
          />
        )}

        {activeTab === 'dashboard' && <FraudDashboard />}
      </main>

      {/* Cyber Fintech Hackathon Footer */}
      <footer className="border-t border-slate-900 bg-[#04060f] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-bold">KavachPay</span>
            <span>— Cybersecurity & FinTech Autonomous Defense Suite</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>NPCI / UPI Protocol Ready</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>FastAPI + SQLite + React 19 + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
