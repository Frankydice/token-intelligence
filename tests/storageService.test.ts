import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { TradeSetup, Position } from '../src/types/trade';
import { AuditLogEntry } from '../src/types/audit';

describe('Persistent Storage Service Tests', () => {
  beforeEach(() => {
    storageService.clearAll();
  });

  it('should save and load pending trade setups', async () => {
    const mockSetup: TradeSetup = {
      id: 'setup-store-001',
      tokenAddress: '7xKXtg...JosgAsU',
      tokenSymbol: 'SOLPUMP',
      tokenName: 'Solana Velocity',
      chain: 'solana',
      currentPriceAtSetup: 0.00048,
      entryTriggerPrice: 0.00040,
      positionSizeUsd: 150,
      takeProfitPrice: 0.00080,
      takeProfitPercent: 100,
      stopLossPrice: 0.00028,
      stopLossPercent: 30,
      maxSlippagePercent: 3.0,
      orderType: 'TRIGGER_LIMIT',
      expiryHours: 24,
      createdAt: Date.now(),
      expiryTimestamp: Date.now() + 86400000,
      status: 'APPROVED_WAITING_ENTRY',
      userApprovalToken: 'TEST_APPROVAL_TOKEN_001',
      isDemo: true,
    };

    await storageService.savePendingSetups([mockSetup]);
    const loaded = await storageService.loadPendingSetups();

    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('setup-store-001');
    expect(loaded[0].userApprovalToken).toBe('TEST_APPROVAL_TOKEN_001');
    expect(loaded[0].positionSizeUsd).toBe(150);
  });

  it('should save and load open positions', async () => {
    const mockPos: Position = {
      id: 'pos-store-001',
      setupId: 'setup-store-001',
      tokenAddress: '7xKXtg...JosgAsU',
      tokenSymbol: 'SOLPUMP',
      tokenName: 'Solana Velocity',
      chain: 'solana',
      entryPrice: 0.00040,
      entryTimestamp: Date.now(),
      entryTxHash: '0xsim_entry_001',
      currentPrice: 0.00045,
      positionSizeUsd: 150,
      tokenAmount: 375000,
      currentValueUsd: 168.75,
      unrealizedPnlUsd: 18.75,
      unrealizedPnlPercent: 12.5,
      takeProfitPrice: 0.00080,
      stopLossPrice: 0.00028,
      maxPriceObserved: 0.00045,
      status: 'OPEN',
      isDemo: true,
    };

    await storageService.saveOpenPositions([mockPos]);
    const loaded = await storageService.loadOpenPositions();

    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('pos-store-001');
    expect(loaded[0].unrealizedPnlUsd).toBe(18.75);
  });

  it('should export valid JSON for audit logs', async () => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'audit-001',
        timestamp: Date.now(),
        action: 'USER_APPROVED_TRADE',
        tokenSymbol: 'SOLPUMP',
        summary: 'User approved trade setup',
        details: 'Approved $150 entry',
        actor: 'HUMAN_USER',
        isDemo: true,
      },
    ];

    const json = storageService.exportAuditLogsJson(mockLogs);
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe('audit-001');
  });
});
