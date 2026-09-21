import { describe, it, expect } from 'vitest';
import { telegramBotService } from '../src/services/telegramBotService';
import { DEMO_TOKENS } from '../src/providers/demoDataProvider';
import { TradeSetupDraft } from '../src/types/trade';

describe('Telegram Bot & Remote Approval Service Tests', () => {
  it('should format a rich Opportunity Report message with key metrics', () => {
    const token = DEMO_TOKENS[0]; // SOLPUMP
    const message = telegramBotService.formatReportMessage(token);

    expect(message).toContain('TOKEN ALERT OPPORTUNITY REPORT');
    expect(message).toContain('SOLPUMP');
    expect(message).toContain('SOLANA');
    expect(message).toContain('ACTION REQUIRED');
    expect(message).toContain(String(token.opportunityScore));
  });

  it('should correctly parse APPROVE callback query data', () => {
    const rawCallback = 'APPROVE:0x123456789abcdef:0.00040:150';
    const parsed = telegramBotService.parseCallbackData(rawCallback);

    expect(parsed).not.toBeNull();
    expect(parsed?.action).toBe('APPROVE');
    expect(parsed?.tokenAddress).toBe('0x123456789abcdef');
    expect(parsed?.entryPrice).toBe(0.0004);
    expect(parsed?.positionSizeUsd).toBe(150);
  });

  it('should correctly parse IGNORE callback query data', () => {
    const rawCallback = 'IGNORE:0x123456789abcdef';
    const parsed = telegramBotService.parseCallbackData(rawCallback);

    expect(parsed).not.toBeNull();
    expect(parsed?.action).toBe('IGNORE');
    expect(parsed?.tokenAddress).toBe('0x123456789abcdef');
  });

  it('should dispatch remote approvals to registered listener', () => {
    let capturedDraft: TradeSetupDraft | null = null;
    let capturedProof: string | null = null;

    const unsubscribe = telegramBotService.onApproval((draft, proof) => {
      capturedDraft = draft;
      capturedProof = proof;
    });

    const mockDraft: TradeSetupDraft = {
      tokenAddress: '0xabc',
      tokenSymbol: 'ABC',
      tokenName: 'Abc Token',
      chain: 'solana',
      currentPrice: 0.001,
      entryTriggerPrice: 0.00095,
      positionSizeUsd: 100,
      takeProfitPercent: 100,
      takeProfitPrice: 0.0019,
      stopLossPercent: 30,
      stopLossPrice: 0.00066,
      maxSlippagePercent: 3.0,
      orderType: 'TRIGGER_LIMIT',
      expiryHours: 24,
    };

    telegramBotService.dispatchRemoteApproval(mockDraft, 'TELEGRAM_PROOF_123');

    expect(capturedDraft).not.toBeNull();
    const draft = capturedDraft as unknown as TradeSetupDraft;
    expect(draft.tokenSymbol).toBe('ABC');
    expect(capturedProof).toBe('TELEGRAM_PROOF_123');

    unsubscribe();
  });
});
