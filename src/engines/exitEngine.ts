import { Position, ExitReason } from '../types/trade';

export interface ExitCheckResult {
  shouldExit: boolean;
  reason?: ExitReason;
  details?: string;
}

export class ExitEngine {
  public evaluateExitConditions(position: Position, currentPrice: number): ExitCheckResult {
    // 1. Take Profit
    if (currentPrice >= position.takeProfitPrice) {
      return {
        shouldExit: true,
        reason: 'TAKE_PROFIT',
        details: `Market price (${currentPrice}) hit pre-approved Take Profit target (${position.takeProfitPrice}).`,
      };
    }

    // 2. Stop Loss
    if (currentPrice <= position.stopLossPrice) {
      return {
        shouldExit: true,
        reason: 'STOP_LOSS',
        details: `Market price (${currentPrice}) hit pre-approved Stop Loss threshold (${position.stopLossPrice}).`,
      };
    }

    // 3. Trailing Stop
    if (position.trailingStopPrice && currentPrice <= position.trailingStopPrice) {
      return {
        shouldExit: true,
        reason: 'TRAILING_STOP',
        details: `Market price (${currentPrice}) pulled back below trailing stop floor (${position.trailingStopPrice}).`,
      };
    }

    return {
      shouldExit: false,
    };
  }
}

export const exitEngine = new ExitEngine();
