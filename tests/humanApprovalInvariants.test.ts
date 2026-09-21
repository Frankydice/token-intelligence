import { describe, it, expect } from 'vitest';
import { tradeSetupEngine } from '../src/engines/tradeSetupEngine';
import { TradeSetup, TradeSetupDraft } from '../src/types/trade';

describe('Human Approval Invariants Tests (CRITICAL SAFETY)', () => {
  it('should NEVER execute an unapproved or draft trade setup', () => {
    // 1. Unapproved setup with empty approval token
    const mockUnapprovedSetup: TradeSetup = {
      id: 'setup-test-1',
      tokenAddress: '0x1234...5678',
      tokenSymbol: 'TEST',
      tokenName: 'Test Token',
      chain: 'solana',
      currentPriceAtSetup: 0.001,
      entryTriggerPrice: 0.0009,
      positionSizeUsd: 100,
      takeProfitPrice: 0.0018,
      takeProfitPercent: 100,
      stopLossPrice: 0.00063,
      stopLossPercent: 30,
      maxSlippagePercent: 3.0,
      orderType: 'TRIGGER_LIMIT',
      expiryHours: 24,
      createdAt: Date.now(),
      expiryTimestamp: Date.now() + 24 * 3600 * 1000,
      status: 'PENDING_APPROVAL',
      userApprovalToken: '', // NOT APPROVED!
      isDemo: true,
    };

    const canExec1 = tradeSetupEngine.canExecute(mockUnapprovedSetup);
    expect(canExec1).toBe(false);

    // 2. Setup with forged status but missing userApprovalToken
    const mockForgedSetup: TradeSetup = {
      ...mockUnapprovedSetup,
      status: 'APPROVED_WAITING_ENTRY',
      userApprovalToken: '', // Missing explicit signature
    };

    const canExec2 = tradeSetupEngine.canExecute(mockForgedSetup);
    expect(canExec2).toBe(false);
  });

  it('should permit execution ONLY when explicitly approved by human with valid token', () => {
    const validDraft: TradeSetupDraft = {
      tokenAddress: '0x1234...5678',
      tokenSymbol: 'TEST',
      tokenName: 'Test Token',
      chain: 'bsc',
      currentPrice: 0.00045,
      entryTriggerPrice: 0.00040,
      positionSizeUsd: 100,
      takeProfitPercent: 100,
      takeProfitPrice: 0.00080,
      stopLossPercent: 30,
      stopLossPrice: 0.00028,
      maxSlippagePercent: 3.0,
      orderType: 'TRIGGER_LIMIT',
      expiryHours: 24,
    };

    const approvalRes = tradeSetupEngine.approveTradeSetup(validDraft);
    expect(approvalRes.success).toBe(true);
    expect(approvalRes.setup).toBeDefined();

    const approvedSetup = approvalRes.setup!;
    expect(approvedSetup.status).toBe('APPROVED_WAITING_ENTRY');
    expect(approvedSetup.userApprovalToken).toContain('HUMAN_APPROVED');

    // Bot verifies invariant
    const canExec = tradeSetupEngine.canExecute(approvedSetup);
    expect(canExec).toBe(true);
  });

  it('should invalidate an expired trade setup', () => {
    const validDraft: TradeSetupDraft = {
      tokenAddress: '0x1234...5678',
      tokenSymbol: 'TEST',
      tokenName: 'Test Token',
      chain: 'bsc',
      currentPrice: 0.00045,
      entryTriggerPrice: 0.00040,
      positionSizeUsd: 100,
      takeProfitPercent: 100,
      takeProfitPrice: 0.00080,
      stopLossPercent: 30,
      stopLossPrice: 0.00028,
      maxSlippagePercent: 3.0,
      orderType: 'TRIGGER_LIMIT',
      expiryHours: 1,
    };

    const approvalRes = tradeSetupEngine.approveTradeSetup(validDraft);
    const setup = approvalRes.setup!;

    // Artificially expire the timestamp
    setup.expiryTimestamp = Date.now() - 1000;

    const canExec = tradeSetupEngine.canExecute(setup);
    expect(canExec).toBe(false);
  });
});
