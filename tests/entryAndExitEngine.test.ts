import { describe, it, expect } from 'vitest';
import { entryMonitorEngine } from '../src/engines/entryMonitorEngine';
import { exitEngine } from '../src/engines/exitEngine';
import { positionMonitorEngine } from '../src/engines/positionMonitorEngine';
import { TradeSetup, Position } from '../src/types/trade';

describe('Entry and Exit Engine Tests', () => {
  const mockSetup: TradeSetup = {
    id: 'setup-101',
    tokenAddress: '0xabc',
    tokenSymbol: 'ABC',
    tokenName: 'Abc Token',
    chain: 'bsc',
    currentPriceAtSetup: 0.00046,
    entryTriggerPrice: 0.00040,
    positionSizeUsd: 100,
    takeProfitPrice: 0.00080,
    takeProfitPercent: 100,
    stopLossPrice: 0.00030,
    stopLossPercent: 25,
    maxSlippagePercent: 3.0,
    orderType: 'TRIGGER_LIMIT',
    expiryHours: 24,
    createdAt: Date.now(),
    expiryTimestamp: Date.now() + 86400000,
    status: 'APPROVED_WAITING_ENTRY',
    userApprovalToken: 'HUMAN_APPROVED_101',
    isDemo: true,
  };

  it('should NOT trigger entry when market price is still higher than entry target', () => {
    const res = entryMonitorEngine.evaluateEntryCondition(mockSetup, 0.00046);
    expect(res.triggered).toBe(false);
  });

  it('should trigger entry when market price drops to or below approved entry target', () => {
    const res = entryMonitorEngine.evaluateEntryCondition(mockSetup, 0.00040);
    expect(res.triggered).toBe(true);
    expect(res.reason).toContain('reached user approved entry target');
  });

  it('should evaluate Take Profit trigger when current price >= takeProfitPrice', () => {
    const mockPos: Position = {
      id: 'pos-101',
      setupId: 'setup-101',
      tokenAddress: '0xabc',
      tokenSymbol: 'ABC',
      tokenName: 'Abc Token',
      chain: 'bsc',
      entryPrice: 0.00040,
      entryTimestamp: Date.now(),
      entryTxHash: '0xsim_1',
      currentPrice: 0.00080,
      positionSizeUsd: 100,
      tokenAmount: 250000,
      currentValueUsd: 200,
      unrealizedPnlUsd: 100,
      unrealizedPnlPercent: 100,
      takeProfitPrice: 0.00080,
      stopLossPrice: 0.00030,
      maxPriceObserved: 0.00080,
      status: 'OPEN',
      isDemo: true,
    };

    const exitRes = exitEngine.evaluateExitConditions(mockPos, 0.00080);
    expect(exitRes.shouldExit).toBe(true);
    expect(exitRes.reason).toBe('TAKE_PROFIT');
  });

  it('should evaluate Stop Loss trigger when current price <= stopLossPrice', () => {
    const mockPos: Position = {
      id: 'pos-102',
      setupId: 'setup-101',
      tokenAddress: '0xabc',
      tokenSymbol: 'ABC',
      tokenName: 'Abc Token',
      chain: 'bsc',
      entryPrice: 0.00040,
      entryTimestamp: Date.now(),
      entryTxHash: '0xsim_1',
      currentPrice: 0.00029,
      positionSizeUsd: 100,
      tokenAmount: 250000,
      currentValueUsd: 72.5,
      unrealizedPnlUsd: -27.5,
      unrealizedPnlPercent: -27.5,
      takeProfitPrice: 0.00080,
      stopLossPrice: 0.00030,
      maxPriceObserved: 0.00040,
      status: 'OPEN',
      isDemo: true,
    };

    const exitRes = exitEngine.evaluateExitConditions(mockPos, 0.00029);
    expect(exitRes.shouldExit).toBe(true);
    expect(exitRes.reason).toBe('STOP_LOSS');
  });

  it('should trigger liquidity collapse risk alert if liquidity drops by > 50%', () => {
    const mockPos: Position = {
      id: 'pos-103',
      setupId: 'setup-101',
      tokenAddress: '0xabc',
      tokenSymbol: 'ABC',
      tokenName: 'Abc Token',
      chain: 'bsc',
      entryPrice: 0.00040,
      entryTimestamp: Date.now(),
      entryTxHash: '0xsim_1',
      currentPrice: 0.00038,
      positionSizeUsd: 100,
      tokenAmount: 250000,
      currentValueUsd: 95,
      unrealizedPnlUsd: -5,
      unrealizedPnlPercent: -5,
      takeProfitPrice: 0.00080,
      stopLossPrice: 0.00030,
      maxPriceObserved: 0.00040,
      status: 'OPEN',
      isDemo: true,
    };

    // Liquidity collapsed from $100K to $30K (70% drop)
    const update = positionMonitorEngine.updatePosition(mockPos, 0.00038, 30000, 100000);
    expect(update.riskAlert).toBeDefined();
    expect(update.riskAlert?.type).toBe('LIQUIDITY_COLLAPSE');
  });
});
