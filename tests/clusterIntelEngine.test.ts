import { describe, it, expect } from 'vitest';
import { detectTiedWalletRings, detectWhaleBuySignals } from '../src/engines/clusterIntelEngine';
import { Token } from '../src/types/token';

describe('Cluster Intel Engine Tests (Tied Wallets & Whales)', () => {
  const mockToken: Token = {
    id: 'test-token-1',
    name: 'Test Pump',
    symbol: 'TPUMP',
    address: 'So11111111111111111111111111111111111111112',
    chain: 'solana',
    pairAddress: 'pair123',
    dexId: 'raydium',
    priceUsd: 0.005,
    priceChange24h: -15,
    priceChange1h: -8,
    priceChange5m: -3,
    marketCap: 50000,
    liquidity: 20000,
    liquidityChange24h: -5,
    volume24h: 30000,
    volumeBuy24h: 8000,
    volumeSell24h: 22000,
    txns24hBuy: 40,
    txns24hSell: 110,
    holdersCount: 85,
    holderGrowth24hPercent: 2,
    createdAt: Date.now() - 3600 * 1000 * 12,
    ageHours: 12,
    creatorAddress: 'So11CreatorAddressTest123456789',
    riskScore: 78, // High risk should trigger tied ring detection
    opportunityScore: 42,
    isDemo: false,
    tags: ['high_risk', 'urgent_dump'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
  };

  it('should detect a tied-wallet puppet ring with common funder and pump/dump roles', () => {
    const rings = detectTiedWalletRings([mockToken]);
    expect(rings.length).toBeGreaterThan(0);

    const ring = rings[0];
    expect(ring.tokenAddress).toBe(mockToken.address);
    expect(ring.commonFunderAddress).toBeTruthy();
    expect(ring.pumpWallets.length).toBeGreaterThan(0);
    expect(ring.dumpWallets.length).toBeGreaterThan(0);
    expect(ring.totalPumpVolumeUsd).toBeGreaterThan(0);
    expect(ring.totalDumpVolumeUsd).toBeGreaterThan(0);
    expect(['DISGUISED_DISTRIBUTION', 'WASH_PUMP_AND_DUMP', 'COORDINATED_SNIPER_ACCUMULATION']).toContain(ring.tactic);
    expect(ring.explanation).toContain('Common root funder');
  });

  it('should extract whale buy transactions exceeding threshold', () => {
    const whaleSignals = detectWhaleBuySignals([mockToken]);
    expect(whaleSignals.length).toBeGreaterThan(0);

    const signal = whaleSignals[0];
    expect(signal.buyAmountUsd).toBeGreaterThanOrEqual(2500);
    expect(signal.percentOfLiquidity).toBeGreaterThan(0);
    expect(signal.buyerAddress).toBeTruthy();
    expect(signal.tokenSymbol).toBe('TPUMP');
  });
});
