import { describe, it, expect } from 'vitest';
import { lifecycleEngine } from '../src/engines/lifecycleEngine';
import { Token } from '../src/types/token';

describe('LifecycleEngine - Memecoin Playbook 3-Tier Lifecycle & OG Revivals', () => {
  const baseToken: Token = {
    id: 'test-token-01',
    name: 'Test Token',
    symbol: 'TEST',
    address: 'So11111111111111111111111111111111111111112',
    chain: 'solana',
    pairAddress: 'pair-01',
    dexId: 'pumpfun',
    priceUsd: 0.00005,
    priceChange24h: 12.0,
    priceChange1h: 2.0,
    priceChange5m: 0.5,
    marketCap: 25000,
    liquidity: 12000,
    liquidityChange24h: 5.0,
    volume24h: 50000,
    volumeBuy24h: 30000,
    volumeSell24h: 20000,
    txns24hBuy: 400,
    txns24hSell: 200,
    holdersCount: 350,
    holderGrowth24hPercent: 15,
    createdAt: Date.now() - 3600 * 1000, // 1 hour ago
    ageHours: 1.0,
    creatorAddress: 'creator-01',
    riskScore: 25,
    opportunityScore: 75,
    isDemo: false,
    tags: ['new'],
    circulatingSupply: 1_000_000_000,
    totalSupply: 1_000_000_000,
    fees24h: 500, // $500 in fees = ~3.33 SOL
  };

  it('correctly calculates bonding curve progress for sub-bonding pairs', () => {
    // $25,000 mcap on pump.fun (~$69,000 target) -> ~36%
    const progress = lifecycleEngine.calculateBondingProgress(baseToken);
    expect(progress).toBe(36);

    // Graduated DEX pool with AMM liquidity -> 100%
    const graduatedToken: Token = {
      ...baseToken,
      dexId: 'raydium',
      marketCap: 250000,
      liquidity: 50000,
    };
    expect(lifecycleEngine.calculateBondingProgress(graduatedToken)).toBe(100);
  });

  it('determines Tier 1: Sub-Bonding Curve (new_pairs) for early launches', () => {
    const stage = lifecycleEngine.determineLifecycleStage(baseToken);
    expect(stage).toBe('new_pairs');

    const audit = lifecycleEngine.analyzeLifecycle(baseToken);
    expect(audit.stage).toBe('new_pairs');
    expect(audit.isPreMigration).toBe(false);
    expect(audit.minFeeRequiredSol).toBe(0.1);
    expect(audit.meetsFeeThreshold).toBe(true);
  });

  it('determines Tier 2: About to Graduate for 75-99% bonding curve push ($60k-$90k)', () => {
    const preGradToken: Token = {
      ...baseToken,
      marketCap: 60000, // ~87% progress
      dexId: 'pumpfun',
      fees24h: 350, // > 2 SOL fees ($300)
    };

    const progress = lifecycleEngine.calculateBondingProgress(preGradToken);
    expect(progress).toBeGreaterThanOrEqual(75);
    expect(progress).toBeLessThanOrEqual(99);

    const stage = lifecycleEngine.determineLifecycleStage(preGradToken);
    expect(stage).toBe('about_to_graduate');

    const audit = lifecycleEngine.analyzeLifecycle(preGradToken);
    expect(audit.isPreMigration).toBe(true);
    expect(audit.minFeeRequiredSol).toBe(2.0);
    expect(audit.meetsFeeThreshold).toBe(true);
    expect(audit.stageLabel).toContain('About to Graduate');
  });

  it('determines Tier 3: Graduated DEX Pools for established AMM pairs', () => {
    const dexToken: Token = {
      ...baseToken,
      dexId: 'raydium',
      marketCap: 500000,
      liquidity: 80000,
      fees24h: 1200, // ~8 SOL fees
    };

    const stage = lifecycleEngine.determineLifecycleStage(dexToken);
    expect(stage).toBe('graduated');

    const audit = lifecycleEngine.analyzeLifecycle(dexToken);
    expect(audit.isGraduated).toBe(true);
    expect(audit.minFeeRequiredSol).toBe(5.0);
    expect(audit.meetsFeeThreshold).toBe(true);
  });

  it('determines Tier 4: OG Revivals for tokens older than 14 days with active pulse', () => {
    const ogToken: Token = {
      ...baseToken,
      ageHours: 400, // > 336 hours (16.6 days)
      createdAt: Date.now() - 400 * 3600 * 1000,
      marketCap: 150000,
      dexId: 'raydium',
    };

    const stage = lifecycleEngine.determineLifecycleStage(ogToken);
    expect(stage).toBe('og_revivals');

    const audit = lifecycleEngine.analyzeLifecycle(ogToken);
    expect(audit.isOgRevival).toBe(true);
    expect(audit.stageLabel).toContain('OG Revival');
  });

  it('properly filters tokens matching user selected lifecycle tab', () => {
    const subBondingToken: Token = { ...baseToken, marketCap: 20000, dexId: 'pumpfun' };
    const preGradToken: Token = { ...baseToken, marketCap: 62000, dexId: 'pumpfun' };
    const graduatedToken: Token = { ...baseToken, marketCap: 200000, dexId: 'raydium', liquidity: 40000 };
    const ogToken: Token = { ...baseToken, ageHours: 500, createdAt: Date.now() - 500 * 3600 * 1000 };

    // 'all' passes everything
    expect(lifecycleEngine.isTokenInLifecycleStage(subBondingToken, 'all')).toBe(true);
    expect(lifecycleEngine.isTokenInLifecycleStage(graduatedToken, 'all')).toBe(true);

    // 'new_pairs'
    expect(lifecycleEngine.isTokenInLifecycleStage(subBondingToken, 'new_pairs')).toBe(true);
    expect(lifecycleEngine.isTokenInLifecycleStage(graduatedToken, 'new_pairs')).toBe(false);

    // 'about_to_graduate'
    expect(lifecycleEngine.isTokenInLifecycleStage(preGradToken, 'about_to_graduate')).toBe(true);
    expect(lifecycleEngine.isTokenInLifecycleStage(subBondingToken, 'about_to_graduate')).toBe(false);

    // 'graduated'
    expect(lifecycleEngine.isTokenInLifecycleStage(graduatedToken, 'graduated')).toBe(true);
    expect(lifecycleEngine.isTokenInLifecycleStage(subBondingToken, 'graduated')).toBe(false);

    // 'og_revivals'
    expect(lifecycleEngine.isTokenInLifecycleStage(ogToken, 'og_revivals')).toBe(true);
    expect(lifecycleEngine.isTokenInLifecycleStage(subBondingToken, 'og_revivals')).toBe(false);
  });

  it('enriches a token with lifecycleStage and bondingProgress', () => {
    const enriched = lifecycleEngine.enrichToken(baseToken);
    expect(enriched.lifecycleStage).toBe('new_pairs');
    expect(enriched.bondingProgress).toBeDefined();
    expect(typeof enriched.bondingProgress).toBe('number');
  });
});
