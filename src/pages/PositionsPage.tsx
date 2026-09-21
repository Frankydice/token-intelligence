import React from 'react';
import { DollarSign, Play, XCircle, TrendingUp } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd, formatPercent, truncateAddress, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const PositionsPage: React.FC = () => {
  const { openPositions, manualClosePosition, tickSimulation } = useTradingStore();

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090d16] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                ACTIVE OPEN POSITIONS ({openPositions.length})
              </h2>
              <p className="text-slate-400 text-[11px]">
                Monitoring live price, PnL, liquidity changes, and automated Take Profit &amp; Stop Loss conditions.
              </p>
            </div>
          </div>

          {openPositions.length > 0 && (
            <button
              onClick={tickSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/30 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Market Hitting Take Profit Trigger
            </button>
          )}
        </div>

        {openPositions.length > 0 ? (
          <div className="space-y-3">
            {openPositions.map((pos) => (
              <div key={pos.id} className="terminal-card p-5 space-y-4 border-l-4 border-l-cyan-400">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm">
                      {pos.tokenSymbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">${pos.tokenSymbol}</span>
                        <span className="text-slate-400">({pos.tokenName})</span>
                        <ChainBadge chain={pos.chain} />
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                          POSITION ACTIVE
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Entry Tx:{' '}
                        <a
                          href={getExplorerUrl(pos.entryTxHash, pos.chain, 'tx')}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          {truncateAddress(pos.entryTxHash, 6)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => manualClosePosition(pos.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 transition font-bold"
                    >
                      <XCircle className="w-4 h-4" />
                      Manual Market Exit
                    </button>
                  </div>
                </div>

                {/* Primary Financial Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">ENTRY PRICE</span>
                    <div className="font-bold text-slate-200 text-sm mt-0.5">
                      {formatUsd(pos.entryPrice, 6)}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">CURRENT PRICE</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {formatUsd(pos.currentPrice, 6)}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">POSITION VALUE</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {formatUsd(pos.currentValueUsd)}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">UNREALIZED PnL</span>
                    <div className={`font-bold text-sm mt-0.5 flex items-center justify-center gap-1 ${pos.unrealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{pos.unrealizedPnlUsd >= 0 ? '+' : ''}{formatUsd(pos.unrealizedPnlUsd)} ({formatPercent(pos.unrealizedPnlPercent)})</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">TAKE PROFIT TARGET</span>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">
                      {formatUsd(pos.takeProfitPrice, 6)}
                    </div>
                  </div>
                </div>

                {/* Exit Conditions Bar */}
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-900 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                  <div>
                    Stop Loss Floor: <strong className="text-rose-400">{formatUsd(pos.stopLossPrice, 6)}</strong>
                  </div>
                  <div>
                    Tokens Owned: <strong className="text-slate-200">{Math.round(pos.tokenAmount).toLocaleString()} ${pos.tokenSymbol}</strong>
                  </div>
                  <div>
                    Status: <span className="text-cyan-400 font-bold">Bot Monitoring Exits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="terminal-card p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-200">No Open Positions</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Once an approved trade setup meets its entry price target, the simulated or live order executes and the position appears here with real-time PnL tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
