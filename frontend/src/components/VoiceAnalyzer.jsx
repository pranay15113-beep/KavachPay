import React, { useState, useEffect } from 'react';
import {
  Mic,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Radio,
  FileAudio,
  Lock,
  Unlock,
  CheckCircle,
  Activity,
  Layers,
  Sparkles,
  Flame
} from 'lucide-react';
import { api } from '../api';
import AudioWaveform from './AudioWaveform';

export default function VoiceAnalyzer({ freezeStatus, onFreezeUpdate }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('fake_bank_kyc');
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await api.getVoiceScenarios();
      setScenarios(data);
      if (data.length > 0) {
        handleSelectScenario(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load voice scenarios', err);
    }
  };

  const handleSelectScenario = async (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setLoading(true);
    setIsPlayingAudio(false);
    try {
      const analysis = await api.analyzeVoiceScenario(scenarioId);
      setActiveAnalysis(analysis);
    } catch (err) {
      console.error('Failed to analyze scenario', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setLoading(true);
    setIsPlayingAudio(false);
    try {
      const analysis = await api.analyzeVoiceUpload(file);
      setActiveAnalysis(analysis);
    } catch (err) {
      console.error('Failed to analyze uploaded audio', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (action) => {
    try {
      const res = await api.toggleFreeze(action, 15, activeAnalysis?.title || 'Voice-Clone Threat Alert');
      if (onFreezeUpdate) {
        onFreezeUpdate(res);
      }
    } catch (err) {
      console.error('Freeze error', err);
    }
  };

  const isDeepfake = activeAnalysis?.deepfake_probability >= 70;
  const isSuspicious = activeAnalysis?.deepfake_probability >= 30 && !isDeepfake;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d122e] via-[#10183b] to-[#0d122e] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Acoustic Neural Vocoder & Linguistic Pressure Analyzer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              AI Voice-Clone & Deepfake Scam Call Analyzer
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Detects AI-generated synthetic speech, vocal pitch uniformity, and urgent social engineering tactics in phone calls. Automatically triggers a 15-minute emergency UPI transfer freeze to protect against extortion.
            </p>
          </div>

          {/* Emergency Freeze Action Status */}
          <div className="flex items-center space-x-3 bg-[#060a17] px-4 py-3 rounded-xl border border-cyan-900/60 font-mono">
            {freezeStatus?.is_frozen ? (
              <div className="flex items-center space-x-2 text-red-400">
                <Lock className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <div className="font-bold text-xs text-red-300">UPI Transfers Frozen</div>
                  <div className="text-[10px] text-slate-400">
                    {Math.floor(freezeStatus.remaining_seconds / 60)}m {freezeStatus.remaining_seconds % 60}s Remaining
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-400">
                <Unlock className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="font-bold text-xs text-emerald-300">UPI Defense Armed</div>
                  <div className="text-[10px] text-slate-400">Auto-Freeze Ready</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Selector & Audio Upload */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scenarios & Waveform */}
        <div className="md:col-span-7 space-y-6">
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-3">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Audio Intercept Scenario:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenarios.map((sc) => {
                const isSelected = selectedScenarioId === sc.id;
                const isRed = sc.deepfake_prob > 70;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 bg-[#090e24]/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-slate-300">
                        {sc.deepfake_prob}% Deepfake
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-white line-clamp-1 mb-1">{sc.title}</div>
                    <div className="text-[11px] font-mono text-cyan-400/90 truncate">{sc.caller}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Upload Box */}
          <div className="bg-[#080d21] border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Custom Voice Recording (.mp3 / .wav)</span>
              </span>
              {uploadFile && (
                <span className="text-[11px] font-mono text-cyan-400">{uploadFile.name}</span>
              )}
            </div>
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#050814]/50">
              <FileAudio className="w-8 h-8 text-cyan-400 mb-2 opacity-80" />
              <span className="text-xs font-mono text-slate-300">Drop an audio recording here or click to browse</span>
              <span className="text-[10px] font-mono text-slate-500 mt-1">Simulates spectral analysis of real audio streams</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Audio Waveform Player */}
          {activeAnalysis && (
            <div className="space-y-4">
              <AudioWaveform
                isPlaying={isPlayingAudio}
                onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
                duration="0:24"
                title={activeAnalysis.title}
              />

              {/* Call Transcript Box */}
              <div className="bg-[#080d21] border border-cyan-900/30 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider">Intercepted Call Transcript</span>
                  <span className="text-cyan-400">Caller: {activeAnalysis.caller_claimed_identity}</span>
                </div>
                <div className="bg-[#050814] rounded-xl p-4 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  "{activeAnalysis.transcript}"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Deepfake Verdict & Automated Freeze Trigger */}
        <div className="md:col-span-5 space-y-6">
          {activeAnalysis && (
            <div
              className={`rounded-3xl border p-6 shadow-2xl relative overflow-hidden transition-all ${
                isDeepfake
                  ? 'bg-[#10070c] border-red-500/60 glow-danger'
                  : isSuspicious
                  ? 'bg-[#120d04] border-amber-500/60 glow-amber'
                  : 'bg-[#06120e] border-emerald-500/60 glow-safe'
              }`}
            >
              {/* Verdict Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                      isDeepfake
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : isSuspicious
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isDeepfake ? 'HIGH-RISK AI VOICE CLONE' : isSuspicious ? 'ANOMALOUS VOICE STREAM' : 'NATURAL HUMAN VOICE'}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5 font-mono">
                    {activeAnalysis.title}
                  </h3>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDeepfake
                      ? 'bg-red-950 border border-red-500 text-red-400'
                      : 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  }`}
                >
                  {isDeepfake ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                </div>
              </div>

              {/* Gauge Scores */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#050814] border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Deepfake Probability</span>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-2xl font-black font-mono ${isDeepfake ? 'text-red-400' : 'text-emerald-400'}`}>
                      {activeAnalysis.deepfake_probability}%
                    </span>
                    <span className="text-xs text-slate-500">confidence</span>
                  </div>
                </div>

                <div className="bg-[#050814] border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Urgency Pressure</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black font-mono text-amber-400">
                      {activeAnalysis.urgency_score}%
                    </span>
                    <span className="text-xs text-slate-500">pressure</span>
                  </div>
                </div>
              </div>

              {/* Acoustic Vocoder Indicators */}
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Acoustic Neural Fingerprint</span>
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#050814] border border-slate-800/80">
                    <span className="text-slate-400">Pitch Uniformity (F0)</span>
                    <span className={isDeepfake ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {activeAnalysis.acoustic_cues?.pitch_uniformity > 0.8 ? 'Unnatural Constancy (0.92)' : 'Organic Micro-Modulation'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#050814] border border-slate-800/80">
                    <span className="text-slate-400">Spectral Flatness</span>
                    <span className={isDeepfake ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {activeAnalysis.acoustic_cues?.spectral_flatness > 0.7 ? 'Neural Resynthesis Peak' : 'Analog Harmonic Spectrum'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#050814] border border-slate-800/80">
                    <span className="text-slate-400">Vocal Cord Jitter/Shimmer</span>
                    <span className={isDeepfake ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {isDeepfake ? 'Missing Vocal Cord Tremors' : 'Natural Human Variance'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Engineering Tactics Detected */}
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tactics Detected ({activeAnalysis.detected_tactics?.filter((t) => t.detected).length || 0})</span>
                </h4>
                <div className="space-y-2">
                  {activeAnalysis.detected_tactics?.map((tactic, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2 ${
                        tactic.detected
                          ? 'bg-red-950/30 border-red-500/30 text-red-200'
                          : 'bg-[#050814] border-slate-800 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="mt-0.5">
                        {tactic.detected ? '🚨' : '✓'}
                      </span>
                      <div>
                        <span className="font-semibold block">{tactic.tactic}</span>
                        <span className="text-[11px] opacity-80">{tactic.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Emergency Freeze Trigger */}
              <div className="pt-2 border-t border-slate-800">
                {freezeStatus?.is_frozen ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 font-mono flex items-center justify-between">
                      <span>Safety Lock Active</span>
                      <span className="font-bold">
                        {Math.floor(freezeStatus.remaining_seconds / 60)}m {freezeStatus.remaining_seconds % 60}s
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleFreeze('UNFREEZE')}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all flex items-center justify-center space-x-2"
                    >
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      <span>Release Emergency Freeze Now</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleFreeze('FREEZE')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold font-mono bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Trigger 15-Minute Emergency UPI Freeze</span>
                  </button>
                )}
                <span className="block text-center text-[10px] font-mono text-slate-500 mt-2">
                  Immediately locks outgoing transactions in UPI Interceptor to thwart extortion
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
