import React from 'react';
import { History, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd, formatPercent, truncateAddress, formatTimeAgo, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const HistoryPage: React.FC = () => {
  const { closedPositions } = useTradingStore();

  const totalRealizedPnl = closedPositions.reduce((acc, p) => acc + (p.realizedPnlUsd || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                CLOSED TRADE HISTORY ({closedPositions.length})
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Complete audit of exited trades, exit reasons, and net realized PnL.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">TOTAL REALIZED PnL</span>
            <span className={`text-base font-semibold ${totalRealizedPnl > 0 ? 'text-emerald-500 dark:text-emerald-400' : totalRealizedPnl < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-[var(--text-primary)]'}`}>
              {totalRealizedPnl > 0 ? '+' : ''}{formatUsd(totalRealizedPnl)}
            </span>
          </div>
        </div>

        {closedPositions.length > 0 ? (
          <div>
            {/* Mobile Stacked List (< 640px) */}
            <div className="block sm:hidden space-y-2.5">
              {closedPositions.map((pos) => {
                const isProfit = (pos.realizedPnlUsd || 0) >= 0;
                return (
                  <div key={pos.id} className="terminal-card p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)]">${pos.tokenSymbol}</span>
                        <ChainBadge chain={pos.chain} />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        pos.exitReason === 'TAKE_PROFIT'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : pos.exitReason === 'STOP_LOSS'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--card-border)]'
                      }`}>
                        {pos.exitReason || 'CLOSED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[var(--text-muted)] block text-[10px]">ENTRY / EXIT</span>
                        <span>{formatUsd(pos.entryPrice, 6)} → {formatUsd(pos.exitPrice || pos.currentPrice, 6)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[var(--text-muted)] block text-[10px]">REALIZED PnL</span>
                        <span className={`font-semibold ${isProfit ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {isProfit ? '+' : ''}{formatUsd(pos.realizedPnlUsd || 0)} ({formatPercent(pos.realizedPnlPercent || 0)})
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[var(--text-muted)] flex justify-between pt-1 border-t border-[var(--card-border)]">
                      <span>Size: ${pos.positionSizeUsd}</span>
                      <span>{pos.exitTimestamp ? formatTimeAgo(pos.exitTimestamp) : 'Just now'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= 640px) */}
            <div className="hidden sm:block terminal-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider bg-black/5 dark:bg-zinc-950/70">
                      <th className="py-2.5 px-3 font-medium">TOKEN</th>
                      <th className="py-2.5 px-3 font-medium">CHAIN</th>
                      <th className="py-2.5 px-3 font-medium">ENTRY PRICE</th>
                      <th className="py-2.5 px-3 font-medium">EXIT PRICE</th>
                      <th className="py-2.5 px-3 font-medium">POSITION SIZE</th>
                      <th className="py-2.5 px-3 font-medium">REALIZED PnL</th>
                      <th className="py-2.5 px-3 font-medium">EXIT REASON</th>
                      <th className="py-2.5 px-3 font-medium">TIME</th>
                      <th className="py-2.5 px-3 font-medium">EXIT TX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)] text-[var(--text-primary)]">
                    {closedPositions.map((pos) => {
                      const isProfit = (pos.realizedPnlUsd || 0) >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-black/5 dark:hover:bg-zinc-900/40">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[var(--text-primary)]">${pos.tokenSymbol}</span>
                            <span className="text-[var(--text-muted)] block text-[10px]">{pos.tokenName}</span>
                          </td>
                          <td className="py-3 px-3">
                            <ChainBadge chain={pos.chain} />
                          </td>
                          <td className="py-3 px-3 font-medium text-[var(--text-muted)]">
                            {formatUsd(pos.entryPrice, 6)}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                            {formatUsd(pos.exitPrice || pos.currentPrice, 6)}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)]">
                            ${pos.positionSizeUsd}
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            <div className={`flex items-center gap-1 ${isProfit ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                              {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              <span>
                                {isProfit ? '+' : ''}{formatUsd(pos.realizedPnlUsd || 0)} ({formatPercent(pos.realizedPnlPercent || 0)})
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              pos.exitReason === 'TAKE_PROFIT'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : pos.exitReason === 'STOP_LOSS'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--card-border)]'
                            }`}>
                              {pos.exitReason || 'CLOSED'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                            {pos.exitTimestamp ? formatTimeAgo(pos.exitTimestamp) : 'Just now'}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)]">
                            {pos.exitTxHash ? (
                              <a
                                href={getExplorerUrl(pos.exitTxHash, pos.chain, 'tx')}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-sky-500 flex items-center gap-1 text-[11px] transition p-0.5"
                                title="View in Explorer"
                              >
                                <span>{truncateAddress(pos.exitTxHash, 4)}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
            <History className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <h3 className="font-semibold text-[var(--text-primary)]">No Closed Trades Yet</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              Closed trades with realized profits, losses, and cryptographic transaction hashes will be cataloged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
