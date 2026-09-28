import React, { useState, useEffect, useRef } from 'react';
import { Clock, Globe, Moon, ChevronDown, Sparkles } from 'lucide-react';
import { marketSessionEngine, MarketSessionInfo } from '../../engines/marketSessionEngine';

export const MarketSessionClock: React.FC = () => {
  const [session, setSession] = useState<MarketSessionInfo>(() => marketSessionEngine.getSessionInfo());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSession(marketSessionEngine.getSessionInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close flyout on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getBadgeStyle = () => {
    if (session.isApexOverlap) {
      return 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-sm animate-pulse';
    }
    if (session.isGoldenWindow) {
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 shadow-sm';
    }
    if (session.isDeadZone) {
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/35';
    }
    if (session.primarySession === 'EUROPE') {
      return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/35';
    }
    return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35';
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Header Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer ${getBadgeStyle()}`}
        title="Playbook Ch. 16 Market Session Clock. Click to view 24h liquidity windows."
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold tracking-wider">{session.utcTimeString.slice(0, 5)} UTC</span>
        <span className="opacity-40">•</span>
        <span className="font-bold">{session.sessionBadge}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Flyout Modal / Tooltip Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl p-3.5 z-50 font-mono text-xs text-slate-800 dark:text-zinc-200 space-y-3 animate-in fade-in-50 slide-in-from-top-2">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                GLOBAL MARKET CLOCK
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Playbook Ch. 16</span>
          </div>

          {/* Current Live Session Hero */}
          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-medium">CURRENT SESSION:</span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-zinc-100">{session.sessionName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400">Liquidity Depth:</span>
              <span
                className={`font-semibold ${
                  session.liquidityTier === 'MAXIMUM'
                    ? 'text-amber-500 font-bold'
                    : session.liquidityTier === 'HIGH'
                    ? 'text-emerald-500'
                    : session.liquidityTier === 'LOW'
                    ? 'text-rose-500'
                    : 'text-sky-400'
                }`}
              >
                {session.liquidityTier} ({session.volumeMultiplier})
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400">Live UTC Time:</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100">{session.utcTimeString}</span>
            </div>
          </div>

          {/* Tactical Playbook Guidance */}
          <div
            className={`p-2.5 rounded-md border text-[11px] leading-relaxed ${
              session.isDeadZone
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                : session.isApexOverlap
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/30'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              {session.isDeadZone ? <Moon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Tactical Session Strategy:</span>
            </div>
            <p>{session.optimalAction}</p>
            <p className="mt-1 text-[10px] opacity-90">{session.playbookGuidance}</p>
          </div>

          {/* 24-Hour Playbook Session Schedule Grid */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
              24-Hour Global Windows (UTC):
            </span>
            <div className="space-y-1 text-[11px]">
              <div
                className={`p-1.5 rounded flex items-center justify-between ${
                  session.activeSessions.includes('ASIA') && !session.isApexOverlap && !session.isDeadZone
                    ? 'bg-emerald-500/15 font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>🌏 Asia (Tokyo/SG)</span>
                <span>00:00 – 08:00 UTC</span>
              </div>
              <div
                className={`p-1.5 rounded flex items-center justify-between ${
                  session.activeSessions.includes('EUROPE') && !session.isApexOverlap
                    ? 'bg-indigo-500/15 font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>🇪🇺 Europe (London)</span>
                <span>07:00 – 15:00 UTC</span>
              </div>
              <div
                className={`p-1.5 rounded flex items-center justify-between ${
                  session.isApexOverlap
                    ? 'bg-amber-500/20 font-bold text-amber-600 dark:text-amber-300 border border-amber-500/40'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>🔥 Apex Overlap (EU+US)</span>
                <span>13:00 – 15:00 UTC</span>
              </div>
              <div
                className={`p-1.5 rounded flex items-center justify-between ${
                  session.isGoldenWindow && !session.isApexOverlap
                    ? 'bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>🇺🇸 US Golden Window</span>
                <span>13:00 – 18:00 UTC</span>
              </div>
              <div
                className={`p-1.5 rounded flex items-center justify-between ${
                  session.isDeadZone
                    ? 'bg-rose-500/15 font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>🌙 Dead Zone (Touch Grass)</span>
                <span>21:00 – 00:00 UTC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
