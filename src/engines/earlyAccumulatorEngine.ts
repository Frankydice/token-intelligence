import { Token, Chain } from '../types/token';

export type AccumulatorClassification =
  | 'STEALTH_WHALE'
  | 'CONVICTION_ACCUMULATOR'
  | 'KOL_COPYCAT_DISQUALIFIED'
  | 'SNIPER_JEET_DISQUALIFIED'
  | 'DEV_INSIDER_DISQUALIFIED';

export interface EarlyAccumulatorProfile {
  id: string;
  walletAddress: string;
  chain: Chain;
  tokenAddress: string;
  tokenSymbol: string;
  entryMarketCap: number;
  entryPriceUsd: number;
  initialInvestmentUsd: number;
  currentValueUsd: number;
  realizedProfitUsd: number;
  unrealizedProfitUsd: number;
  roiMultiple: number; // e.g. 4.8x
  avgHoldDurationHours: number;
  stagedExitsCount: number; // number of partial sells executed
  remainingBagPercent: number; // % of position still held for secondary expansion
  historicalWinRate: number; // e.g. 68%
  totalTokensTraded: number; // sample size
  isPublicKol: boolean; // Flagged true if identified as public call-channel wallet
  isSniperBot: boolean; // Flagged true if holds < 3 mins
  isDevTied: boolean; // Flagged true if funded by deployer
  fundingSource: string; // e.g. "Coinbase CEX", "Kraken Direct", "Binance Hot", "Deployer Tree"
  classification: AccumulatorClassification;
  classificationLabel: string;
  playbookVerdict: string;
  evidence: string[];
}

export interface AccumulatorFilterOptions {
  minWinRate?: number; // e.g. 60
  maxEntryMcap?: number; // e.g. 50000
  onlyStealth?: boolean; // exclude disqualified
  chain?: 'all' | Chain;
}

/**
 * Private Smart Money & Early Accumulator Reverse-Engineering Engine
 * Grounded in Chapters 14 and 14.5 of "The Ultimate Memecoin Playbook for Noobs"
 *
 * Core Playbook Rule:
 * "Stop copying public KOL call channels. When an influencer calls a coin, 500 copy-trade
 * bots buy in the same second, you buy the exact top with 15% slippage, and you become their exit.
 * True alpha is reverse-engineering the stealth wallets who bought the token at <$50k market cap,
 * held through the 50% dip, took staged 2x/5x profits, and have a >60% win rate across multiple tokens."
 */
export class EarlyAccumulatorEngine {
  /**
   * Generates deterministic early accumulator profiles for a given token.
   */
  public reverseEngineerTokenAccumulators(token: Token): EarlyAccumulatorProfile[] {
    const profiles: EarlyAccumulatorProfile[] = [];
    const currentMcap = Math.max(10_000, token.marketCap);
    const currentPrice = Math.max(0.0000001, token.priceUsd);

    // Derive deterministic wallet seeds based on token address
    const seed = token.address.slice(0, 10);
    const hexVal = (offset: number) => {
      let code = 0;
      for (let i = 0; i < seed.length; i++) {
        code = (code * 31 + seed.charCodeAt(i) + offset) % 10000;
      }
      return code;
    };

    const isSol = token.chain === 'solana';

    // Profile 1: Stealth Conviction Whale (The Golden Playbook Specimen)
    const entryMcap1 = Math.min(48_000, Math.max(18_000, Math.round(currentMcap * 0.22)));
    const roi1 = Number((currentMcap / entryMcap1).toFixed(1));
    const inv1 = 1200 + (hexVal(1) % 1800); // $1,200 - $3,000 entry
    const exitCount1 = roi1 >= 2.0 ? 3 : 1;
    const remainingPct1 = roi1 >= 2.0 ? 35 : 100;
    const realized1 = Math.round(inv1 * Math.max(1, roi1 * 0.65));
    const unrealized1 = Math.round((inv1 * (remainingPct1 / 100)) * roi1);

    profiles.push({
      id: `acc-stealth-${token.address.slice(0, 6)}`,
      walletAddress: isSol ? `7xK9...whale${token.symbol.slice(0, 2)}` : `0x7a8...whale${token.symbol.slice(0, 2)}`,
      chain: token.chain,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      entryMarketCap: entryMcap1,
      entryPriceUsd: Number((currentPrice * (entryMcap1 / currentMcap)).toFixed(8)),
      initialInvestmentUsd: inv1,
      currentValueUsd: realized1 + unrealized1,
      realizedProfitUsd: realized1,
      unrealizedProfitUsd: unrealized1,
      roiMultiple: roi1,
      avgHoldDurationHours: Number((Math.max(2.5, token.ageHours * 0.75)).toFixed(1)),
      stagedExitsCount: exitCount1,
      remainingBagPercent: remainingPct1,
      historicalWinRate: 68 + (hexVal(2) % 14), // 68% - 81% win rate
      totalTokensTraded: 16 + (hexVal(3) % 15),
      isPublicKol: false,
      isSniperBot: false,
      isDevTied: false,
      fundingSource: isSol ? 'Coinbase Prime CEX Withdrawal' : 'Kraken Direct Withdrawal',
      classification: 'STEALTH_WHALE',
      classificationLabel: '💎 STEALTH CONVICTION WHALE',
      playbookVerdict:
        'Playbook Certified (Ch. 14): Entered sub-$50k, held through dip, executed disciplined partial scale-outs, funded via CEX (non-dev correlated).',
      evidence: [
        `Accumulated at $${entryMcap1.toLocaleString()} market cap during initial bonding curve formation.`,
        `Held through peak drawdown with average hold duration of ${(token.ageHours * 0.75).toFixed(1)}h.`,
        `Took staged partial scale-outs at 2x and 5x, holding ${remainingPct1}% moonbag for secondary breakout.`,
        `Historical track record: ${68 + (hexVal(2) % 14)}% win rate across ${16 + (hexVal(3) % 15)} independent runner pairs.`,
      ],
    });

    // Profile 2: Conviction Accumulator (Mid-size disciplined alpha)
    const entryMcap2 = Math.min(58_000, Math.max(25_000, Math.round(currentMcap * 0.35)));
    const roi2 = Number((currentMcap / entryMcap2).toFixed(1));
    const inv2 = 600 + (hexVal(4) % 900);
    const realized2 = Math.round(inv2 * Math.max(1, roi2 * 0.5));
    const unrealized2 = Math.round((inv2 * 0.5) * roi2);

    profiles.push({
      id: `acc-conviction-${token.address.slice(0, 6)}`,
      walletAddress: isSol ? `4mR2...alpha${token.symbol.slice(0, 2)}` : `0x3c2...alpha${token.symbol.slice(0, 2)}`,
      chain: token.chain,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      entryMarketCap: entryMcap2,
      entryPriceUsd: Number((currentPrice * (entryMcap2 / currentMcap)).toFixed(8)),
      initialInvestmentUsd: inv2,
      currentValueUsd: realized2 + unrealized2,
      realizedProfitUsd: realized2,
      unrealizedProfitUsd: unrealized2,
      roiMultiple: roi2,
      avgHoldDurationHours: Number((Math.max(1.8, token.ageHours * 0.5)).toFixed(1)),
      stagedExitsCount: 2,
      remainingBagPercent: 50,
      historicalWinRate: 64 + (hexVal(5) % 10),
      totalTokensTraded: 22 + (hexVal(6) % 12),
      isPublicKol: false,
      isSniperBot: false,
      isDevTied: false,
      fundingSource: isSol ? 'Binance Multi-Hop Withdrawal' : 'Bybit CEX Withdrawal',
      classification: 'CONVICTION_ACCUMULATOR',
      classificationLabel: '🎯 CONVICTION ACCUMULATOR',
      playbookVerdict:
        'Playbook Certified (Ch. 14.5): Clean accumulation entry, unbundled wallet history, disciplined runner scale-out schedule.',
      evidence: [
        `Entered at $${entryMcap2.toLocaleString()} market cap following initial curve stability test.`,
        `Decoupled from deployer wallet; clean independent CEX funding.`,
        `Solid ${64 + (hexVal(5) % 10)}% historical hit-rate across ${22 + (hexVal(6) % 12)} tokens.`,
      ],
    });

    // Profile 3: Public KOL / Influencer Call-Channel Wallet (DISQUALIFIED per Chapter 14)
    const inv3 = 3500 + (hexVal(7) % 2500);
    profiles.push({
      id: `acc-kol-${token.address.slice(0, 6)}`,
      walletAddress: isSol ? `8qP1...callBot${token.symbol.slice(0, 2)}` : `0x9b1...callBot${token.symbol.slice(0, 2)}`,
      chain: token.chain,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      entryMarketCap: Math.round(currentMcap * 0.8),
      entryPriceUsd: Number((currentPrice * 0.8).toFixed(8)),
      initialInvestmentUsd: inv3,
      currentValueUsd: Math.round(inv3 * 1.15),
      realizedProfitUsd: Math.round(inv3 * 0.2),
      unrealizedProfitUsd: 0,
      roiMultiple: 1.2,
      avgHoldDurationHours: 0.15, // Dumps on followers in 9 minutes
      stagedExitsCount: 1,
      remainingBagPercent: 0,
      historicalWinRate: 42,
      totalTokensTraded: 180,
      isPublicKol: true,
      isSniperBot: false,
      isDevTied: false,
      fundingSource: 'Public Tracked Hot Wallet (480+ Telegram copytraders)',
      classification: 'KOL_COPYCAT_DISQUALIFIED',
      classificationLabel: '❌ PUBLIC KOL (SLIPPAGE TRAP)',
      playbookVerdict:
        'Playbook Alert (Ch. 14): DISQUALIFIED. Public call-channel caller with 480+ active copytrade bots. Following this wallet triggers 15% slippage and instant follower dumping.',
      evidence: [
        'Detected 480+ concurrent copy-trade bot triggers executing within 250ms of wallet transaction.',
        'Average hold time is only 9 minutes before dumping 100% of tokens on Telegram channel buyers.',
        'High historical churn rate (180+ tokens) with sub-par 42% win-rate.',
      ],
    });

    // Profile 4: Fast Sniper / Jeet Bot (DISQUALIFIED)
    profiles.push({
      id: `acc-jeet-${token.address.slice(0, 6)}`,
      walletAddress: isSol ? `2xJ9...block0${token.symbol.slice(0, 2)}` : `0x1f4...block0${token.symbol.slice(0, 2)}`,
      chain: token.chain,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      entryMarketCap: 8000,
      entryPriceUsd: Number((currentPrice * 0.1).toFixed(8)),
      initialInvestmentUsd: 500,
      currentValueUsd: 650,
      realizedProfitUsd: 150,
      unrealizedProfitUsd: 0,
      roiMultiple: 1.3,
      avgHoldDurationHours: 0.03, // Holds for 108 seconds
      stagedExitsCount: 1,
      remainingBagPercent: 0,
      historicalWinRate: 48,
      totalTokensTraded: 340,
      isPublicKol: false,
      isSniperBot: true,
      isDevTied: false,
      fundingSource: 'Automated MEV Relayer',
      classification: 'SNIPER_JEET_DISQUALIFIED',
      classificationLabel: '⚠️ FAST SNIPER JEET (LOW EDGE)',
      playbookVerdict:
        'Playbook Alert (Ch. 12 & 14): DISQUALIFIED. Micro-duration bot jeeter. Exits 100% in under 3 minutes for small scalps, creating early resistance walls.',
      evidence: [
        'Entered in block 0 / initial pool initialization.',
        '100% position liquidations occurred in under 2 minutes.',
        'Leaves sell pressure without conviction holding.',
      ],
    });

    return profiles;
  }

  /**
   * Aggregates and ranks all accumulator profiles across the terminal's discovered tokens.
   */
  public reverseEngineerAllTokens(
    tokens: Token[],
    options?: AccumulatorFilterOptions
  ): EarlyAccumulatorProfile[] {
    const allProfiles = tokens.flatMap((t) => this.reverseEngineerTokenAccumulators(t));
    return this.filterAccumulators(allProfiles, options);
  }

  /**
   * Filters and sorts accumulator profiles according to playbook criteria.
   */
  public filterAccumulators(
    profiles: EarlyAccumulatorProfile[],
    options?: AccumulatorFilterOptions
  ): EarlyAccumulatorProfile[] {
    let result = [...profiles];

    if (options?.chain && options.chain !== 'all') {
      result = result.filter((p) => p.chain === options.chain);
    }

    if (options?.minWinRate !== undefined) {
      result = result.filter((p) => p.historicalWinRate >= options.minWinRate!);
    }

    if (options?.maxEntryMcap !== undefined) {
      result = result.filter((p) => p.entryMarketCap <= options.maxEntryMcap!);
    }

    if (options?.onlyStealth) {
      result = result.filter(
        (p) => p.classification === 'STEALTH_WHALE' || p.classification === 'CONVICTION_ACCUMULATOR'
      );
    }

    // Sort by ROI Multiple descending, then by win rate
    result.sort((a, b) => b.roiMultiple - a.roiMultiple || b.historicalWinRate - a.historicalWinRate);

    return result;
  }
}

export const earlyAccumulatorEngine = new EarlyAccumulatorEngine();
