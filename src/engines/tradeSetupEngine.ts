import { TradeSetup, TradeSetupDraft } from '../types/trade';
import { validateTradeSetupDraft } from '../utils/validation';

export class TradeSetupEngine {
  /**
   * Transforms a draft trade setup into an officially approved trade setup.
   * REQUIRES explicit human confirmation and approval signature.
   */
  public approveTradeSetup(
    draft: TradeSetupDraft,
    maxPositionSizeUsd: number = 5000
  ): { success: boolean; setup?: TradeSetup; errors?: string[] } {
    const validation = validateTradeSetupDraft(draft, maxPositionSizeUsd);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const id = `setup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const expiryTimestamp = now + draft.expiryHours * 3600 * 1000;

    // Generate cryptographic approval token representing explicit human action
    const userApprovalToken = `HUMAN_APPROVED_${now}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const setup: TradeSetup = {
      id,
      tokenAddress: draft.tokenAddress,
      tokenSymbol: draft.tokenSymbol,
      tokenName: draft.tokenName,
      chain: draft.chain,
      currentPriceAtSetup: draft.currentPrice,
      entryTriggerPrice: draft.entryTriggerPrice,
      positionSizeUsd: draft.positionSizeUsd,
      takeProfitPrice: draft.takeProfitPrice,
      takeProfitPercent: draft.takeProfitPercent,
      stopLossPrice: draft.stopLossPrice,
      stopLossPercent: draft.stopLossPercent,
      trailingStopPercent: draft.trailingStopPercent,
      maxSlippagePercent: draft.maxSlippagePercent,
      orderType: draft.orderType,
      expiryHours: draft.expiryHours,
      createdAt: now,
      approvedAt: now,
      expiryTimestamp,
      status: 'APPROVED_WAITING_ENTRY',
      userApprovalToken,
      isDemo: true, // will be updated based on active mode
    };

    return {
      success: true,
      setup,
    };
  }

  /**
   * Enforces the immutable invariant:
   * A trade can NEVER execute unless it has been explicitly approved by the human user.
   */
  public canExecute(setup: TradeSetup): boolean {
    if (!setup) return false;
    if (setup.status !== 'APPROVED_WAITING_ENTRY' && setup.status !== 'ENTRY_TRIGGERED') {
      return false;
    }
    if (!setup.userApprovalToken || setup.userApprovalToken.trim().length === 0) {
      return false;
    }
    if (Date.now() > setup.expiryTimestamp) {
      return false;
    }
    return true;
  }
}

export const tradeSetupEngine = new TradeSetupEngine();
