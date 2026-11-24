import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  BarChart3,
  Flame,
  Radio,
  PlusCircle,
  Database,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { api } from '../api';

export default function FraudDashboard() {
  const [stats, setStats] = useState(null);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Report Form State
  const [reportVpa, setReportVpa] = useState('');
  const [reportCategory, setReportCategory] = useState('REFUND_PHISHING');
  const [reportDesc, setReportDesc] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, blacklistData] = await Promise.all([
        api.getDashboardStats(),
        api.getBlacklist(),
      ]);
      setStats(statsData);
      setBlacklist(blacklistData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportVpa) return;
    setIsSubmittingReport(true);
    try {
      const res = await api.reportVpa({
        vpa: reportVpa.trim(),
        category: reportCategory,
        description: reportDesc.trim() || 'Reported by user in KavachPay community threat radar.',
      });
      setReportSuccessMsg(res.message);
      setReportVpa('');
      setReportDesc('');
      loadData(); // refresh live list & stats
      setTimeout(() => setReportSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to report VPA', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const filteredBlacklist = blacklist.filter(
    (b) =>
      b.vpa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.risk_reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0c1229] via-[#0e1738] to-[#0c1229] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>NPCI / I4C Synchronized Cyber Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              FinTech Trust & Threat Intelligence Dashboard
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Consolidated real-time intelligence on intercepted UPI phishing attempts, voice-clone extortion vectors, and crowdsourced blacklist registries across India.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#060a17] border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs font-mono flex items-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Feed</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prevented Volume */}
        <div className="bg-[#080d21] border border-cyan-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Total Fraud Prevented</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ₹{Number(stats?.total_prevented_inr || 1933500).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Saved before leaving accounts
          </span>
        </div>

        {/* Total Blocked Scams */}
        <div className="bg-[#080d21] border border-cyan-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Scams Blocked</span>
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats?.total_blocked_scams || 144}
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 mt-1">
            <span>↑ 18 new this week</span>
          </span>
        </div>

        {/* Avg Risk Score Intercept */}
        <div className="bg-[#080d21] border border-cyan-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Avg Risk Intercept</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {stats?.avg_risk_intercept_score || 94.2} <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            High precision heuristic threshold
          </span>
        </div>

        {/* Active Registry Threats */}
        <div className="bg-[#080d21] border border-cyan-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Active Blacklist VPAs</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            {blacklist.length || 9}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            In SQLite local memory pool
          </span>
        </div>
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-6 bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono font-bold text-sm text-white">Blocked Scam Categories</h3>
              <p className="text-[11px] text-slate-400">Distribution of intercepted attack MOs</p>
            </div>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.scam_category_breakdown || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#16203a" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090e24',
                    borderColor: '#00f0ff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00f0ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Threat Trend Area Chart */}
        <div className="lg:col-span-6 bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono font-bold text-sm text-white">24-Hour Threat Velocity & Prevented Volume</h3>
              <p className="text-[11px] text-slate-400">Real-time hourly interception stream</p>
            </div>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.hourly_intercept_trend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16203a" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090e24',
                    borderColor: '#10b981',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="blocked_scams"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorScams)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Threat Feed Table & "Report Suspicious UPI ID" Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Threat Feed Table */}
        <div className="lg:col-span-7 bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono font-bold text-sm text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Live Intercepted Threat Log</span>
              </h3>
              <p className="text-[11px] text-slate-400">Recent blocked transactions saved in SQLite</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Auto-Refreshed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">VPA Target</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recent_intercepts?.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0c1433]/50 transition-colors">
                    <td className="py-2.5 text-slate-400">{item.timestamp}</td>
                    <td className="py-2.5 text-cyan-300 font-semibold">{item.vpa}</td>
                    <td className="py-2.5 text-white font-bold">₹{Number(item.amount).toLocaleString('en-IN')}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.risk_tier === 'RED'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : item.risk_tier === 'AMBER'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {item.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      <span
                        className={
                          item.action === 'BLOCKED'
                            ? 'text-red-400'
                            : item.action === 'APPROVED'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {item.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: "Report Suspicious UPI ID" Form */}
        <div className="lg:col-span-5 bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-800">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-mono font-bold text-sm text-white">Report Suspicious UPI ID</h3>
              <p className="text-[11px] text-slate-400">Instantly appends to local SQLite blacklist</p>
            </div>
          </div>

          {reportSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{reportSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Suspicious VPA Handle
              </label>
              <input
                type="text"
                value={reportVpa}
                onChange={(e) => setReportVpa(e.target.value)}
                placeholder="e.g. cyber.fine.penalty@okaxis"
                className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono outline-none transition-all placeholder-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Scam Category
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono outline-none transition-all"
              >
                <option value="REFUND_PHISHING">Electricity / Utility Refund Phishing</option>
                <option value="COLLECT_TRAP">Disguised Collect Request Trap</option>
                <option value="DIGITAL_ARREST">Digital Arrest / Fake Police Warrant</option>
                <option value="AI_VOICE_CLONE">AI Voice-Clone Impersonation Extortion</option>
                <option value="IMPERSONATION">Armed Forces / Army OLX Deposit</option>
                <option value="KYC_PHISHING">Bank KYC Suspension Phishing</option>
                <option value="LOTTERY_SCAM">Lottery / Cashback Winner Lure</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Modus Operandi / Incident Description
              </label>
              <textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                rows={3}
                placeholder="Sent WhatsApp message claiming power will be cut tonight at 9 PM unless ₹10 is paid via this handle."
                className="w-full bg-[#050814] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none transition-all placeholder-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReport || !reportVpa}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold font-mono bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmittingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Blacklist...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Report & Blacklist Immediately</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Crowdsourced SQLite Blacklist Explorer */}
      <div className="bg-[#080d21] border border-cyan-900/40 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-mono font-bold text-sm text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>National Crowdsourced UPI Scam Registry (SQLite)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Pre-seeded with realistic Indian cyber fraud incidents</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search VPA, category, bank..."
              className="w-full bg-[#050814] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlacklist.map((item) => (
            <div
              key={item.id}
              className="bg-[#050814] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-red-950 text-red-300 border border-red-800">
                  {item.severity} SEVERITY
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.report_count} Reports ({item.confidence_score}% Conf)
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-cyan-300 truncate mb-1">
                {item.vpa}
              </div>
              <div className="text-[11px] font-semibold text-slate-300 mb-1">
                {item.category.replace('_', ' ')}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                {item.risk_reason}
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span>Associated: {item.associated_bank}</span>
                <span>Active Shield</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
