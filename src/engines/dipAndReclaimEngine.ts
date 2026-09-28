import { Token } from '../types/token';

export interface ReclaimSignalResult {
  isReclaimSetup: boolean;
  status: 'CONFIRMED_RECLAIM' | 'TESTING_RECLAIM' | 'FORMING_DIP' | 'NONE';
  statusLabel: string;
  confidence: 'HIGH' | 'MEDIUM' | 'SPECULATIVE' | 'NONE';
  currentMarketCap: number;
  dipFloorEstimatedMcap: number; // e.g. ~$50,000 - $80,000
  reclaimThresholdMcap: number; // $100,000
  buyPressureRatio: number; // buy txns / sell txns
  organicVolumeConfirmed: boolean;
  targetScenarios: {
    entryPrice: number;
    tp1Price: number; // 2x (~$200k mcap)
    tp1Mcap: number;
    tp2Price: number; // 5x (~$500k mcap)
    tp2Mcap: number;
    runnerMcap: number; // 10x (~$1M+ mcap)
    stopLossPrice: number; // ~$80k mcap floor break
    stopLossMcap: number;
  };
  evidence: string[];
  playbookStrategy: string;
}

/**
 * The "100k Dip & Reclaim" Signal Engine
 * Grounded in Chapter 9 of "The Ultimate Memecoin Playbook for Noobs"
 *
 * Core Playbook Rule:
 * "The 100k reclaim is the single highest-probability trade setup in memecoins.
 * When a coin graduates from pump.fun to Raydium (or launches on DEX), early snipers
 * and curve buyers dump, causing a severe dip down to $40k-$80k.
 * When real buyer demand absorbs the dump and pushes market cap back above $100,000
 * with authentic volume, it signals the start of the secondary expansion towards
 * $300k, $500k, and $1M+."
 */
export class DipAndReclaimEngine {
  private readonly RECLAIM_THRESHOLD_MCAP = 100_000;
  private readonly RECLAIM_LOWER_BOUND_MCAP = 92_000;
  private readonly RECLAIM_UPPER_BOUND_MCAP = 180_000;
  private readonly TESTING_LOWER_BOUND_MCAP = 78_000;
  private readonly DIP_LOWER_BOUND_MCAP = 40_000;

  /**
   * Evaluates whether a token matches the 100k Dip & Reclaim pattern.
   */
  public analyzeToken(token: Token): ReclaimSignalResult {
    const evidence: string[] = [];
    const mcap = Math.max(1, token.marketCap);
    const price = Math.max(0.00000001, token.priceUsd);
    const buyTxns = Math.max(1, token.txns24hBuy);
    const sellTxns = Math.max(1, token.txns24hSell);
    const buyPressureRatio = Number((buyTxns / sellTxns).toFixed(2));
    const isOrganic = token.volumeAuthenticity !== 'WASH_TRADING' && (token.washTradingRiskScore ?? 0) < 55;

    // Check if token is on DEX AMM or graduated curve
    const isPumpFun = token.dexId.toLowerCase().includes('pump') || token.address.toLowerCase().endsWith('pump');
    const isGraduated =
      !isPumpFun ||
      token.bondingProgress === 100 ||
      token.lifecycleStage === 'graduated' ||
      token.liquidity >= 15_000 ||
      mcap >= 90_000;

    // Estimate the dip floor price & mcap (consolidation floor during initial selloff)
    const dipFloorEstimatedMcap = Math.min(80_000, Math.max(45_000, Math.round(mcap * 0.65)));

    // Scenario calculations based on standard playbook multiples
    const tp1Mcap = 200_000;
    const tp2Mcap = 500_000;
    const runnerMcap = 1_000_000;
    const stopLossMcap = 80_000;

    const tp1Price = Number((price * (tp1Mcap / mcap)).toFixed(8));
    const tp2Price = Number((price * (tp2Mcap / mcap)).toFixed(8));
    const stopLossPrice = Number((price * (stopLossMcap / mcap)).toFixed(8));

    const targetScenarios = {
      entryPrice: price,
      tp1Price,
      tp1Mcap,
      tp2Price,
      tp2Mcap,
      runnerMcap,
      stopLossPrice,
      stopLossMcap,
    };

    // 1. Check for Confirmed Reclaim:
    // Market cap between $92k and $180k, on DEX AMM, positive buy imbalance, organic volume
    if (
      isGraduated &&
      mcap >= this.RECLAIM_LOWER_BOUND_MCAP &&
      mcap <= this.RECLAIM_UPPER_BOUND_MCAP &&
      isOrganic &&
      buyPressureRatio >= 1.05
    ) {
      let confidence: 'HIGH' | 'MEDIUM' | 'SPECULATIVE' = 'MEDIUM';
      if (buyPressureRatio >= 1.35 && token.priceChange1h > 0 && token.riskScore <= 45) {
        confidence = 'HIGH';
      }

      evidence.push(
        `$100K Market Cap Reclaimed: Currently trading at $${Math.round(mcap).toLocaleString()} following migration consolidation.`
      );
      evidence.push(
        `Buy Imbalance Dominance: Buy orders (${buyTxns}) exceed sell orders (${sellTxns}) by ${buyPressureRatio}x.`
      );
      evidence.push(
        `Organic Volume Verified: Generating protocol LP fees with no wash-trading penalties detected.`
      );

      return {
        isReclaimSetup: true,
        status: 'CONFIRMED_RECLAIM',
        statusLabel: 'CONFIRMED 100K RECLAIM',
        confidence,
        currentMarketCap: mcap,
        dipFloorEstimatedMcap,
        reclaimThresholdMcap: this.RECLAIM_THRESHOLD_MCAP,
        buyPressureRatio,
        organicVolumeConfirmed: true,
        targetScenarios,
        evidence,
        playbookStrategy:
          'Playbook Execution (Ch. 9): High-probability entry. Enter now or on minor pullback to $95K-$100K. Stop loss at $80K (floor break). Take profit 50% at $200K, 25% at $500K, let remainder ride to $1M.',
      };
    }

    // 2. Check for Testing Reclaim:
    // Market cap between $78k and $92k pushing towards $100k
    if (isGraduated && mcap >= this.TESTING_LOWER_BOUND_MCAP && mcap < this.RECLAIM_LOWER_BOUND_MCAP && isOrganic) {
      evidence.push(
        `Testing Reclaim Level: Market cap is $${Math.round(mcap).toLocaleString()}, approaching the pivotal $100K resistance level.`
      );
      if (buyPressureRatio >= 1.1) {
        evidence.push(`Active Buyer Inflow: Buy volume outpaces sell volume with ${buyPressureRatio}x buy-to-sell ratio.`);
      }

      return {
        isReclaimSetup: true,
        status: 'TESTING_RECLAIM',
        statusLabel: 'TESTING 100K LEVEL',
        confidence: buyPressureRatio >= 1.3 ? 'MEDIUM' : 'SPECULATIVE',
        currentMarketCap: mcap,
        dipFloorEstimatedMcap,
        reclaimThresholdMcap: this.RECLAIM_THRESHOLD_MCAP,
        buyPressureRatio,
        organicVolumeConfirmed: true,
        targetScenarios,
        evidence,
        playbookStrategy:
          'Playbook Execution (Ch. 9): Watch candle closes above $100K. Wait for clean hourly hold above $100K before aggressive size, or front-run with tight stop under $75K.',
      };
    }

    // 3. Check for Forming Dip:
    // Post-graduation token in $40k-$78k range establishing consolidation support
    if (isGraduated && mcap >= this.DIP_LOWER_BOUND_MCAP && mcap < this.TESTING_LOWER_BOUND_MCAP) {
      evidence.push(
        `Post-Migration Dip: Market cap at $${Math.round(mcap).toLocaleString()} absorbing initial sniper and dev supply selloffs.`
      );

      return {
        isReclaimSetup: false,
        status: 'FORMING_DIP',
        statusLabel: 'FORMING MIGRATION DIP',
        confidence: 'SPECULATIVE',
        currentMarketCap: mcap,
        dipFloorEstimatedMcap,
        reclaimThresholdMcap: this.RECLAIM_THRESHOLD_MCAP,
        buyPressureRatio,
        organicVolumeConfirmed: isOrganic,
        targetScenarios,
        evidence,
        playbookStrategy:
          'Playbook Execution (Ch. 9): In migration dip zone. Do NOT FOMO early. Wait for buy volume to stabilize and reclaim $95K-$100K before full position.',
      };
    }

    return {
      isReclaimSetup: false,
      status: 'NONE',
      statusLabel: 'NO RECLAIM PATTERN',
      confidence: 'NONE',
      currentMarketCap: mcap,
      dipFloorEstimatedMcap,
      reclaimThresholdMcap: this.RECLAIM_THRESHOLD_MCAP,
      buyPressureRatio,
      organicVolumeConfirmed: isOrganic,
      targetScenarios,
      evidence: ['Token is not currently exhibiting the 100k migration dip and reclaim pattern.'],
      playbookStrategy: 'Standard trading rules apply; no 100k reclaim pattern identified.',
    };
  }

  /**
   * Enriches a token with reclaim signal intelligence and dynamic tag.
   */
  public enrichToken(token: Token): Token {
    const analysis = this.analyzeToken(token);

    const tags = [...token.tags];
    if (analysis.status === 'CONFIRMED_RECLAIM' && !tags.includes('reclaim_100k')) {
      tags.push('reclaim_100k');
    }

    return {
      ...token,
      reclaimSignal: analysis.status,
      tags,
    };
  }
}

export const dipAndReclaimEngine = new DipAndReclaimEngine();
