import { describe, it, expect } from 'vitest';
import { sniperPresetEngine } from '../src/engines/sniperPresetEngine';
import { exitEngine } from '../src/engines/exitEngine';
import { Position } from '../src/types/trade';

describe('SniperPresetEngine - Controlled Jeeting & 3-Step Martingale Sniper (Playbook Ch. 12)', () => {
  const basePrice = 0.00010;
  const positionSize = 200;

  it('generates the 3-Step Martingale Sniper Preset according to Playbook Ch. 12 rules', () => {
    const preset = sniperPresetEngine.get3StepMartingalePreset(basePrice, positionSize);

    expect(preset.presetType).toBe('MARTINGALE_3_STEP');
    expect(preset.tranches).toHaveLength(3);

    // Tranche 1: Scout Entry (25%)
    expect(preset.tranches[0].allocationPercent).toBe(25);
    expect(preset.tranches[0].priceOffsetPercent).toBe(0);
    expect(preset.tranches[0].triggerPrice).toBe(basePrice);

    // Tranche 2: Dip Absorption (35% at -25%)
    expect(preset.tranches[1].allocationPercent).toBe(35);
    expect(preset.tranches[1].priceOffsetPercent).toBe(-25);
    expect(preset.tranches[1].triggerPrice).toBeCloseTo(basePrice * 0.75, 8);

    // Tranche 3: Breakout Add (40% at +15%)
    expect(preset.tranches[2].allocationPercent).toBe(40);
    expect(preset.tranches[2].priceOffsetPercent).toBe(15);
    expect(preset.tranches[2].triggerPrice).toBeCloseTo(basePrice * 1.15, 8);

    // Total allocation must equal 100%
    const totalAlloc = preset.tranches.reduce((sum, t) => sum + t.allocationPercent, 0);
    expect(totalAlloc).toBe(100);

    // Staged profit scale-outs
    expect(preset.takeProfit1Percent).toBe(100); // 2x (+100%)
    expect(preset.takeProfit1SellPercent).toBe(50); // Free-roll original capital
    expect(preset.takeProfit2Percent).toBe(400); // 5x
    expect(preset.takeProfit2SellPercent).toBe(25);
    expect(preset.moonbagPercent).toBe(25);

    // Controlled jeeting rules
    expect(preset.controlledJeet.hardStopLossPercent).toBe(30);
    expect(preset.controlledJeet.stagnationCutMinutes).toBe(20);
    expect(preset.controlledJeet.emergencyDevDumpCut).toBe(true);
    expect(preset.controlledJeet.emergencyWashSpikeCut).toBe(true);
  });

  it('generates Controlled Jeet Scalp preset with tight parameters', () => {
    const preset = sniperPresetEngine.getControlledJeetScalpPreset(basePrice, positionSize);

    expect(preset.presetType).toBe('CONTROLLED_JEET_SCALP');
    expect(preset.controlledJeet.hardStopLossPercent).toBe(20);
    expect(preset.controlledJeet.stagnationCutMinutes).toBe(15);
    expect(preset.takeProfit1Percent).toBe(50);
    expect(preset.takeProfit1SellPercent).toBe(75);
  });

  it('generates Moonbag Conviction Runner preset with wider patience', () => {
    const preset = sniperPresetEngine.getMoonbagConvictionPreset(basePrice, positionSize);

    expect(preset.presetType).toBe('MOONBAG_CONVICTION');
    expect(preset.controlledJeet.stagnationCutMinutes).toBe(45);
    expect(preset.controlledJeet.hardStopLossPercent).toBe(35);
    expect(preset.moonbagPercent).toBe(25);
  });

  it('triggers Controlled Jeet when trade stagnates past time limit with no breakout', () => {
    const preset = sniperPresetEngine.get3StepMartingalePreset(basePrice, positionSize);

    const flatPosition: Position = {
      id: 'pos-test-01',
      setupId: 'setup-01',
      tokenAddress: 'token-01',
      tokenSymbol: 'TEST',
      tokenName: 'Test Token',
      chain: 'solana',
      entryPrice: basePrice,
      entryTimestamp: Date.now() - 25 * 60 * 1000, // 25 minutes ago
      entryTxHash: 'tx-01',
      currentPrice: basePrice * 1.02, // +2% only (flat/stagnant)
      positionSizeUsd: 100,
      tokenAmount: 1000000,
      currentValueUsd: 102,
      unrealizedPnlUsd: 2,
      unrealizedPnlPercent: 2,
      takeProfitPrice: basePrice * 2,
      stopLossPrice: basePrice * 0.7,
      maxPriceObserved: basePrice * 1.05,
      status: 'OPEN',
      isDemo: true,
      sniperPreset: preset,
    };

    const jeetResult = sniperPresetEngine.evaluateControlledJeet(flatPosition, {
      elapsedMinutes: 25,
    });

    expect(jeetResult.shouldJeet).toBe(true);
    expect(jeetResult.reason).toBe('CONTROLLED_JEET_STAGNATION');
    expect(jeetResult.details).toContain('Stagnation Rule');
  });

  it('does NOT trigger stagnation jeet if trade is already breaking out in profit', () => {
    const preset = sniperPresetEngine.get3StepMartingalePreset(basePrice, positionSize);

    const winningPosition: Position = {
      id: 'pos-test-02',
      setupId: 'setup-02',
      tokenAddress: 'token-02',
      tokenSymbol: 'WINNER',
      tokenName: 'Winner Token',
      chain: 'solana',
      entryPrice: basePrice,
      entryTimestamp: Date.now() - 25 * 60 * 1000,
      entryTxHash: 'tx-02',
      currentPrice: basePrice * 1.45, // +45% gain
      positionSizeUsd: 100,
      tokenAmount: 1000000,
      currentValueUsd: 145,
      unrealizedPnlUsd: 45,
      unrealizedPnlPercent: 45,
      takeProfitPrice: basePrice * 2,
      stopLossPrice: basePrice * 0.7,
      maxPriceObserved: basePrice * 1.5,
      status: 'OPEN',
      isDemo: true,
      sniperPreset: preset,
    };

    const jeetResult = sniperPresetEngine.evaluateControlledJeet(winningPosition, {
      elapsedMinutes: 25,
    });

    expect(jeetResult.shouldJeet).toBe(false);
  });

  it('triggers emergency jeet if deployer sells >5% of supply', () => {
    const preset = sniperPresetEngine.get3StepMartingalePreset(basePrice, positionSize);

    const openPosition: Position = {
      id: 'pos-test-03',
      setupId: 'setup-03',
      tokenAddress: 'token-03',
      tokenSymbol: 'DUMP',
      tokenName: 'Dump Token',
      chain: 'solana',
      entryPrice: basePrice,
      entryTimestamp: Date.now() - 5 * 60 * 1000,
      entryTxHash: 'tx-03',
      currentPrice: basePrice,
      positionSizeUsd: 100,
      tokenAmount: 1000000,
      currentValueUsd: 100,
      unrealizedPnlUsd: 0,
      unrealizedPnlPercent: 0,
      takeProfitPrice: basePrice * 2,
      stopLossPrice: basePrice * 0.7,
      maxPriceObserved: basePrice,
      status: 'OPEN',
      isDemo: true,
      sniperPreset: preset,
    };

    const jeetResult = sniperPresetEngine.evaluateControlledJeet(openPosition, {
      elapsedMinutes: 5,
      devSellDetected: true,
      devSellPercent: 8.5,
    });

    expect(jeetResult.shouldJeet).toBe(true);
    expect(jeetResult.reason).toBe('CONTROLLED_JEET_DEV_DUMP');
  });

  it('triggers emergency jeet if wash trading risk spikes to >60%', () => {
    const preset = sniperPresetEngine.get3StepMartingalePreset(basePrice, positionSize);

    const openPosition: Position = {
      id: 'pos-test-04',
      setupId: 'setup-04',
      tokenAddress: 'token-04',
      tokenSymbol: 'WASH',
      tokenName: 'Wash Token',
      chain: 'solana',
      entryPrice: basePrice,
      entryTimestamp: Date.now() - 3 * 60 * 1000,
      entryTxHash: 'tx-04',
      currentPrice: basePrice,
      positionSizeUsd: 100,
      tokenAmount: 1000000,
      currentValueUsd: 100,
      unrealizedPnlUsd: 0,
      unrealizedPnlPercent: 0,
      takeProfitPrice: basePrice * 2,
      stopLossPrice: basePrice * 0.7,
      maxPriceObserved: basePrice,
      status: 'OPEN',
      isDemo: true,
      sniperPreset: preset,
    };

    const jeetResult = sniperPresetEngine.evaluateControlledJeet(openPosition, {
      elapsedMinutes: 3,
      washRiskScore: 78,
    });

    expect(jeetResult.shouldJeet).toBe(true);
    expect(jeetResult.reason).toBe('CONTROLLED_JEET_WASH_SPIKE');
  });

  it('integrates with exitEngine to trigger controlled jeet on position evaluation', () => {
    const preset = sniperPresetEngine.get3StepMartingalePreset(basePrice, positionSize);

    const stagnantPos: Position = {
      id: 'pos-test-05',
      setupId: 'setup-05',
      tokenAddress: 'token-05',
      tokenSymbol: 'STAG',
      tokenName: 'Stagnant Token',
      chain: 'solana',
      entryPrice: basePrice,
      entryTimestamp: Date.now() - 22 * 60 * 1000, // 22 minutes ago
      entryTxHash: 'tx-05',
      currentPrice: basePrice * 0.98,
      positionSizeUsd: 100,
      tokenAmount: 1000000,
      currentValueUsd: 98,
      unrealizedPnlUsd: -2,
      unrealizedPnlPercent: -2,
      takeProfitPrice: basePrice * 2,
      stopLossPrice: basePrice * 0.7,
      maxPriceObserved: basePrice * 1.02,
      status: 'OPEN',
      isDemo: true,
      sniperPreset: preset,
    };

    const result = exitEngine.evaluateExitConditions(stagnantPos, basePrice * 0.98, {
      elapsedMinutes: 22,
    });

    expect(result.shouldExit).toBe(true);
    expect(result.reason).toBe('CONTROLLED_JEET_STAGNATION');
  });
});
