import { Position, ExitReason } from '../types/trade';
import { sniperPresetEngine } from './sniperPresetEngine';

export interface ExitCheckResult {
  shouldExit: boolean;
  reason?: ExitReason;
  details?: string;
}

export interface ExitEvaluationContext {
  elapsedMinutes?: number;
  devSellDetected?: boolean;
  devSellPercent?: number;
  washRiskScore?: number;
}

export class ExitEngine {
  public evaluateExitConditions(
    position: Position,
    currentPrice: number,
    context?: ExitEvaluationContext
  ): ExitCheckResult {
    // 1. Controlled Jeeting Rules (Playbook Ch. 12)
    if (position.sniperPreset) {
      const elapsedMinutes =
        context?.elapsedMinutes ?? Math.max(0, Math.round((Date.now() - position.entryTimestamp) / 60000));
      const jeetCheck = sniperPresetEngine.evaluateControlledJeet(position, {
        elapsedMinutes,
        devSellDetected: context?.devSellDetected,
        devSellPercent: context?.devSellPercent,
        washRiskScore: context?.washRiskScore,
      });

      if (jeetCheck.shouldJeet) {
        return {
          shouldExit: true,
          reason: jeetCheck.reason,
          details: jeetCheck.details,
        };
      }
    }

    // 2. Take Profit
    if (currentPrice >= position.takeProfitPrice) {
      return {
        shouldExit: true,
        reason: 'TAKE_PROFIT',
        details: `Market price (${currentPrice}) hit pre-approved Take Profit target (${position.takeProfitPrice}).`,
      };
    }

    // 3. Stop Loss
    if (currentPrice <= position.stopLossPrice) {
      return {
        shouldExit: true,
        reason: 'STOP_LOSS',
        details: `Market price (${currentPrice}) hit pre-approved Stop Loss threshold (${position.stopLossPrice}).`,
      };
    }

    // 4. Trailing Stop
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
