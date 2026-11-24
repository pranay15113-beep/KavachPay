import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, Activity } from 'lucide-react';

export default function AudioWaveform({ isPlaying, onTogglePlay, duration = '0:18', title }) {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    // Generate 32 bars with pseudo-random heights
    const initial = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      height: 20 + Math.sin(i * 0.4) * 15 + Math.random() * 25,
    }));
    setBars(initial);

    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setBars((prev) =>
          prev.map((b) => ({
            ...b,
            height: Math.max(12, Math.min(85, b.height + (Math.random() * 30 - 15))),
          }))
        );
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-[#090e21] border border-cyan-900/50 rounded-xl p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className={`w-4 h-4 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-xs font-mono tracking-wider uppercase text-cyan-300">
            {isPlaying ? 'Live Audio Signal Analysis Active' : 'Audio Stream Ready'}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">{duration}</span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onTogglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50 scale-105'
              : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-white border border-cyan-500/30'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
        </button>

        <div className="flex-1 h-14 bg-[#050814] rounded-lg px-3 flex items-center justify-between border border-slate-800/80 overflow-hidden">
          {bars.map((bar) => (
            <div
              key={bar.id}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                isPlaying
                  ? 'bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-sm shadow-cyan-400/50'
                  : 'bg-slate-700'
              }`}
              style={{ height: `${isPlaying ? bar.height : Math.max(15, bar.height * 0.4)}%` }}
            />
          ))}
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-slate-500">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400">16kHz PCM</span>
        </div>
      </div>
    </div>
  );
}
