import { TradeSetup } from '../types/trade';

export interface EntryCheckResult {
  triggered: boolean;
  expired: boolean;
  reason?: string;
}

export class EntryMonitorEngine {
  /**
   * Evaluates if market conditions satisfy the user's pre-approved entry price.
   */
  public evaluateEntryCondition(setup: TradeSetup, currentPrice: number): EntryCheckResult {
    const now = Date.now();

    // Check expiry
    if (now >= setup.expiryTimestamp) {
      return {
        triggered: false,
        expired: true,
        reason: `Order expired after ${setup.expiryHours} hours without triggering entry condition.`,
      };
    }

    // Dip buy trigger: current price drops to or below the user-approved limit price
    if (currentPrice <= setup.entryTriggerPrice) {
      return {
        triggered: true,
        expired: false,
        reason: `Market price (${currentPrice}) reached user approved entry target (${setup.entryTriggerPrice}).`,
      };
    }

    return {
      triggered: false,
      expired: false,
    };
  }
}

export const entryMonitorEngine = new EntryMonitorEngine();
