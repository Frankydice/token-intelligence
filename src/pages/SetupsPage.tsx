import React from 'react';
import { Clock, Play, Trash2, ArrowDownCircle } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const SetupsPage: React.FC = () => {
  const { pendingSetups, cancelTradeSetup, tickSimulation } = useTradingStore();

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                HUMAN-APPROVED TRADE SETUPS ({pendingSetups.length})
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Bot is actively monitoring market price. Execution will only trigger when approved condition is met.
              </p>
            </div>
          </div>

          {pendingSetups.length > 0 && (
            <button
              onClick={tickSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] font-medium transition shadow-sm text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Entry Trigger
            </button>
          )}
        </div>

        {pendingSetups.length > 0 ? (
          <div className="space-y-3">
            {pendingSetups.map((setup) => (
              <div key={setup.id} className="terminal-card p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-black/5 dark:bg-zinc-800/80 border border-[var(--card-border)] flex items-center justify-center text-amber-500 shrink-0">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[var(--text-primary)]">${setup.tokenSymbol}</span>
                        <span className="text-[var(--text-muted)]">({setup.tokenName})</span>
                        <ChainBadge chain={setup.chain} />
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          WAITING FOR ENTRY
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">
                        Order ID: {setup.id} • Order Type: {setup.orderType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cancelTradeSetup(setup.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-transparent hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-[var(--card-border)] hover:border-rose-500/30 transition text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Setup</span>
                    </button>
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-center">
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">ENTRY TRIGGER</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">
                      {formatUsd(setup.entryTriggerPrice, 6)}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">POSITION SIZE</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">
                      ${setup.positionSizeUsd}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">TAKE PROFIT (+{setup.takeProfitPercent}%)</span>
                    <div className="font-semibold text-emerald-500 dark:text-emerald-400 text-sm mt-0.5">
                      {formatUsd(setup.takeProfitPrice, 6)}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">STOP LOSS (-{setup.stopLossPercent}%)</span>
                    <div className="font-semibold text-rose-500 dark:text-rose-400 text-sm mt-0.5">
                      {formatUsd(setup.stopLossPrice, 6)}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">MAX SLIPPAGE</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">
                      {setup.maxSlippagePercent}%
                    </div>
                  </div>
                </div>

                {/* Approval Signature Token */}
                <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Human Auth Signature: <code className="text-sky-600 dark:text-sky-400 font-mono">{setup.userApprovalToken}</code>
                  </span>
                  <span>Expires in: {setup.expiryHours}h</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <h3 className="font-semibold text-[var(--text-primary)]">No Pending Trade Setups</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              When you inspect a newly discovered token and click [ BUY ], your authorized trade parameters will appear here while the bot waits for the market price to trigger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
