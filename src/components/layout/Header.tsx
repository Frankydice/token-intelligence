import React from 'react';
import { ShieldAlert, RefreshCw, Zap } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { formatUsd } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    tokens,
    pendingSetups,
    openPositions,
    isKillSwitchActive,
    filter,
    setFilter,
    toggleKillSwitch,
    refreshTokens,
    isScanning,
    solanaWsStatus,
    toggleSolanaWs,
  } = useTradingStore();

  const totalUnrealizedPnl = openPositions.reduce((acc, p) => acc + p.unrealizedPnlUsd, 0);

  return (
    <header className="border-b border-zinc-800/80 bg-[#0c0e14] px-4 py-2.5 sticky top-0 z-40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Connection */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-zinc-100 font-mono">
                TOKEN INTELLIGENCE <span className="text-sky-400 font-semibold">&amp; SNIPER</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE RADAR
              </span>
              <button
                onClick={() => toggleSolanaWs(solanaWsStatus !== 'CONNECTED')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 border transition ${
                  solanaWsStatus === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : solanaWsStatus === 'CONNECTING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:text-zinc-200'
                }`}
                title="Solana WebSocket logsSubscribe status. Click to connect or disconnect."
              >
                <span className={`w-1.5 h-1.5 rounded-full ${solanaWsStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-zinc-500'}`}></span>
                SOL WSS: {solanaWsStatus}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              HUMAN-IN-THE-LOOP TERMINAL • SOLANA &amp; BNB CHAIN
            </p>
          </div>
        </div>

        {/* Center: Quick Chain Selector */}
        <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
          {(['all', 'solana', 'bsc'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setFilter({ chain: ch })}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filter.chain === ch
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {ch === 'all' ? 'ALL CHAINS' : ch === 'solana' ? 'SOLANA' : 'BNB CHAIN'}
            </button>
          ))}
        </div>

        {/* Center-Right: Metrics Bar */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono border-l border-r border-zinc-800 px-4">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Discovered</div>
            <div className="font-semibold text-zinc-200">{tokens.length} tokens</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Monitors</div>
            <div className="font-semibold text-amber-400">{pendingSetups.length} waiting</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Positions</div>
            <div className="font-semibold text-sky-400">{openPositions.length} active</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Unrealized PnL</div>
            <div className={`font-semibold ${totalUnrealizedPnl > 0 ? 'text-emerald-400' : totalUnrealizedPnl < 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
              {totalUnrealizedPnl > 0 ? '+' : ''}{formatUsd(totalUnrealizedPnl)}
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Scanner */}
          <button
            onClick={() => refreshTokens()}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md border border-zinc-700/60 transition shadow-sm"
            title="Rescan multi-DEX pools for new launches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-sky-400' : 'text-zinc-400'}`} />
            <span>{isScanning ? 'SCANNING...' : 'SCAN POOLS'}</span>
          </button>

          {/* Safe Public Execution Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-zinc-900 border border-zinc-700/60 text-zinc-300"
            title="Public Safe Execution: Orders evaluate against live order books and real-time prices without risking real user funds."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>PAPER TRADING</span>
          </div>

          {/* Emergency Kill Switch */}
          <button
            onClick={() => toggleKillSwitch(!isKillSwitchActive)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-semibold rounded-md transition shadow-sm ${
              isKillSwitchActive
                ? 'bg-rose-600 text-white animate-pulse border border-rose-500'
                : 'bg-rose-950/30 text-rose-400 border border-rose-800/40 hover:bg-rose-900/40'
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
