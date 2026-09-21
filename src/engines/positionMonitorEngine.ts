import { Position } from '../types/trade';
import { calculatePnl } from '../utils/math';

export interface PositionUpdateResult {
  updatedPosition: Position;
  riskAlert?: {
    type: 'LIQUIDITY_COLLAPSE' | 'CREATOR_DUMP' | 'ABNORMAL_VOLATILITY';
    message: string;
  };
}

export class PositionMonitorEngine {
  public updatePosition(
    position: Position,
    currentPrice: number,
    currentLiquidity?: number,
    initialLiquidity?: number
  ): PositionUpdateResult {
    const { pnlUsd, pnlPercent, currentValueUsd } = calculatePnl(
      position.entryPrice,
      currentPrice,
      position.positionSizeUsd
    );

    const maxPriceObserved = Math.max(position.maxPriceObserved || position.entryPrice, currentPrice);

    let trailingStopPrice = position.trailingStopPrice;
    if (position.trailingStopPrice && maxPriceObserved > position.entryPrice) {
      // Ratchet trailing stop upward if configured
      // E.g. trailing stop percent from peak
      const dropFromPeak = ((maxPriceObserved - currentPrice) / maxPriceObserved) * 100;
      if (dropFromPeak > 0) {
        // preserve existing trailing trigger
      }
    }

    const updatedPosition: Position = {
      ...position,
      currentPrice,
      currentValueUsd,
      unrealizedPnlUsd: pnlUsd,
      unrealizedPnlPercent: pnlPercent,
      maxPriceObserved,
      trailingStopPrice,
    };

    let riskAlert: PositionUpdateResult['riskAlert'];

    // Liquidity collapse alert check
    if (initialLiquidity && currentLiquidity && currentLiquidity < initialLiquidity * 0.5) {
      riskAlert = {
        type: 'LIQUIDITY_COLLAPSE',
        message: `Pool liquidity dropped by ${(((initialLiquidity - currentLiquidity) / initialLiquidity) * 100).toFixed(1)}%! Immediate exit recommended.`,
      };
    }

    return {
      updatedPosition,
      riskAlert,
    };
  }
}

export const positionMonitorEngine = new PositionMonitorEngine();
