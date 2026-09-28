import { Token } from '../types/token';

export interface VolumeAuthenticityResult {
  tokenAddress: string;
  authenticity: 'ORGANIC' | 'SUSPICIOUS' | 'WASH_TRADING';
  washTradingRiskScore: number; // 0 to 100 (100 = extreme wash trading probability)
  fees24h: number;
  volumeFeeRatio: number; // volume24h / Math.max(1, fees24h)
  feePercentage: number; // (fees24h / volume24h) * 100
  ratioDisplay: string; // e.g. "1/24th" or "1/85th"
  isPlaybookCompliant: boolean; // meets >= 1/30th fee rule
  reasons: string[];
  indicators: string[];
}

/**
 * Volume Authenticity & Wash Trading Detection Engine
 * Grounded in Chapters 3, 4, and 5 of "The Ultimate Memecoin Playbook for Noobs"
 *
 * Core Playbook Rule:
 * "Clean volume creates fees. Farmed volume creates almost none. If a token has
 * high volume but fees are less than 1/30th of expected volume, the coin is either
 * bundled or straight up going to rug because volume isn't real."
 */
export class VolumeAuthenticityEngine {
  /**
   * Evaluates volume authenticity based on on-chain liquidity, fee generation,
   * trade counts, and transaction rhythm.
   */
  public analyzeVolume(token: Token): VolumeAuthenticityResult {
    const reasons: string[] = [];
    const indicators: string[] = [];
    let washRiskScore = 10; // Baseline healthy score

    const volume = Math.max(0, token.volume24h);
    const liquidity = Math.max(1, token.liquidity);
    const totalTxns = Math.max(1, token.txns24hBuy + token.txns24hSell);

    // 1. Determine baseline fee tier by DEX / Chain
    // Pump.fun bonding curve = 1.0% fee tier
    // Standard AMM (Raydium, PancakeSwap, Robinhood L2) = 0.25% - 0.30% fee tier
    const isPumpFun = token.dexId.toLowerCase().includes('pump') || token.address.toLowerCase().endsWith('pump');
    const baseFeeTierPercent = isPumpFun ? 1.0 : 0.25;

    // Calculate actual or estimated protocol fees generated
    // If token already has explicit fees24h recorded, use it; otherwise compute from genuine volume & DEX tier
    let fees24h = token.fees24h;
    if (fees24h === undefined || fees24h < 0) {
      fees24h = Number((volume * (baseFeeTierPercent / 100)).toFixed(2));
    }

    const feePercentage = volume > 0 ? (fees24h / volume) * 100 : baseFeeTierPercent;
    const volumeFeeRatio = fees24h > 0 ? Number((volume / fees24h).toFixed(1)) : 100;
    const ratioFractionDenominator = Math.max(1, Math.round(volumeFeeRatio));
    const ratioDisplay = `1/${ratioFractionDenominator}th`;

    // 2. Playbook Rule 1: Volume-to-Fee Ratio Threshold
    // On bonding curves: Expected fee is ~1/20th to 1/30th of volume.
    // If fees are far below 1/30th of expected tier, volume is wash-traded.
    const expectedMinFeePercent = isPumpFun ? 0.8 : 0.2; // ~1/30th threshold relative to DEX protocol
    const isPlaybookCompliant = feePercentage >= expectedMinFeePercent;

    if (!isPlaybookCompliant && volume > 5000) {
      washRiskScore += 45;
      reasons.push(
        `Volume-to-Fee Deficit: 24h fee yield (${feePercentage.toFixed(2)}%) is below the safe 1/30th playbook threshold for ${token.dexId}.`
      );
      indicators.push('WASH_TRADING_FEE_DEFICIT');
    } else if (feePercentage >= expectedMinFeePercent) {
      reasons.push(
        `Healthy Fee Yield: Generates ${ratioDisplay} volume in protocol LP fees (${feePercentage.toFixed(2)}%), matching organic trade activity.`
      );
    }

    // 3. Playbook Rule 2: Volume-to-Liquidity Disconnect
    // If volume is > 30x liquidity and liquidity is under $25,000 with low txns, real traders would slip price severely
    const volumeToLiq = volume / liquidity;
    if (volumeToLiq > 35 && liquidity < 25000 && totalTxns < 200) {
      washRiskScore += 30;
      reasons.push(
        `Volume-to-Liquidity Disconnect: 24h volume ($${volume.toLocaleString()}) is ${volumeToLiq.toFixed(1)}x greater than pool liquidity ($${liquidity.toLocaleString()}) with only ${totalTxns} total swaps.`
      );
      indicators.push('UNSUSTAINABLE_VOLUME_LIQUIDITY_DISCONNECT');
    }

    // 4. Playbook Rule 3: Transaction Rhythm & Ticket Uniformity
    // Real volume looks messy; fake volume has extreme buy-bias (>95% buys) or perfectly identical ticket sizes
    const buyCount = token.txns24hBuy;
    const sellCount = token.txns24hSell;
    if (totalTxns > 40) {
      const buyRatio = buyCount / totalTxns;
      if (buyRatio > 0.94 && sellCount <= 2) {
        washRiskScore += 25;
        reasons.push(
          `Artificial Buy Bias: ${buyCount} buys vs only ${sellCount} sells. Lack of natural profit-taking signals bot-manufactured volume ramp.`
        );
        indicators.push('UNNATURAL_BUY_BIAS');
      }

      // Check average ticket size uniformity
      const avgBuySize = token.volumeBuy24h / Math.max(1, buyCount);
      const avgSellSize = token.volumeSell24h / Math.max(1, sellCount);
      if (sellCount > 10 && Math.abs(avgBuySize - avgSellSize) < avgBuySize * 0.03 && volume > 20000) {
        washRiskScore += 20;
        reasons.push(
          `Uniform Ticket Sizing: Average buy ($${avgBuySize.toFixed(0)}) exactly mirrors average sell ($${avgSellSize.toFixed(0)}), indicating loop wash-trading.`
        );
        indicators.push('LOOP_WASH_TRADING_UNIFORMITY');
      }
    }

    // 5. Final Classification
    const finalRiskScore = Math.min(100, Math.max(0, washRiskScore));
    let authenticity: 'ORGANIC' | 'SUSPICIOUS' | 'WASH_TRADING' = 'ORGANIC';

    if (finalRiskScore >= 60 || (!isPlaybookCompliant && volume > 10000)) {
      authenticity = 'WASH_TRADING';
    } else if (finalRiskScore >= 35) {
      authenticity = 'SUSPICIOUS';
    } else {
      authenticity = 'ORGANIC';
    }

    return {
      tokenAddress: token.address,
      authenticity,
      washTradingRiskScore: finalRiskScore,
      fees24h,
      volumeFeeRatio,
      feePercentage,
      ratioDisplay,
      isPlaybookCompliant,
      reasons,
      indicators,
    };
  }

  /**
   * Enriches a token object with volume authenticity metrics
   */
  public enrichToken(token: Token): Token {
    const analysis = this.analyzeVolume(token);
    return {
      ...token,
      fees24h: analysis.fees24h,
      volumeFeeRatio: analysis.volumeFeeRatio,
      volumeAuthenticity: analysis.authenticity,
      washTradingRiskScore: analysis.washTradingRiskScore,
    };
  }
}

export const volumeAuthenticityEngine = new VolumeAuthenticityEngine();
