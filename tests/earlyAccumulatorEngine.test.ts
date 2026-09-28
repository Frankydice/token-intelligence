import { describe, it, expect } from 'vitest';
import { earlyAccumulatorEngine } from '../src/engines/earlyAccumulatorEngine';
import { Token } from '../src/types/token';

describe('EarlyAccumulatorEngine - Private Smart Money (Playbook Ch. 14 & 14.5)', () => {
  const mockToken: Token = {
    id: 'test-token-01',
    name: 'Stealth Rocket',
    symbol: 'STEALTH',
    address: 'So11111111111111111111111111111111111111119',
    chain: 'solana',
    pairAddress: 'pair-01',
    dexId: 'raydium',
    priceUsd: 0.00015,
    priceChange24h: 120.0,
    priceChange1h: 15.0,
    priceChange5m: 2.0,
    marketCap: 150000,
    liquidity: 45000,
    liquidityChange24h: 20.0,
    volume24h: 300000,
    volumeBuy24h: 200000,
    volumeSell24h: 100000,
    txns24hBuy: 1200,
    txns24hSell: 600,
    holdersCount: 850,
    holderGrowth24hPercent: 40,
    createdAt: Date.now() - 6 * 3600 * 1000,
    ageHours: 6.0,
    creatorAddress: 'deployer-alpha',
    riskScore: 20,
    opportunityScore: 88,
    isDemo: false,
    tags: ['hot', 'smart_money'],
    circulatingSupply: 1_000_000_000,
    totalSupply: 1_000_000_000,
  };

  it('generates deterministic early accumulator profiles for a token', () => {
    const profiles = earlyAccumulatorEngine.reverseEngineerTokenAccumulators(mockToken);

    expect(profiles.length).toBeGreaterThanOrEqual(4);

    const stealthWhale = profiles.find((p) => p.classification === 'STEALTH_WHALE');
    expect(stealthWhale).toBeDefined();
    expect(stealthWhale?.entryMarketCap).toBeLessThanOrEqual(50000);
    expect(stealthWhale?.historicalWinRate).toBeGreaterThanOrEqual(60);
    expect(stealthWhale?.avgHoldDurationHours).toBeGreaterThanOrEqual(2);
    expect(stealthWhale?.fundingSource).toContain('CEX');
    expect(stealthWhale?.stagedExitsCount).toBeGreaterThanOrEqual(1);
    expect(stealthWhale?.remainingBagPercent).toBeGreaterThan(0);
  });

  it('disqualifies public KOL call-channel wallets per Chapter 14 rules', () => {
    const profiles = earlyAccumulatorEngine.reverseEngineerTokenAccumulators(mockToken);
    const kolProfile = profiles.find((p) => p.classification === 'KOL_COPYCAT_DISQUALIFIED');

    expect(kolProfile).toBeDefined();
    expect(kolProfile?.isPublicKol).toBe(true);
    expect(kolProfile?.avgHoldDurationHours).toBeLessThan(0.5); // Dumps rapidly
    expect(kolProfile?.playbookVerdict).toContain('DISQUALIFIED');
  });

  it('disqualifies fast sniper bot jeeters per Chapter 12 & 14 rules', () => {
    const profiles = earlyAccumulatorEngine.reverseEngineerTokenAccumulators(mockToken);
    const jeetProfile = profiles.find((p) => p.classification === 'SNIPER_JEET_DISQUALIFIED');

    expect(jeetProfile).toBeDefined();
    expect(jeetProfile?.isSniperBot).toBe(true);
    expect(jeetProfile?.avgHoldDurationHours).toBeLessThan(0.1); // Under 6 minutes
    expect(jeetProfile?.remainingBagPercent).toBe(0);
  });

  it('filters only stealth wallets when onlyStealth is enabled', () => {
    const profiles = earlyAccumulatorEngine.reverseEngineerTokenAccumulators(mockToken);
    const filtered = earlyAccumulatorEngine.filterAccumulators(profiles, { onlyStealth: true });

    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(['STEALTH_WHALE', 'CONVICTION_ACCUMULATOR']).toContain(p.classification);
      expect(p.isPublicKol).toBe(false);
      expect(p.isSniperBot).toBe(false);
    }
  });

  it('filters by minWinRate and maxEntryMcap correctly', () => {
    const profiles = earlyAccumulatorEngine.reverseEngineerTokenAccumulators(mockToken);

    const winRateFiltered = earlyAccumulatorEngine.filterAccumulators(profiles, {
      minWinRate: 65,
    });
    for (const p of winRateFiltered) {
      expect(p.historicalWinRate).toBeGreaterThanOrEqual(65);
    }

    const mcapFiltered = earlyAccumulatorEngine.filterAccumulators(profiles, {
      maxEntryMcap: 35000,
    });
    for (const p of mcapFiltered) {
      expect(p.entryMarketCap).toBeLessThanOrEqual(35000);
    }
  });

  it('aggregates and sorts profiles across multiple tokens', () => {
    const mockToken2: Token = {
      ...mockToken,
      id: 'test-token-02',
      symbol: 'RUNNER2',
      address: 'So22222222222222222222222222222222222222222',
      marketCap: 400000,
    };

    const allProfiles = earlyAccumulatorEngine.reverseEngineerAllTokens([mockToken, mockToken2], {
      onlyStealth: true,
    });

    expect(allProfiles.length).toBeGreaterThanOrEqual(4);
    // Verified sorting by roiMultiple descending
    for (let i = 0; i < allProfiles.length - 1; i++) {
      expect(allProfiles[i].roiMultiple).toBeGreaterThanOrEqual(allProfiles[i + 1].roiMultiple);
    }
  });
});
