import React from 'react';
import { ShieldAlert, Play, RefreshCw, Zap } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { formatUsd } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    tokens,
    pendingSetups,
    openPositions,
    isDemoMode,
    isKillSwitchActive,
    filter,
    setFilter,
    setMode,
    toggleKillSwitch,
    refreshTokens,
    isScanning,
    runFullDemoScenario,
    solanaWsStatus,
    toggleSolanaWs,
  } = useTradingStore();

  const totalUnrealizedPnl = openPositions.reduce((acc, p) => acc + p.unrealizedPnlUsd, 0);

  return (
    <header className="border-b border-slate-800 bg-[#0d1322] px-4 py-2.5 sticky top-0 z-40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Connection */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white font-mono">
                TOKEN INTELLIGENCE <span className="text-cyan-400">&amp; SNIPER</span>
              </span>
              {isDemoMode ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  DEMO MODE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE DATA
                </span>
              )}
              <button
                onClick={() => toggleSolanaWs(solanaWsStatus !== 'CONNECTED')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 border transition ${
                  solanaWsStatus === 'CONNECTED'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
                    : solanaWsStatus === 'CONNECTING'
                    ? 'bg-amber-950/70 text-amber-300 border-amber-700 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Solana WebSocket logsSubscribe status. Click to connect or disconnect."
              >
                <span className={`w-1.5 h-1.5 rounded-full ${solanaWsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                SOL WSS: {solanaWsStatus}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              HUMAN-IN-THE-LOOP TERMINAL • SOLANA &amp; BNB CHAIN
            </p>
          </div>
        </div>

        {/* Center: Quick Chain Selector */}
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
          {(['all', 'solana', 'bsc'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setFilter({ chain: ch })}
              className={`px-3 py-1 rounded-md transition-all ${
                filter.chain === ch
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ch === 'all' ? 'ALL CHAINS' : ch === 'solana' ? 'SOLANA' : 'BNB CHAIN'}
            </button>
          ))}
        </div>

        {/* Center-Right: Metrics Bar */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono border-l border-r border-slate-800 px-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Discovered</div>
            <div className="font-bold text-slate-200">{tokens.length} tokens</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Monitors</div>
            <div className="font-bold text-amber-300">{pendingSetups.length} waiting</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Positions</div>
            <div className="font-bold text-cyan-300">{openPositions.length} active</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Unrealized PnL</div>
            <div className={`font-bold ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{formatUsd(totalUnrealizedPnl)}
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Scanner */}
          <button
            onClick={() => refreshTokens()}
            disabled={isScanning}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded border border-slate-800 transition"
            title="Rescan DEX pools"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Mode Switcher Toggle */}
          <button
            onClick={() => setMode(!isDemoMode)}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition ${
              isDemoMode
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/40'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/40'
            }`}
          >
            Switch to {isDemoMode ? 'LIVE' : 'DEMO'}
          </button>

          {/* Run Demo Scenario Button */}
          <button
            onClick={runFullDemoScenario}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-semibold rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Demo Scenario
          </button>

          {/* Emergency Kill Switch */}
          <button
            onClick={() => toggleKillSwitch(!isKillSwitchActive)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded transition shadow-sm ${
              isKillSwitchActive
                ? 'bg-red-600 text-white animate-pulse border border-red-500'
                : 'bg-red-950/40 text-red-400 border border-red-800/80 hover:bg-red-900/40'
            }`}
            title="Emergency Kill Switch: Halts all bot monitoring and trade executions immediately"
          >
            <ShieldAlert className="w-4 h-4" />
            {isKillSwitchActive ? 'HALTED (CLICK TO RESUME)' : 'KILL SWITCH'}
          </button>
        </div>
      </div>
    </header>
  );
};
