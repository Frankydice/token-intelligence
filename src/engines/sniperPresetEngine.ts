import {
  SniperPresetConfig,
  TrancheConfig,
  Position,
  ExitReason,
} from '../types/trade';

/**
 * Sniper Preset & Controlled Jeeting Engine
 * Grounded in Chapter 12 of "The Ultimate Memecoin Playbook for Noobs"
 *
 * Core Playbook Principles:
 * 1. 3-Step Martingale Sniper: Never market-buy 100% in a single tranche on low-liquidity microcaps.
 *    Split into:
 *      - Tranche 1 (Scout): 25% at initial trigger/breakout.
 *      - Tranche 2 (Dip Absorption): 35% if price pulls back 25% on low organic volume.
 *      - Tranche 3 (Confirmation Breakout): 40% upon reclaim or local high breakout.
 * 2. Staged Profit-Taking:
 *      - Sell 50% at 2x (+100%) to take original capital completely off the table ("freeroll").
 *      - Sell 25% at 5x (+400%).
 *      - Leave 25% Moonbag with trailing stop for 10x-50x runner potential.
 * 3. Controlled Jeeting:
 *      - Stagnation Cut: If price doesn't break out within 20 minutes (configurable), exit 100% to preserve capital.
 *      - Dev Dump Cut: Instant emergency exit if deployer sells >5% of supply.
 *      - Wash Spike Cut: Cancel pending tranches and jeet if wash trading risk exceeds 60%.
 */
export class SniperPresetEngine {
  /**
   * Generates the 3-Step Martingale Sniper Preset (Playbook Ch. 12 Default).
   */
  public get3StepMartingalePreset(baseEntryPrice: number, _positionSizeUsd?: number): SniperPresetConfig {
    const p1 = baseEntryPrice;
    const p2 = Number((baseEntryPrice * 0.75).toFixed(8)); // -25% dip absorption
    const p3 = Number((baseEntryPrice * 1.15).toFixed(8)); // +15% breakout confirmation

    const tranches: TrancheConfig[] = [
      {
        step: 1,
        name: 'Tranche 1: Scout Entry',
        allocationPercent: 25,
        priceOffsetPercent: 0,
        triggerPrice: p1,
        status: 'PENDING',
      },
      {
        step: 2,
        name: 'Tranche 2: Dip Absorption (-25%)',
        allocationPercent: 35,
        priceOffsetPercent: -25,
        triggerPrice: p2,
        status: 'PENDING',
      },
      {
        step: 3,
        name: 'Tranche 3: Breakout Add (+15%)',
        allocationPercent: 40,
        priceOffsetPercent: 15,
        triggerPrice: p3,
        status: 'PENDING',
      },
    ];

    return {
      presetType: 'MARTINGALE_3_STEP',
      name: '3-Step Martingale Sniper',
      badge: '🎯 CH. 12 PLAYBOOK PRESET',
      description:
        'Deploys 25% scout, 35% dip absorption (-25%), 40% breakout add (+15%). Takes 50% profit @ 2x to freeroll, 25% @ 5x, and holds 25% moonbag with 20m stagnation cut.',
      tranches,
      controlledJeet: {
        hardStopLossPercent: 30,
        stagnationCutMinutes: 20,
        emergencyDevDumpCut: true,
        emergencyWashSpikeCut: true,
      },
      takeProfit1Percent: 100, // 2x (+100%)
      takeProfit1SellPercent: 50, // sell 50%
      takeProfit2Percent: 400, // 5x (+400%)
      takeProfit2SellPercent: 25, // sell 25%
      moonbagPercent: 25, // retain 25% runner
    };
  }

  /**
   * Generates the Controlled Jeet Scalp Preset.
   */
  public getControlledJeetScalpPreset(baseEntryPrice: number, _positionSizeUsd?: number): SniperPresetConfig {
    const tranches: TrancheConfig[] = [
      {
        step: 1,
        name: 'Full Scalp Entry',
        allocationPercent: 100,
        priceOffsetPercent: 0,
        triggerPrice: baseEntryPrice,
        status: 'PENDING',
      },
    ];

    return {
      presetType: 'CONTROLLED_JEET_SCALP',
      name: 'Controlled Jeet Scalp',
      badge: '⚡ TIGHT SCALP & QUICK CUT',
      description:
        'Aggressive high-velocity scalp. Cuts 100% if token is stagnant after 15m or drops -20%. Fast scale-out: 75% @ +50% gain, 25% @ 2x.',
      tranches,
      controlledJeet: {
        hardStopLossPercent: 20,
        stagnationCutMinutes: 15,
        emergencyDevDumpCut: true,
        emergencyWashSpikeCut: true,
      },
      takeProfit1Percent: 50,
      takeProfit1SellPercent: 75,
      takeProfit2Percent: 100,
      takeProfit2SellPercent: 25,
      moonbagPercent: 0,
    };
  }

  /**
   * Generates the Moonbag Conviction Runner Preset.
   */
  public getMoonbagConvictionPreset(baseEntryPrice: number, _positionSizeUsd?: number): SniperPresetConfig {
    const p1 = baseEntryPrice;
    const p2 = Number((baseEntryPrice * 0.80).toFixed(8)); // -20% dip
    const p3 = Number((baseEntryPrice * 1.10).toFixed(8)); // +10% reclaim

    const tranches: TrancheConfig[] = [
      {
        step: 1,
        name: 'Tranche 1: Genesis Scout',
        allocationPercent: 30,
        priceOffsetPercent: 0,
        triggerPrice: p1,
        status: 'PENDING',
      },
      {
        step: 2,
        name: 'Tranche 2: Accumulation Dip (-20%)',
        allocationPercent: 40,
        priceOffsetPercent: -20,
        triggerPrice: p2,
        status: 'PENDING',
      },
      {
        step: 3,
        name: 'Tranche 3: Reclaim Add (+10%)',
        allocationPercent: 30,
        priceOffsetPercent: 10,
        triggerPrice: p3,
        status: 'PENDING',
      },
    ];

    return {
      presetType: 'MOONBAG_CONVICTION',
      name: 'Moonbag Conviction Runner',
      badge: '💎 RUNNER EXPANSION',
      description:
        '30%/40%/30% tranche deployment with wider 45m stagnation window and -35% stop. Designed for runner tokens with 50% TP1 @ 2x and 25% moonbag holding.',
      tranches,
      controlledJeet: {
        hardStopLossPercent: 35,
        stagnationCutMinutes: 45,
        emergencyDevDumpCut: true,
        emergencyWashSpikeCut: true,
      },
      takeProfit1Percent: 100,
      takeProfit1SellPercent: 50,
      takeProfit2Percent: 400,
      takeProfit2SellPercent: 25,
      moonbagPercent: 25,
    };
  }

  /**
   * Returns all available preset configs for a given base price and size.
   */
  public getAllPresets(baseEntryPrice: number, _positionSizeUsd?: number): SniperPresetConfig[] {
    return [
      this.get3StepMartingalePreset(baseEntryPrice, _positionSizeUsd),
      this.getControlledJeetScalpPreset(baseEntryPrice, _positionSizeUsd),
      this.getMoonbagConvictionPreset(baseEntryPrice, _positionSizeUsd),
    ];
  }

  /**
   * Evaluates whether an open position should trigger an emergency "Controlled Jeet" exit.
   */
  public evaluateControlledJeet(
    position: Position,
    options: {
      elapsedMinutes: number;
      devSellDetected?: boolean;
      devSellPercent?: number;
      washRiskScore?: number;
    }
  ): { shouldJeet: boolean; reason?: ExitReason; details?: string } {
    const preset = position.sniperPreset;
    if (!preset) {
      return { shouldJeet: false };
    }

    const rules = preset.controlledJeet;

    // 1. Emergency Dev Dump Jeet Trigger
    if (rules.emergencyDevDumpCut && options.devSellDetected) {
      const pct = options.devSellPercent || 5;
      if (pct >= 5) {
        return {
          shouldJeet: true,
          reason: 'CONTROLLED_JEET_DEV_DUMP',
          details: `Emergency Controlled Jeet (Ch. 12): Deployer/insider wallet dumped ${pct.toFixed(1)}% of token supply. 100% position liquidating instantly.`,
        };
      }
    }

    // 2. Wash Spike Jeet Trigger
    if (rules.emergencyWashSpikeCut && options.washRiskScore && options.washRiskScore > 60) {
      return {
        shouldJeet: true,
        reason: 'CONTROLLED_JEET_WASH_SPIKE',
        details: `Emergency Controlled Jeet (Ch. 12 & 3): Wash trading risk spiked to ${options.washRiskScore}%. Artificial volume detected; closing open scout tranches.`,
      };
    }

    // 3. Time-Based Stagnation Cut (Dead Cat Jeet)
    // If trade has been open longer than stagnation cut minutes without making at least +10% profit
    if (
      options.elapsedMinutes >= rules.stagnationCutMinutes &&
      position.unrealizedPnlPercent < 10
    ) {
      return {
        shouldJeet: true,
        reason: 'CONTROLLED_JEET_STAGNATION',
        details: `Controlled Jeet (Ch. 12 Stagnation Rule): Token has failed to break out after ${options.elapsedMinutes}m (stagnation limit: ${rules.stagnationCutMinutes}m). Capital preserved for high-velocity runners.`,
      };
    }

    // 4. Hard Stop Loss Cut
    if (position.unrealizedPnlPercent <= -rules.hardStopLossPercent) {
      return {
        shouldJeet: true,
        reason: 'STOP_LOSS',
        details: `Controlled Jeet Stop-Loss hit: Drawdown (-${Math.abs(position.unrealizedPnlPercent).toFixed(1)}%) reached maximum approved loss threshold (-${rules.hardStopLossPercent}%).`,
      };
    }

    return { shouldJeet: false };
  }

  /**
   * Validates tranche configurations ensuring max 3 tranches and total 100% allocation.
   */
  public validateTranches(tranches: TrancheConfig[]): { isValid: boolean; error?: string } {
    if (!tranches || tranches.length === 0) {
      return { isValid: false, error: 'At least one tranche is required.' };
    }

    if (tranches.length > 3) {
      return { isValid: false, error: 'Maximum 3 tranches allowed under Martingale guardrails (Ch. 12).' };
    }

    const totalAllocation = tranches.reduce((sum, t) => sum + t.allocationPercent, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return { isValid: false, error: `Tranche allocations must sum to exactly 100% (currently ${totalAllocation}%).` };
    }

    return { isValid: true };
  }
}

export const sniperPresetEngine = new SniperPresetEngine();
