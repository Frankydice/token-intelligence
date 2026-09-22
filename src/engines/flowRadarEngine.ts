import { Token } from '../types/token';
import { FlowAlert } from '../types/wallet';

/**
 * Analyzes real-time volume, buy/sell ratios, and price change velocity
 * to separate tokens into Aggressive Dumps (Urgent Sells) and Aggressive Inflows (Breakouts).
 */
export function analyzeFlowRadar(tokens: Token[]): { dumps: FlowAlert[]; inflows: FlowAlert[] } {
  const dumps: FlowAlert[] = [];
  const inflows: FlowAlert[] = [];

  for (const token of tokens) {
    const totalVol = Math.max(1, token.volume24h);
    const buyVol = token.volumeBuy24h || totalVol * 0.5;
    const sellVol = token.volumeSell24h || totalVol * 0.5;
    const sellRatio = sellVol / totalVol;
    const buyRatio = buyVol / totalVol;
    const netFlow = buyVol - sellVol;
    const ratio = buyVol / Math.max(1, sellVol);

    const priceDropVelocity = Math.min(token.priceChange5m, token.priceChange1h, token.priceChange24h);
    const priceSurgeVelocity = Math.max(token.priceChange5m, token.priceChange1h, token.priceChange24h);

    // Criteria 1: Aggressive Dump / Urgent Sell Signal
    // Heavy sell ratio (> 58%), negative price movement, or high risk score with net negative flow
    const isAggressiveDump =
      (sellRatio >= 0.58 && priceDropVelocity < -3) ||
      priceDropVelocity <= -15 ||
      (token.riskScore >= 75 && sellRatio > 0.52);

    if (isAggressiveDump) {
      const isCritical = priceDropVelocity <= -25 || sellRatio >= 0.72 || token.riskScore >= 80;
      const urgency = isCritical ? 'IMMEDIATE_EXIT' : 'HIGH_RISK_AVOID';
      const severity = isCritical ? 'CRITICAL' : 'WARNING';
      const drainPercent = Math.min(65, Math.max(8, Math.round(sellRatio * 45)));

      dumps.push({
        id: `dump-${token.id}`,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chain: token.chain,
        type: 'AGGRESSIVE_DUMP',
        severity,
        headline: `🚨 URGENT EXIT: Aggressive Sell-Off (${sellRatio > 0.65 ? `${Math.round(sellRatio * 100)}% Sell Volume` : `${priceDropVelocity.toFixed(1)}% drop`})`,
        reason: `Heavy distribution detected with $${Math.round(sellVol).toLocaleString()} in sell orders heavily outpacing buys. Net capital outflow of $${Math.round(Math.abs(netFlow)).toLocaleString()} creates imminent pool drain risk.`,
        priceUsd: token.priceUsd,
        priceChangePercent: priceDropVelocity,
        volume24h: token.volume24h,
        netFlowUsd: netFlow,
        buySellRatio: parseFloat(ratio.toFixed(2)),
        sellVolumeUsd: Math.round(sellVol),
        buyVolumeUsd: Math.round(buyVol),
        sellCount: token.txns24hSell || Math.round((sellVol / Math.max(1, totalVol)) * 120),
        buyCount: token.txns24hBuy || Math.round((buyVol / Math.max(1, totalVol)) * 120),
        liquidityUsd: token.liquidity,
        liquidityDrainPercent: drainPercent,
        urgency,
        timestamp: Date.now(),
      });
    }

    // Criteria 2: Aggressive Inflow / Breakout Signal
    // Heavy buy ratio (> 62%), positive price surge, and decent liquidity
    const isAggressiveInflow =
      (buyRatio >= 0.62 && priceSurgeVelocity > 5) ||
      priceSurgeVelocity >= 20 ||
      (ratio >= 1.6 && token.volume24h > 15000);

    if (isAggressiveInflow) {
      const isScalpBreakout = priceSurgeVelocity >= 35 || ratio >= 2.2;
      const urgency = isScalpBreakout ? 'SCALP_BREAKOUT' : 'STRONG_ACCUMULATION';

      inflows.push({
        id: `inflow-${token.id}`,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chain: token.chain,
        type: 'AGGRESSIVE_INFLOW',
        severity: 'OPPORTUNITY',
        headline: `🚀 AGGRESSIVE INFLOW: Breakout Momentum (${ratio.toFixed(1)}x Buy Pressure)`,
        reason: `Aggressive market taker accumulation with $${Math.round(buyVol).toLocaleString()} in buy volume (${Math.round(buyRatio * 100)}% of total volume). Strong liquidity surge and upward momentum indicate buyer conviction.`,
        priceUsd: token.priceUsd,
        priceChangePercent: priceSurgeVelocity,
        volume24h: token.volume24h,
        netFlowUsd: netFlow,
        buySellRatio: parseFloat(ratio.toFixed(2)),
        sellVolumeUsd: Math.round(sellVol),
        buyVolumeUsd: Math.round(buyVol),
        sellCount: token.txns24hSell || Math.round((sellVol / Math.max(1, totalVol)) * 120),
        buyCount: token.txns24hBuy || Math.round((buyVol / Math.max(1, totalVol)) * 120),
        liquidityUsd: token.liquidity,
        urgency,
        timestamp: Date.now(),
      });
    }
  }

  // Sort dumps by severity & sell ratio, inflows by buy ratio & momentum
  dumps.sort((a, b) => (b.severity === 'CRITICAL' ? 1 : 0) - (a.severity === 'CRITICAL' ? 1 : 0) || b.sellVolumeUsd - a.sellVolumeUsd);
  inflows.sort((a, b) => b.buySellRatio - a.buySellRatio || b.buyVolumeUsd - a.buyVolumeUsd);

  return { dumps, inflows };
}
