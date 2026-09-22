import { describe, it, expect } from 'vitest';
import { analyzeFlowRadar } from '../src/engines/flowRadarEngine';
import { Token } from '../src/types/token';

describe('Flow Radar Engine Tests (Aggressive Dumps & Inflows)', () => {
  const dumpingToken: Token = {
    id: 'dump-token-1',
    name: 'Dumping Meme',
    symbol: 'DUMP',
    address: 'So11DumpAddressTest12345',
    chain: 'solana',
    pairAddress: 'pairDump',
    dexId: 'raydium',
    priceUsd: 0.001,
    priceChange24h: -35,
    priceChange1h: -22,
    priceChange5m: -10,
    marketCap: 25000,
    liquidity: 12000,
    liquidityChange24h: -25,
    volume24h: 40000,
    volumeBuy24h: 8000,
    volumeSell24h: 32000, // 80% sell volume
    txns24hBuy: 20,
    txns24hSell: 95,
    holdersCount: 50,
    holderGrowth24hPercent: -5,
    createdAt: Date.now() - 3600 * 1000 * 5,
    ageHours: 5,
    creatorAddress: 'So11Creator123',
    riskScore: 82,
    opportunityScore: 25,
    isDemo: false,
    tags: ['urgent_dump'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
  };

  const pumpingToken: Token = {
    id: 'pump-token-1',
    name: 'Breakout Surge',
    symbol: 'SURGE',
    address: 'So11PumpAddressTest12345',
    chain: 'solana',
    pairAddress: 'pairPump',
    dexId: 'pumpfun',
    priceUsd: 0.008,
    priceChange24h: 85,
    priceChange1h: 42,
    priceChange5m: 18,
    marketCap: 150000,
    liquidity: 45000,
    liquidityChange24h: 30,
    volume24h: 80000,
    volumeBuy24h: 68000, // 85% buy volume
    volumeSell24h: 12000,
    txns24hBuy: 240,
    txns24hSell: 35,
    holdersCount: 320,
    holderGrowth24hPercent: 25,
    createdAt: Date.now() - 3600 * 1000 * 3,
    ageHours: 3,
    creatorAddress: 'So11Creator456',
    riskScore: 28,
    opportunityScore: 92,
    isDemo: false,
    tags: ['hot', 'cluster_buying'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
  };

  it('should categorize dumping token under dumps with urgent sell signals', () => {
    const { dumps } = analyzeFlowRadar([dumpingToken, pumpingToken]);

    expect(dumps.length).toBe(1);
    const dumpAlert = dumps[0];
    expect(dumpAlert.tokenSymbol).toBe('DUMP');
    expect(dumpAlert.type).toBe('AGGRESSIVE_DUMP');
    expect(dumpAlert.urgency).toBe('IMMEDIATE_EXIT');
    expect(dumpAlert.netFlowUsd).toBeLessThan(0);
    expect(dumpAlert.headline).toContain('URGENT EXIT');
    expect(dumpAlert.liquidityDrainPercent).toBeGreaterThan(0);
  });

  it('should categorize surging token under inflows with breakout momentum signals', () => {
    const { inflows } = analyzeFlowRadar([dumpingToken, pumpingToken]);

    expect(inflows.length).toBe(1);
    const inflowAlert = inflows[0];
    expect(inflowAlert.tokenSymbol).toBe('SURGE');
    expect(inflowAlert.type).toBe('AGGRESSIVE_INFLOW');
    expect(inflowAlert.urgency).toBe('SCALP_BREAKOUT');
    expect(inflowAlert.netFlowUsd).toBeGreaterThan(0);
    expect(inflowAlert.buySellRatio).toBeGreaterThan(2);
    expect(inflowAlert.headline).toContain('Breakout');
  });
});
