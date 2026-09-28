import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  Timer,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Token } from '../../types/token';
import { TradeSetupDraft, OrderType, SniperPresetType, SniperPresetConfig } from '../../types/trade';
import { useTradingStore } from '../../store/useTradingStore';
import { formatUsd } from '../../utils/formatters';
import { ChainBadge } from '../common/Badge';
import { sniperPresetEngine } from '../../engines/sniperPresetEngine';

export const TradeSetupModal: React.FC<{ token: Token }> = ({ token }) => {
  const { closeTradeSetup, approveTradeSetup } = useTradingStore();

  // Active Playbook Preset (Default: Chapter 12 3-Step Martingale Sniper)
  const [activePresetType, setActivePresetType] = useState<SniperPresetType>('MARTINGALE_3_STEP');

  // Core Parameters
  const defaultEntry = Number((token.priceUsd * 0.95).toFixed(6)); // 5% dip entry trigger
  const [entryTriggerPrice, setEntryTriggerPrice] = useState<number>(defaultEntry);
  const [positionSizeUsd, setPositionSizeUsd] = useState<number>(100);
  const [takeProfitPercent, setTakeProfitPercent] = useState<number>(100); // 2x profit
  const [stopLossPercent, setStopLossPercent] = useState<number>(30); // -30% loss
  const [maxSlippagePercent, setMaxSlippagePercent] = useState<number>(3.0);
  const [orderType, setOrderType] = useState<OrderType>('TRIGGER_LIMIT');
  const [expiryHours, setExpiryHours] = useState<number>(24);

  // Controlled Jeeting Overrides
  const [stagnationMinutes, setStagnationMinutes] = useState<number>(20);
  const [emergencyDevDump, setEmergencyDevDump] = useState<boolean>(true);
  const [emergencyWashSpike, setEmergencyWashSpike] = useState<boolean>(true);

  const [humanConfirmed, setHumanConfirmed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Preset Selection
  const handleSelectPreset = (type: SniperPresetType) => {
    setActivePresetType(type);
    if (type === 'MARTINGALE_3_STEP') {
      setTakeProfitPercent(100);
      setStopLossPercent(30);
      setStagnationMinutes(20);
      setEmergencyDevDump(true);
      setEmergencyWashSpike(true);
    } else if (type === 'CONTROLLED_JEET_SCALP') {
      setTakeProfitPercent(50);
      setStopLossPercent(20);
      setStagnationMinutes(15);
      setEmergencyDevDump(true);
      setEmergencyWashSpike(true);
    } else if (type === 'MOONBAG_CONVICTION') {
      setTakeProfitPercent(100);
      setStopLossPercent(35);
      setStagnationMinutes(45);
      setEmergencyDevDump(true);
      setEmergencyWashSpike(true);
    }
  };

  // Computed Prices
  const takeProfitPrice = Number((entryTriggerPrice * (1 + takeProfitPercent / 100)).toFixed(6));
  const stopLossPrice = Number((entryTriggerPrice * (1 - stopLossPercent / 100)).toFixed(6));

  // Build active preset configuration
  const activePresetConfig: SniperPresetConfig | undefined = useMemo(() => {
    if (activePresetType === 'CUSTOM') {
      return undefined;
    }
    const basePreset =
      activePresetType === 'MARTINGALE_3_STEP'
        ? sniperPresetEngine.get3StepMartingalePreset(entryTriggerPrice, positionSizeUsd)
        : activePresetType === 'CONTROLLED_JEET_SCALP'
        ? sniperPresetEngine.getControlledJeetScalpPreset(entryTriggerPrice, positionSizeUsd)
        : sniperPresetEngine.getMoonbagConvictionPreset(entryTriggerPrice, positionSizeUsd);

    return {
      ...basePreset,
      controlledJeet: {
        hardStopLossPercent: stopLossPercent,
        stagnationCutMinutes: stagnationMinutes,
        emergencyDevDumpCut: emergencyDevDump,
        emergencyWashSpikeCut: emergencyWashSpike,
      },
      takeProfit1Percent: takeProfitPercent,
    };
  }, [
    activePresetType,
    entryTriggerPrice,
    positionSizeUsd,
    stopLossPercent,
    stagnationMinutes,
    emergencyDevDump,
    emergencyWashSpike,
    takeProfitPercent,
  ]);

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
      sniperPreset: activePresetConfig,
    };

    const success = approveTradeSetup(draft);
    if (!success) {
      setErrorMsg('Validation failed. Please verify price and position parameters.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] w-full max-w-2xl shadow-2xl rounded-t-2xl sm:rounded-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between bg-black/5 dark:bg-black/40 rounded-t-2xl sm:rounded-t-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-500 dark:text-sky-400 shrink-0" />
            <div>
              <div className="font-mono font-semibold text-sm flex items-center gap-2">
                <span>HUMAN TRADE SETUP AUTHORIZATION</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  PLAYBOOK CH. 12
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                Define exact execution criteria, 3-step tranche allocations, and controlled jeeting rules.
              </div>
            </div>
          </div>
          <button
            onClick={closeTradeSetup}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-4 font-mono text-xs overflow-y-auto flex-1">
          {/* Token Header Banner */}
          <div className="bg-black/5 dark:bg-zinc-900/60 p-3 rounded-lg border border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">${token.symbol}</span>
              <span className="text-[var(--text-muted)] hidden sm:inline">({token.name})</span>
              <ChainBadge chain={token.chain} />
            </div>
            <div className="text-right">
              <span className="text-[var(--text-muted)] text-[10px] block uppercase tracking-wider">
                Current Market Price
              </span>
              <span className="font-semibold text-sm">{formatUsd(token.priceUsd, 6)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* PLAYBOOK PRESETS SELECTOR */}
          <div className="space-y-2">
            <label className="text-[var(--text-primary)] font-bold text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>SNIPER &amp; JEET STRATEGY PRESETS (CH. 12)</span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">
                Disciplined execution over blind FOMO
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('MARTINGALE_3_STEP')}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  activePresetType === 'MARTINGALE_3_STEP'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">3-Step Martingale</span>
                </div>
                <span className="text-[10px] font-normal opacity-80 mt-1 block">
                  25% scout / 35% dip / 40% add + 20m cut
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('CONTROLLED_JEET_SCALP')}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  activePresetType === 'CONTROLLED_JEET_SCALP'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-500 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">Jeet Scalp</span>
                </div>
                <span className="text-[10px] font-normal opacity-80 mt-1 block">
                  15m dead-cat cut / -20% stop / +50% TP
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('MOONBAG_CONVICTION')}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  activePresetType === 'MOONBAG_CONVICTION'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">Moonbag Runner</span>
                </div>
                <span className="text-[10px] font-normal opacity-80 mt-1 block">
                  30/40/30 tranches / 2x TP1 / 25% moonbag
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePresetType('CUSTOM')}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  activePresetType === 'CUSTOM'
                    ? 'bg-sky-500/15 border-sky-500/50 text-sky-500 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">Custom Setup</span>
                </div>
                <span className="text-[10px] font-normal opacity-80 mt-1 block">
                  Fully manual parameters
                </span>
              </button>
            </div>
          </div>

          {/* 3-STEP TRANCHE BREAKDOWN PREVIEW */}
          {activePresetConfig && activePresetConfig.tranches.length > 1 && (
            <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded-lg border border-[var(--card-border)] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold flex items-center gap-1.5 text-amber-500">
                  <Layers className="w-3.5 h-3.5" />
                  <span>3-STEP TRANCHE EXECUTION SCHEDULE</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Total Budget: ${positionSizeUsd}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                {activePresetConfig.tranches.map((tranche) => {
                  const trancheUsd = (positionSizeUsd * (tranche.allocationPercent / 100)).toFixed(2);
                  return (
                    <div
                      key={tranche.step}
                      className="bg-black/5 dark:bg-zinc-900 p-2.5 rounded border border-[var(--card-border)] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)]">
                          Step {tranche.step}: {tranche.allocationPercent}%
                        </span>
                        <span className="font-semibold text-emerald-400">${trancheUsd}</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {tranche.name}
                      </div>
                      <div className="text-[11px] font-mono text-sky-400">
                        Trigger: {formatUsd(tranche.triggerPrice, 6)}
                        {tranche.priceOffsetPercent !== 0 && (
                          <span className="text-[10px] text-[var(--text-muted)] ml-1">
                            ({tranche.priceOffsetPercent > 0 ? '+' : ''}{tranche.priceOffsetPercent}%)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Profit Scale-Out Breakdown */}
              <div className="pt-1.5 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  <span>Staged Profit-Taking:</span>
                </span>
                <span>Sell 50% @ 2x (Principal Freeroll)</span>
                <span>•</span>
                <span>Sell 25% @ 5x</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">25% Moonbag Holding</span>
              </div>
            </div>
          )}

          {/* CONTROLLED JEETING SAFEGUARDS BANNER */}
          <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded-lg border border-[var(--card-border)] space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CONTROLLED JEETING SAFEGUARDS (CAPITAL PRESERVATION)</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                ZERO HOPIUM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              {/* Stagnation Cut Timer */}
              <div className="bg-black/5 dark:bg-zinc-900 p-2 rounded border border-[var(--card-border)] space-y-1">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <Timer className="w-3 h-3 text-amber-400" />
                  <span>STAGNATION CUT (DEAD-CAT)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={stagnationMinutes}
                    onChange={(e) => setStagnationMinutes(Math.max(5, parseInt(e.target.value) || 20))}
                    className="w-16 bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded px-1.5 py-1 text-xs text-[var(--text-primary)] font-bold outline-none"
                  />
                  <span className="text-[var(--text-muted)]">mins</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  100% exit if flat after timer
                </span>
              </div>

              {/* Dev Dump Trigger */}
              <div className="bg-black/5 dark:bg-zinc-900 p-2 rounded border border-[var(--card-border)] space-y-1">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>EMERGENCY DEV DUMP</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={emergencyDevDump}
                    onChange={(e) => setEmergencyDevDump(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-rose-500"
                  />
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">
                    Cut if Dev Sells &gt;5%
                  </span>
                </label>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Instant market jeet
                </span>
              </div>

              {/* Wash Spike Trigger */}
              <div className="bg-black/5 dark:bg-zinc-900 p-2 rounded border border-[var(--card-border)] space-y-1">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>WASH TRADING SPIKE</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={emergencyWashSpike}
                    onChange={(e) => setEmergencyWashSpike(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-cyan-500"
                  />
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">
                    Cut if Wash &gt;60%
                  </span>
                </label>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Cancel tranches &amp; exit
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Entry Trigger Price */}
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">
                Entry Trigger Price ($)
              </label>
              <input
                type="number"
                step="any"
                value={entryTriggerPrice}
                onChange={(e) => setEntryTriggerPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition font-mono"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                Bot triggers initial tranche at or below this target price.
              </span>
            </div>

            {/* Position Size */}
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">
                Total Position Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[var(--text-muted)]">$</span>
                <input
                  type="number"
                  value={positionSizeUsd}
                  onChange={(e) => setPositionSizeUsd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 pl-7 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition font-mono"
                />
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                Safety cap: $5,000 max.
              </span>
            </div>

            {/* Take Profit */}
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">
                Take Profit (+{takeProfitPercent}%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={takeProfitPercent}
                  onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition font-mono"
                />
                <span className="text-[var(--text-muted)] font-semibold">= {formatUsd(takeProfitPrice, 6)}</span>
              </div>
            </div>

            {/* Stop Loss */}
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">
                Hard Stop Loss (-{stopLossPercent}%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={stopLossPercent}
                  onChange={(e) => setStopLossPercent(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition font-mono"
                />
                <span className="text-[var(--text-muted)] font-semibold">= {formatUsd(stopLossPrice, 6)}</span>
              </div>
            </div>

            {/* Max Slippage */}
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">
                Max Slippage (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxSlippagePercent}
                onChange={(e) => setMaxSlippagePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition font-mono"
              />
            </div>

            {/* Order Expiry */}
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">
                Order Expiry (Hours)
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 cursor-pointer transition font-mono"
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
            <label className="text-[var(--text-primary)] block mb-1 font-medium">
              Order Execution Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('TRIGGER_LIMIT')}
                className={`p-2.5 rounded-md border text-left transition ${
                  orderType === 'TRIGGER_LIMIT'
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-300 font-semibold'
                    : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="font-semibold">TRIGGER LIMIT</div>
                <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">
                  Execute only at or better than trigger
                </div>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TRIGGER_MARKET')}
                className={`p-2.5 rounded-md border text-left transition ${
                  orderType === 'TRIGGER_MARKET'
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-300 font-semibold'
                    : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="font-semibold">TRIGGER MARKET</div>
                <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">
                  Market order upon trigger condition
                </div>
              </button>
            </div>
          </div>

          {/* Explicit Human Confirmation Checkbox */}
          <div className="bg-black/5 dark:bg-zinc-950/80 p-3.5 rounded-lg border border-[var(--card-border)]">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={humanConfirmed}
                onChange={(e) => {
                  setHumanConfirmed(e.target.checked);
                  setErrorMsg(null);
                }}
                className="mt-0.5 w-4 h-4 rounded text-sky-500 focus:ring-0 focus:ring-offset-0 bg-white dark:bg-zinc-900 border-[var(--card-border)] cursor-pointer"
              />
              <span className="text-[11px] text-[var(--text-primary)] leading-relaxed">
                I explicitly authorize this trade setup with the selected{' '}
                <strong className="text-amber-500">
                  {activePresetConfig?.name || 'Custom Setup'}
                </strong>{' '}
                parameters. I understand the bot will strictly execute according to approved tranche
                and controlled jeet conditions without autonomous drift.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-[var(--card-border)] bg-black/5 dark:bg-black/40 rounded-b-xl flex items-center justify-end gap-3 font-mono text-xs shrink-0">
          <button
            onClick={closeTradeSetup}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-transparent hover:bg-black/10 dark:hover:bg-zinc-800 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--card-border)] transition font-medium text-center"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM TRADE SETUP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
