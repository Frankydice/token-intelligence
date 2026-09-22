import React from 'react';
import { DollarSign, Play, XCircle, TrendingUp } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd, formatPercent, truncateAddress, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const PositionsPage: React.FC = () => {
  const { openPositions, manualClosePosition, tickSimulation } = useTradingStore();

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                ACTIVE OPEN POSITIONS ({openPositions.length})
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Monitoring live price, PnL, liquidity changes, and automated Take Profit &amp; Stop Loss conditions.
              </p>
            </div>
          </div>

          {openPositions.length > 0 && (
            <button
              onClick={tickSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] font-medium transition shadow-sm text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Take Profit Trigger
            </button>
          )}
        </div>

        {openPositions.length > 0 ? (
          <div className="space-y-3">
            {openPositions.map((pos) => (
              <div key={pos.id} className="terminal-card p-4 sm:p-5 space-y-4 border-l-2 border-l-sky-500">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-black/5 dark:bg-zinc-800/80 border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] font-semibold text-xs shrink-0">
                      {pos.tokenSymbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base text-[var(--text-primary)]">${pos.tokenSymbol}</span>
                        <span className="text-[var(--text-muted)]">({pos.tokenName})</span>
                        <ChainBadge chain={pos.chain} />
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          POSITION ACTIVE
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">
                        Entry Tx:{' '}
                        <a
                          href={getExplorerUrl(pos.entryTxHash, pos.chain, 'tx')}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-500 hover:underline"
                        >
                          {truncateAddress(pos.entryTxHash, 6)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => manualClosePosition(pos.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 transition font-medium text-xs"
                    >
                      <XCircle className="w-4 h-4" />
                      Manual Market Exit
                    </button>
                  </div>
                </div>

                {/* Primary Financial Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-center">
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">ENTRY PRICE</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">
                      {formatUsd(pos.entryPrice, 6)}
                    </div>
                  </div>

                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">CURRENT PRICE</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">
                      {formatUsd(pos.currentPrice, 6)}
                    </div>
                  </div>

                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">POSITION VALUE</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">
                      {formatUsd(pos.currentValueUsd)}
                    </div>
                  </div>

                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">UNREALIZED PnL</span>
                    <div className={`font-semibold text-sm mt-0.5 flex items-center justify-center gap-1 ${pos.unrealizedPnlUsd >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{pos.unrealizedPnlUsd >= 0 ? '+' : ''}{formatUsd(pos.unrealizedPnlUsd)} ({formatPercent(pos.unrealizedPnlPercent)})</span>
                    </div>
                  </div>

                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">TAKE PROFIT TARGET</span>
                    <div className="font-semibold text-emerald-500 dark:text-emerald-400 text-sm mt-0.5">
                      {formatUsd(pos.takeProfitPrice, 6)}
                    </div>
                  </div>
                </div>

                {/* Exit Conditions Bar */}
                <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                  <div>
                    Stop Loss Floor: <strong className="text-rose-500 dark:text-rose-400">{formatUsd(pos.stopLossPrice, 6)}</strong>
                  </div>
                  <div>
                    Tokens Owned: <strong className="text-[var(--text-primary)]">{Math.round(pos.tokenAmount).toLocaleString()} ${pos.tokenSymbol}</strong>
                  </div>
                  <div>
                    Status: <span className="text-sky-500 font-semibold">Bot Monitoring Exits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <h3 className="font-semibold text-[var(--text-primary)]">No Open Positions</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              Once an approved trade setup meets its entry price target, the order executes and the position appears here with real-time PnL tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
