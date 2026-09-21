import React from 'react';
import { Clock, Play, Trash2, ArrowDownCircle } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const SetupsPage: React.FC = () => {
  const { pendingSetups, cancelTradeSetup, tickSimulation } = useTradingStore();

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090d16] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                HUMAN-APPROVED TRADE SETUPS ({pendingSetups.length})
              </h2>
              <p className="text-slate-400 text-[11px]">
                Bot is actively monitoring market price. Execution will only trigger when approved condition is met.
              </p>
            </div>
          </div>

          {pendingSetups.length > 0 && (
            <button
              onClick={tickSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hover:bg-cyan-500/30 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Market Reaching Entry Trigger
            </button>
          )}
        </div>

        {pendingSetups.length > 0 ? (
          <div className="space-y-3">
            {pendingSetups.map((setup) => (
              <div key={setup.id} className="terminal-card p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">${setup.tokenSymbol}</span>
                        <span className="text-slate-400">({setup.tokenName})</span>
                        <ChainBadge chain={setup.chain} />
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          WAITING FOR ENTRY
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Order ID: {setup.id} • Order Type: {setup.orderType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cancelTradeSetup(setup.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Setup</span>
                    </button>
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">ENTRY TRIGGER</span>
                    <div className="font-bold text-cyan-300 text-sm mt-0.5">
                      {formatUsd(setup.entryTriggerPrice, 6)}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">POSITION SIZE</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      ${setup.positionSizeUsd}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">TAKE PROFIT (+{setup.takeProfitPercent}%)</span>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">
                      {formatUsd(setup.takeProfitPrice, 6)}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">STOP LOSS (-{setup.stopLossPercent}%)</span>
                    <div className="font-bold text-rose-400 text-sm mt-0.5">
                      {formatUsd(setup.stopLossPrice, 6)}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">MAX SLIPPAGE</span>
                    <div className="font-bold text-slate-300 text-sm mt-0.5">
                      {setup.maxSlippagePercent}%
                    </div>
                  </div>
                </div>

                {/* Approval Signature Token */}
                <div className="bg-slate-950/60 p-2 rounded border border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Human Authorization Signature: <code className="text-cyan-400">{setup.userApprovalToken}</code>
                  </span>
                  <span>Expires in: {setup.expiryHours}h</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="terminal-card p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-200">No Pending Trade Setups</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              When you inspect a newly discovered token and click [ BUY ], your authorized trade parameters will appear here while the bot waits for the market price to trigger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
