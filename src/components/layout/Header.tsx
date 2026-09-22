import React from 'react';
import { ShieldAlert, RefreshCw, Zap, Sun, Moon, Laptop, Smartphone } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../hooks/useDevice';
import { formatUsd } from '../../utils/formatters';
import { WalletProfileDropdown } from '../wallet/WalletProfileDropdown';

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
    robinhoodChainStatus,
    toggleRobinhoodChain,
  } = useTradingStore();

  const { resolvedTheme, toggleTheme } = useTheme();
  const { isMobile, deviceType } = useDevice();

  const totalUnrealizedPnl = openPositions.reduce((acc, p) => acc + p.unrealizedPnlUsd, 0);

  return (
    <header className="border-b border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c0e14]/95 px-3 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-40 backdrop-blur-sm transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Connection Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 dark:text-zinc-100 font-mono truncate">
                <span className="sm:hidden">TOKEN INTEL</span>
                <span className="hidden sm:inline">TOKEN INTELLIGENCE</span>{' '}
                <span className="text-sky-600 dark:text-sky-400 font-semibold">&amp; SNIPER</span>
              </span>

              {/* Status Badge */}
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>

              {/* Solana WSS on Desktop */}
              <button
                onClick={() => toggleSolanaWs(solanaWsStatus !== 'CONNECTED')}
                className={`hidden sm:flex px-2 py-0.5 rounded text-[10px] font-mono items-center gap-1.5 border transition ${
                  solanaWsStatus === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : solanaWsStatus === 'CONNECTING'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700/50'
                }`}
                title="Solana WebSocket logsSubscribe status. Click to connect or disconnect."
              >
                <span className={`w-1.5 h-1.5 rounded-full ${solanaWsStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                SOL WSS: {solanaWsStatus}
              </button>

              {/* Robinhood L2 on Desktop */}
              <button
                onClick={() => toggleRobinhoodChain(robinhoodChainStatus !== 'CONNECTED')}
                className={`hidden md:flex px-2 py-0.5 rounded text-[10px] font-mono items-center gap-1.5 border transition ${
                  robinhoodChainStatus === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : robinhoodChainStatus === 'CONNECTING'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700/50'
                }`}
                title="Robinhood Chain Arbitrum Orbit L2 RPC stream. Click to connect or disconnect."
              >
                <span className={`w-1.5 h-1.5 rounded-full ${robinhoodChainStatus === 'CONNECTED' ? 'bg-[#00c805] animate-pulse' : 'bg-slate-400'}`}></span>
                RH L2: {robinhoodChainStatus}
              </button>

              {/* Device Detection Pill */}
              <span
                className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50"
                title={`Detected client environment: ${deviceType.toUpperCase()}`}
              >
                {isMobile ? <Smartphone className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
                <span>{deviceType.toUpperCase()}</span>
              </span>
            </div>

            <p className="hidden md:flex text-[11px] text-slate-500 dark:text-zinc-400 font-mono items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              HUMAN-IN-THE-LOOP TERMINAL • SOLANA • BNB CHAIN • ROBINHOOD
            </p>
          </div>
        </div>

        {/* Center: Quick Chain Selector (Desktop Only) */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
          {(['all', 'solana', 'bsc', 'robinhood'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setFilter({ chain: ch })}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filter.chain === ch
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700/50 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {ch === 'all' ? 'ALL CHAINS' : ch === 'solana' ? 'SOLANA' : ch === 'bsc' ? 'BNB CHAIN' : 'ROBINHOOD'}
            </button>
          ))}
        </div>

        {/* Center-Right: Metrics Bar (Tablet / Desktop) */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono border-l border-r border-slate-200 dark:border-zinc-800 px-4">
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">Discovered</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200">{tokens.length} tokens</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">Monitors</div>
            <div className="font-semibold text-amber-600 dark:text-amber-400">{pendingSetups.length} waiting</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">Positions</div>
            <div className="font-semibold text-sky-600 dark:text-sky-400">{openPositions.length} active</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">PnL</div>
            <div className={`font-semibold ${totalUnrealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{formatUsd(totalUnrealizedPnl)}
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300 transition shadow-sm flex items-center gap-1.5 font-mono text-xs"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            )}
            <span className="hidden sm:inline text-[11px] font-medium">
              {resolvedTheme === 'dark' ? 'LIGHT' : 'DARK'}
            </span>
          </button>

          {/* Refresh Scanner */}
          <button
            onClick={() => refreshTokens()}
            disabled={isScanning}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 rounded-md border border-slate-200 dark:border-zinc-700/60 transition shadow-sm"
            title="Rescan multi-DEX pools for new launches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-zinc-400'}`} />
            <span className="hidden sm:inline">{isScanning ? 'SCANNING...' : 'SCAN POOLS'}</span>
          </button>

          {/* Web3 Non-Custodial Wallet Connector & Profile */}
          <WalletProfileDropdown />

          {/* Safe Public Execution Badge (Desktop Only) */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300"
            title="Public Safe Execution: Orders evaluate against live order books and real-time prices without risking real user funds."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400"></span>
            <span>PAPER TRADING</span>
          </div>

          {/* Emergency Kill Switch */}
          <button
            onClick={() => toggleKillSwitch(!isKillSwitchActive)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-mono font-semibold rounded-md transition shadow-sm ${
              isKillSwitchActive
                ? 'bg-rose-600 text-white animate-pulse border border-rose-500'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/40'
            }`}
            title="Emergency Kill Switch: Halts all bot monitoring and trade executions immediately"
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">{isKillSwitchActive ? 'HALTED (RESUME)' : 'KILL SWITCH'}</span>
            <span className="sm:hidden">{isKillSwitchActive ? 'HALTED' : 'KILL'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
