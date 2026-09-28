import { describe, it, expect } from 'vitest';
import { dipAndReclaimEngine } from '../src/engines/dipAndReclaimEngine';
import { Token } from '../src/types/token';

describe('DipAndReclaimEngine - 100k Dip & Reclaim Strategy (Playbook Ch. 9)', () => {
  const baseGraduatedToken: Token = {
    id: 'test-token-grad',
    name: 'Graduated Runner',
    symbol: 'RUNNER',
    address: 'So11111111111111111111111111111111111111115',
    chain: 'solana',
    pairAddress: 'pair-grad-01',
    dexId: 'raydium',
    priceUsd: 0.000105,
    priceChange24h: 35.0,
    priceChange1h: 4.5,
    priceChange5m: 1.2,
    marketCap: 105000, // Reclaimed $100K level!
    liquidity: 32000,
    liquidityChange24h: 12.0,
    volume24h: 180000,
    volumeBuy24h: 110000,
    volumeSell24h: 70000,
    txns24hBuy: 850,
    txns24hSell: 450, // Buy/sell ratio ~1.88x
    holdersCount: 650,
    holderGrowth24hPercent: 25,
    createdAt: Date.now() - 12 * 3600 * 1000, // 12 hours ago (graduated earlier)
    ageHours: 12.0,
    creatorAddress: 'deployer-01',
    riskScore: 25,
    opportunityScore: 82,
    isDemo: false,
    tags: ['new', 'hot'],
    circulatingSupply: 1_000_000_000,
    totalSupply: 1_000_000_000,
    fees24h: 900,
    volumeAuthenticity: 'ORGANIC',
    washTradingRiskScore: 10,
    bondingProgress: 100,
    lifecycleStage: 'graduated',
  };

  it('detects a CONFIRMED_RECLAIM pattern when a graduated token reclaims $100K with organic buy volume', () => {
    const analysis = dipAndReclaimEngine.analyzeToken(baseGraduatedToken);

    expect(analysis.isReclaimSetup).toBe(true);
    expect(analysis.status).toBe('CONFIRMED_RECLAIM');
    expect(analysis.statusLabel).toBe('CONFIRMED 100K RECLAIM');
    expect(analysis.confidence).toBe('HIGH');
    expect(analysis.buyPressureRatio).toBeGreaterThan(1.3);
    expect(analysis.organicVolumeConfirmed).toBe(true);
    expect(analysis.targetScenarios.tp1Mcap).toBe(200000);
    expect(analysis.targetScenarios.tp2Mcap).toBe(500000);
    expect(analysis.targetScenarios.stopLossMcap).toBe(80000);
  });

  it('detects TESTING_RECLAIM when token is approaching the $100K level ($78k-$92k)', () => {
    const testingToken: Token = {
      ...baseGraduatedToken,
      marketCap: 88000,
      priceUsd: 0.000088,
    };

    const analysis = dipAndReclaimEngine.analyzeToken(testingToken);

    expect(analysis.isReclaimSetup).toBe(true);
    expect(analysis.status).toBe('TESTING_RECLAIM');
    expect(analysis.statusLabel).toBe('TESTING 100K LEVEL');
    expect(analysis.targetScenarios.stopLossMcap).toBe(80000);
  });

  it('detects FORMING_DIP when token is establishing support in the $40k-$78k post-migration zone', () => {
    const dipToken: Token = {
      ...baseGraduatedToken,
      marketCap: 58000,
      priceUsd: 0.000058,
    };

    const analysis = dipAndReclaimEngine.analyzeToken(dipToken);

    expect(analysis.isReclaimSetup).toBe(false);
    expect(analysis.status).toBe('FORMING_DIP');
    expect(analysis.statusLabel).toBe('FORMING MIGRATION DIP');
  });

  it('rejects tokens flagged with WASH_TRADING from confirmed reclaim setup', () => {
    const fakeVolToken: Token = {
      ...baseGraduatedToken,
      volumeAuthenticity: 'WASH_TRADING',
      washTradingRiskScore: 85,
    };

    const analysis = dipAndReclaimEngine.analyzeToken(fakeVolToken);
    expect(analysis.status).not.toBe('CONFIRMED_RECLAIM');
  });

  it('enriches a token with reclaimSignal and adds the reclaim_100k tag', () => {
    const enriched = dipAndReclaimEngine.enrichToken(baseGraduatedToken);

    expect(enriched.reclaimSignal).toBe('CONFIRMED_RECLAIM');
    expect(enriched.tags).toContain('reclaim_100k');
  });
});
