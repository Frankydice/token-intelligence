import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Token } from '../../types/token';
import { TradeSetupDraft, OrderType } from '../../types/trade';
import { useTradingStore } from '../../store/useTradingStore';
import { formatUsd } from '../../utils/formatters';
import { ChainBadge } from '../common/Badge';

export const TradeSetupModal: React.FC<{ token: Token }> = ({ token }) => {
  const { closeTradeSetup, approveTradeSetup } = useTradingStore();

  // Default values matching user spec example
  const defaultEntry = Number((token.priceUsd * 0.95).toFixed(6)); // 5% dip entry trigger
  const [entryTriggerPrice, setEntryTriggerPrice] = useState<number>(defaultEntry);
  const [positionSizeUsd, setPositionSizeUsd] = useState<number>(100);
  const [takeProfitPercent, setTakeProfitPercent] = useState<number>(100); // 2x profit
  const [stopLossPercent, setStopLossPercent] = useState<number>(30); // -30% loss
  const [maxSlippagePercent, setMaxSlippagePercent] = useState<number>(3.0);
  const [orderType, setOrderType] = useState<OrderType>('TRIGGER_LIMIT');
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [humanConfirmed, setHumanConfirmed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Computed prices
  const takeProfitPrice = Number((entryTriggerPrice * (1 + takeProfitPercent / 100)).toFixed(6));
  const stopLossPrice = Number((entryTriggerPrice * (1 - stopLossPercent / 100)).toFixed(6));

  const handleConfirm = () => {
    if (!humanConfirmed) {
      setErrorMsg('You must check the confirmation box to authorize this trade setup.');
      return;
    }

    const draft: TradeSetupDraft = {
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      chain: token.chain,
      currentPrice: token.priceUsd,
      entryTriggerPrice,
      positionSizeUsd,
      takeProfitPercent,
      takeProfitPrice,
      stopLossPercent,
      stopLossPrice,
      maxSlippagePercent,
      orderType,
      expiryHours,
    };

    const success = approveTradeSetup(draft);
    if (!success) {
      setErrorMsg('Validation failed. Please verify price and position parameters.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="terminal-card bg-[#0d1322] border border-cyan-500/40 w-full max-w-xl shadow-2xl rounded-xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-mono font-bold text-slate-100 text-sm">
                HUMAN TRADE SETUP AUTHORIZATION
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Define exact execution criteria. Bot will wait for entry and monitor exits.
              </div>
            </div>
          </div>
          <button
            onClick={closeTradeSetup}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 font-mono text-xs text-slate-200">
          {/* Token Header Banner */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">${token.symbol}</span>
              <span className="text-slate-400">({token.name})</span>
              <ChainBadge chain={token.chain} />
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Current Market Price</span>
              <span className="font-bold text-slate-200">{formatUsd(token.priceUsd, 6)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Entry Trigger Price */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Entry Trigger Price ($)
              </label>
              <input
                type="number"
                step="any"
                value={entryTriggerPrice}
                onChange={(e) => setEntryTriggerPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Bot will wait until price reaches this target before executing.
              </span>
            </div>

            {/* Position Size */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Position Size (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  value={positionSizeUsd}
                  onChange={(e) => setPositionSizeUsd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 pl-7 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Hard safety limit: $5,000 max.
              </span>
            </div>

            {/* Take Profit */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Take Profit (+{takeProfitPercent}%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={takeProfitPercent}
                  onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 font-bold">= {formatUsd(takeProfitPrice, 6)}</span>
              </div>
            </div>

            {/* Stop Loss */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Stop Loss (-{stopLossPercent}%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={stopLossPercent}
                  onChange={(e) => setStopLossPercent(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 font-bold">= {formatUsd(stopLossPrice, 6)}</span>
              </div>
            </div>

            {/* Max Slippage */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Max Slippage (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxSlippagePercent}
                onChange={(e) => setMaxSlippagePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Order Expiry */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Order Expiry (Hours)
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Default)</option>
                <option value="48">48 Hours</option>
                <option value="168">7 Days</option>
              </select>
            </div>
          </div>

          {/* Order Type Toggle */}
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('TRIGGER_LIMIT')}
                className={`p-2 rounded border text-left transition ${
                  orderType === 'TRIGGER_LIMIT'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>TRIGGER LIMIT</div>
                <div className="text-[10px] text-slate-400 font-normal">Execute only at or better than trigger price</div>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TRIGGER_MARKET')}
                className={`p-2 rounded border text-left transition ${
                  orderType === 'TRIGGER_MARKET'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>TRIGGER MARKET</div>
                <div className="text-[10px] text-slate-400 font-normal">Market order upon trigger condition</div>
              </button>
            </div>
          </div>

          {/* Explicit Human Confirmation Checkbox */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-cyan-500/30">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={humanConfirmed}
                onChange={(e) => {
                  setHumanConfirmed(e.target.checked);
                  setErrorMsg(null);
                }}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] text-slate-300 leading-relaxed">
                I explicitly authorize this trade setup. I understand the bot will strictly monitor until the approved entry condition is satisfied, and cannot alter my parameters autonomously.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-xl flex items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={closeTradeSetup}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            CONFIRM TRADE (ARM BOT)
          </button>
        </div>
      </div>
    </div>
  );
};
