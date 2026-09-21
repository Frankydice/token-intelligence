import React from 'react';
import { History, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd, formatPercent, truncateAddress, formatTimeAgo, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const HistoryPage: React.FC = () => {
  const { closedPositions } = useTradingStore();

  const totalRealizedPnl = closedPositions.reduce((acc, p) => acc + (p.realizedPnlUsd || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090d16] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                CLOSED TRADE HISTORY ({closedPositions.length})
              </h2>
              <p className="text-slate-400 text-[11px]">
                Complete audit of exited trades, exit reasons, and net realized PnL.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">TOTAL REALIZED PnL</span>
            <span className={`text-base font-bold ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalRealizedPnl >= 0 ? '+' : ''}{formatUsd(totalRealizedPnl)}
            </span>
          </div>
        </div>

        {closedPositions.length > 0 ? (
          <div className="terminal-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] bg-slate-950/60">
                    <th className="py-2.5 px-3">TOKEN</th>
                    <th className="py-2.5 px-3">CHAIN</th>
                    <th className="py-2.5 px-3">ENTRY PRICE</th>
                    <th className="py-2.5 px-3">EXIT PRICE</th>
                    <th className="py-2.5 px-3">POSITION SIZE</th>
                    <th className="py-2.5 px-3">REALIZED PnL</th>
                    <th className="py-2.5 px-3">EXIT REASON</th>
                    <th className="py-2.5 px-3">TIME</th>
                    <th className="py-2.5 px-3">EXIT TX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {closedPositions.map((pos) => {
                    const isProfit = (pos.realizedPnlUsd || 0) >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white">${pos.tokenSymbol}</span>
                          <span className="text-slate-500 block text-[10px]">{pos.tokenName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <ChainBadge chain={pos.chain} />
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-300">
                          {formatUsd(pos.entryPrice, 6)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {formatUsd(pos.exitPrice || pos.currentPrice, 6)}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          ${pos.positionSizeUsd}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <div className={`flex items-center gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>
                              {isProfit ? '+' : ''}{formatUsd(pos.realizedPnlUsd || 0)} ({formatPercent(pos.realizedPnlPercent || 0)})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pos.exitReason === 'TAKE_PROFIT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : pos.exitReason === 'STOP_LOSS'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {pos.exitReason || 'CLOSED'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {pos.exitTimestamp ? formatTimeAgo(pos.exitTimestamp) : 'Just now'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {pos.exitTxHash ? (
                            <a
                              href={getExplorerUrl(pos.exitTxHash, pos.chain, 'tx')}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-cyan-400 flex items-center gap-1 text-[11px]"
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
        ) : (
          <div className="terminal-card p-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-200">No Closed Trades Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Closed trades with realized profits, losses, and cryptographic transaction hashes will be cataloged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
