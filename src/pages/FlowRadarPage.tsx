import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Flame,
  ShieldAlert,
  ArrowRight,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { analyzeFlowRadar } from '../engines/flowRadarEngine';
import { formatUsd, formatPercent, truncateAddress } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const FlowRadarPage: React.FC = () => {
  const {
    tokens,
    openPositions,
    isScanning,
    refreshTokens,
    openOpportunityReport,
    openTradeSetup,
    setSelectedToken,
    setActiveNav,
    manualClosePosition,
  } = useTradingStore();

  const [mobileTab, setMobileTab] = useState<'dumps' | 'inflows'>('dumps');

  const { dumps, inflows } = useMemo(() => analyzeFlowRadar(tokens), [tokens]);

  // Check if any open positions are suffering from aggressive dumping
  const affectedPositions = useMemo(() => {
    return openPositions.filter((pos) =>
      dumps.some((d) => d.tokenAddress.toLowerCase() === pos.tokenAddress.toLowerCase())
    );
  }, [openPositions, dumps]);

  const handleInspect = (tokenAddress: string) => {
    const token = tokens.find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase());
    if (token) {
      setSelectedToken(token);
      setActiveNav('TOKEN_DETAIL');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                <span>FLOW MOMENTUM &amp; DUMP RADAR</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold animate-pulse">
                  LIVE FLOW
                </span>
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Real-time detection of aggressive sell-off cascades (Urgent Exit) vs breakout buyer accumulation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshTokens()}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Refresh Flow'}</span>
            </button>
          </div>
        </div>

        {/* Emergency Alert Banner if user has open positions undergoing aggressive dumping */}
        {affectedPositions.length > 0 && (
          <div className="bg-rose-500/15 border-2 border-rose-500/50 rounded-lg p-3.5 text-rose-950 dark:text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />
              <span>URGENT WARNING: {affectedPositions.length} Active Position(s) Experiencing Aggressive Dumps</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300">
              Severe sell volume detected on tokens you currently hold. Consider immediate stop-loss execution to protect capital.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {affectedPositions.map((pos) => (
                <div
                  key={pos.id}
                  className="flex items-center gap-3 bg-white/80 dark:bg-rose-950/80 px-3 py-1.5 rounded border border-rose-400/40 text-xs"
                >
                  <span className="font-bold text-rose-700 dark:text-rose-200">${pos.tokenSymbol}</span>
                  <span className="text-[11px]">Size: {formatUsd(pos.currentValueUsd)}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">{formatPercent(pos.unrealizedPnlPercent)}</span>
                  <button
                    onClick={() => manualClosePosition(pos.id)}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition"
                  >
                    EXIT NOW
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sub-Tab Switcher */}
        <div className="flex sm:hidden border border-[var(--card-border)] rounded-lg p-1 bg-black/5 dark:bg-zinc-900/60 text-xs">
          <button
            onClick={() => setMobileTab('dumps')}
            className={`flex-1 py-1.5 rounded font-semibold text-center transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'dumps'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>URGENT DUMPS ({dumps.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('inflows')}
            className={`flex-1 py-1.5 rounded font-semibold text-center transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'inflows'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>BREAKOUT INFLOWS ({inflows.length})</span>
          </button>
        </div>

        {/* Dual Feeds Grid (Side-by-Side on Desktop, Tabbed on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* COLUMN 1: AGGRESSIVE DUMPS (URGENT SELL) */}
          <div className={`space-y-3 ${mobileTab === 'inflows' ? 'hidden sm:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-1 border-b border-rose-500/30">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  URGENT SELL &amp; AGGRESSIVE DUMPS ({dumps.length})
                </h3>
              </div>
              <span className="text-[10px] text-rose-500 font-semibold">SIGNAL: EXIT / AVOID</span>
            </div>

            {dumps.length > 0 ? (
              <div className="space-y-3">
                {dumps.map((dump) => {
                  const inPosition = openPositions.some((p) => p.tokenAddress.toLowerCase() === dump.tokenAddress.toLowerCase());

                  return (
                    <div
                      key={dump.id}
                      className="terminal-card p-3.5 sm:p-4 border-l-4 border-l-rose-500 hover:border-rose-400 transition space-y-3"
                    >
                      {/* Top Row: Symbol, Chain, Urgent Tag */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">${dump.tokenSymbol}</span>
                          <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[120px]">{dump.tokenName}</span>
                          <ChainBadge chain={dump.chain} />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          {dump.urgency.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Explanation & Reason */}
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {dump.reason}
                      </p>

                      {/* Metrics 4-Cell Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/5 dark:bg-zinc-950/60 p-2.5 rounded border border-[var(--card-border)]">
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">PRICE DROP</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            {dump.priceChangePercent.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">NET OUTFLOW</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            -{formatUsd(Math.abs(dump.netFlowUsd))}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">SELL ORDERS</span>
                          <span className="font-bold text-[var(--text-primary)]">{dump.sellCount} Sells</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">LIQ DRAIN</span>
                          <span className="font-bold text-amber-500">{dump.liquidityDrainPercent}% drain</span>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          CA: {truncateAddress(dump.tokenAddress, 4)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(dump.tokenAddress)}
                            className="px-2.5 py-1 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] text-[11px] font-medium transition"
                          >
                            Inspect Token
                          </button>
                          {inPosition && (
                            <button
                              onClick={() => {
                                const pos = openPositions.find((p) => p.tokenAddress.toLowerCase() === dump.tokenAddress.toLowerCase());
                                if (pos) manualClosePosition(pos.id);
                              }}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition"
                            >
                              Exit Position
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="terminal-card p-8 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Severe Dumps Detected</h4>
                <p className="text-[var(--text-muted)] text-[11px]">
                  All tracked tokens maintain stable sell/buy ratios with no sudden liquidity drainage.
                </p>
              </div>
            )}
          </div>

          {/* COLUMN 2: AGGRESSIVE INFLOWS (BREAKOUT BUY) */}
          <div className={`space-y-3 ${mobileTab === 'dumps' ? 'hidden sm:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-1 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  BREAKOUT INFLOWS &amp; AGGRESSIVE BUYS ({inflows.length})
                </h3>
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold">SIGNAL: BREAKOUT SCALP</span>
            </div>

            {inflows.length > 0 ? (
              <div className="space-y-3">
                {inflows.map((inflow) => {
                  const tokenObj = tokens.find((t) => t.address.toLowerCase() === inflow.tokenAddress.toLowerCase());

                  return (
                    <div
                      key={inflow.id}
                      className="terminal-card p-3.5 sm:p-4 border-l-4 border-l-emerald-500 hover:border-emerald-400 transition space-y-3"
                    >
                      {/* Top Row: Symbol, Chain, Breakout Tag */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">${inflow.tokenSymbol}</span>
                          <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[120px]">{inflow.tokenName}</span>
                          <ChainBadge chain={inflow.chain} />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {inflow.urgency.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Explanation & Reason */}
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {inflow.reason}
                      </p>

                      {/* Metrics 4-Cell Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/5 dark:bg-zinc-950/60 p-2.5 rounded border border-[var(--card-border)]">
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">SURGE</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            +{inflow.priceChangePercent.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">NET INFLOW</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatUsd(inflow.netFlowUsd)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">BUY PRESSURE</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">{inflow.buySellRatio}x Ratio</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">BUY ORDERS</span>
                          <span className="font-bold text-[var(--text-primary)]">{inflow.buyCount} Buys</span>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          CA: {truncateAddress(inflow.tokenAddress, 4)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(inflow.tokenAddress)}
                            className="px-2.5 py-1 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] text-[11px] font-medium transition"
                          >
                            Inspect
                          </button>
                          {tokenObj && (
                            <>
                              <button
                                onClick={() => openOpportunityReport(tokenObj)}
                                className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-bold transition flex items-center gap-1"
                              >
                                <span>Report</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openTradeSetup(tokenObj)}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-950 text-[11px] font-bold transition"
                              >
                                Setup Buy
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="terminal-card p-8 text-center space-y-2">
                <Flame className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Extreme Inflow Surges</h4>
                <p className="text-[var(--text-muted)] text-[11px]">
                  Waiting for high buy-pressure volume spikes exceeding normal market velocity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
