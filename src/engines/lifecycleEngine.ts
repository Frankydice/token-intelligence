import { Token, LifecycleStage } from '../types/token';

export interface LifecycleAuditResult {
  stage: LifecycleStage;
  stageLabel: string;
  bondingProgress: number; // 0 to 100%
  isPreMigration: boolean;
  isGraduated: boolean;
  isOgRevival: boolean;
  feesSolEstimate: number; // Estimated 24h fees in SOL (based on ~$150/SOL)
  minFeeRequiredSol: number; // Playbook requirement
  meetsFeeThreshold: boolean;
  playbookStrategy: string;
  reasons: string[];
}

/**
 * Memecoin 3-Tier Lifecycle & OG Revival Engine
 * Grounded in Chapters 5, 8, 11, 13, and 15 of "The Ultimate Memecoin Playbook for Noobs"
 *
 * Playbook Lifecycle Structure:
 * - Tier 1: Sub-Bonding Curve (< $60K Market Cap / Early Launch / Pump.fun)
 *   Requires >= 0.1 SOL (~$15) protocol fees, clean dev & low sniper/bundle risk.
 *
 * - Tier 2: About to Graduate / Pre-Migration (75% to 99% Bonding Curve / $60K - $90K Market Cap)
 *   Requires >= 2 SOL (~$300) fees. The high-risk, high-reward graduation push corridor.
 *
 * - Tier 3: Graduated DEX Pools ($70K - $1M+ Market Cap / Raydium / PancakeSwap / Robinhood L2)
 *   Requires >= 5 SOL (~$750) fees, established liquidity AMM pool, locked/burnt LP.
 *
 * - Tier 4: OG Revivals (> 14 Days Old / Dead Coins Coming Back to Life / CTOs)
 *   Requires age > 336h, active 24h volume (> $3k or positive momentum), healthy holder base.
 */
export class LifecycleEngine {
  private readonly SOL_PRICE_USD = 150;
  private readonly GRADUATION_MCAP_TARGET = 69000;
  private readonly OG_REVIVAL_MIN_AGE_HOURS = 336; // 14 days * 24 hours

  /**
   * Calculates estimated bonding curve completion percentage (0 - 100%).
   * Sub-bonding pairs on pump.fun graduate at ~$69k market cap.
   * DEX AMM pairs (Raydium, PancakeSwap) are treated as 100% graduated.
   */
  public calculateBondingProgress(token: Token): number {
    const isPumpFun = token.dexId.toLowerCase().includes('pump') || token.address.toLowerCase().endsWith('pump');

    if (!isPumpFun) {
      // Standard DEX pairs with liquidity are 100% graduated
      if (token.marketCap >= 50000 || token.liquidity >= 15000) {
        return 100;
      }
    }

    // On pump.fun or sub-bonding curve
    const progress = (token.marketCap / this.GRADUATION_MCAP_TARGET) * 100;
    return Math.min(99, Math.max(1, Math.round(progress)));
  }

  /**
   * Determines the token's lifecycle stage based on age, market cap, DEX type, and bonding progress.
   */
  public determineLifecycleStage(token: Token): LifecycleStage {
    const ageHours = token.ageHours ?? 0;
    const isPumpFun = token.dexId.toLowerCase().includes('pump') || token.address.toLowerCase().endsWith('pump');
    const bondingProgress = this.calculateBondingProgress(token);

    // 1. OG Revival Check (Chapter 13 & 15: Age > 14 days with active pulse)
    if (ageHours >= this.OG_REVIVAL_MIN_AGE_HOURS) {
      return 'og_revivals';
    }

    // 2. About to Graduate (Chapter 8: 75% to 99% bonding curve or $55k-$95k corridor on pump.fun)
    if (
      isPumpFun &&
      ((bondingProgress >= 75 && bondingProgress <= 99) || (token.marketCap >= 55000 && token.marketCap <= 95000))
    ) {
      return 'about_to_graduate';
    }

    // 3. Graduated AMM Pool (Chapter 11: Non-pumpfun AMM, or market cap > $95k, or 100% curve completion)
    if (!isPumpFun && (token.liquidity >= 15000 || token.marketCap >= 70000 || bondingProgress >= 100)) {
      return 'graduated';
    }

    // 4. Default to New Pairs / Sub-Bonding Curve (Chapter 5)
    return 'new_pairs';
  }

  /**
   * Performs an in-depth audit of the token's lifecycle status, fee generation compliance,
   * and provides tactical playbook guidance.
   */
  public analyzeLifecycle(token: Token): LifecycleAuditResult {
    const stage = this.determineLifecycleStage(token);
    const bondingProgress = this.calculateBondingProgress(token);
    const feesUsd = token.fees24h ?? (token.volume24h * 0.0025);
    const feesSol = Number((feesUsd / this.SOL_PRICE_USD).toFixed(2));
    const reasons: string[] = [];

    let stageLabel = 'Sub-Bonding Curve';
    let minFeeRequiredSol = 0.1;
    let playbookStrategy = '';

    switch (stage) {
      case 'new_pairs':
        stageLabel = 'Sub-Bonding Curve (< $60K)';
        minFeeRequiredSol = 0.1; // Chapter 5: 0.1 SOL min fees (~$15)
        playbookStrategy =
          'Playbook Rule (Ch. 5): 98% fail to graduate. Fast scalps or immediate runner snipes. Cut instantly if dev volume stalls.';
        if (feesSol < 0.1 && token.ageHours > 1) {
          reasons.push(`Low Fee Activity: Generated ${feesSol} SOL fees (< 0.1 SOL playbook requirement).`);
        } else {
          reasons.push(`Healthy Early Activity: Generated ${feesSol} SOL in early fees.`);
        }
        break;

      case 'about_to_graduate':
        stageLabel = 'About to Graduate (75-99%)';
        minFeeRequiredSol = 2.0; // Chapter 8: 2 SOL min fees (~$300)
        playbookStrategy =
          'Playbook Rule (Ch. 8): The Graduation Push. Watch for raydium migration dumps or 100k dip reclaims. High volatility zone.';
        if (feesSol < 2.0) {
          reasons.push(`Underpowered Fee Volume: ${feesSol} SOL fees (< 2 SOL playbook target for graduation push).`);
        } else {
          reasons.push(`Strong Graduation Momentum: ${feesSol} SOL in fees driving the bonding curve push.`);
        }
        break;

      case 'graduated':
        stageLabel = 'Graduated DEX Pool';
        minFeeRequiredSol = 5.0; // Chapter 11: 5 SOL min fees (~$750)
        playbookStrategy =
          'Playbook Rule (Ch. 11): Post-Graduation AMM. Requires real LP liquidity, locked status, and established consolidation support.';
        if (feesSol < 5.0 && token.volume24h < 50000) {
          reasons.push(`Fee Generation Modest: ${feesSol} SOL fees (< 5 SOL ideal for tier-3 pools).`);
        } else {
          reasons.push(`Substantial DEX LP Fees: ${feesSol} SOL generated from organic AMM volume.`);
        }
        break;

      case 'og_revivals':
        stageLabel = 'OG Revival (> 14 Days)';
        minFeeRequiredSol = 0.5;
        playbookStrategy =
          'Playbook Rule (Ch. 13 & 15): CTO / Revived Project. Dev has departed, community takeover active with clean supply redistribution.';
        reasons.push(`Established History: ${token.ageHours ? Math.round(token.ageHours / 24) : 15} days old with renewed trading interest.`);
        break;
    }

    const meetsFeeThreshold = feesSol >= minFeeRequiredSol;

    return {
      stage,
      stageLabel,
      bondingProgress,
      isPreMigration: stage === 'about_to_graduate',
      isGraduated: stage === 'graduated',
      isOgRevival: stage === 'og_revivals',
      feesSolEstimate: feesSol,
      minFeeRequiredSol,
      meetsFeeThreshold,
      playbookStrategy,
      reasons,
    };
  }

  /**
   * Filters tokens based on the active lifecycle stage selected by the user.
   */
  public isTokenInLifecycleStage(token: Token, filterStage: 'all' | LifecycleStage): boolean {
    if (!filterStage || filterStage === 'all') return true;

    const stage = token.lifecycleStage || this.determineLifecycleStage(token);
    return stage === filterStage;
  }

  /**
   * Enriches a token object with its evaluated lifecycle stage and bonding progress percentage.
   */
  public enrichToken(token: Token): Token {
    const bondingProgress = this.calculateBondingProgress(token);
    const lifecycleStage = this.determineLifecycleStage(token);

    return {
      ...token,
      lifecycleStage,
      bondingProgress,
    };
  }
}

export const lifecycleEngine = new LifecycleEngine();
