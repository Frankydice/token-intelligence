import { describe, it, expect } from 'vitest';
import { VolumeAuthenticityEngine } from '../src/engines/volumeAuthenticityEngine';
import { rugRiskEngine } from '../src/engines/rugRiskEngine';
import { opportunityEngine } from '../src/engines/opportunityEngine';
import { Token } from '../src/types/token';

describe('Volume Authenticity & Wash Trading Detection Engine (Playbook Ch. 4 & 5)', () => {
  const engine = new VolumeAuthenticityEngine();

  const organicToken: Token = {
    id: 'test-organic-token',
    name: 'Organic Solana Token',
    symbol: 'ORGSOL',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    chain: 'solana',
    pairAddress: 'pairOrg123',
    dexId: 'raydium',
    priceUsd: 0.005,
    priceChange24h: 15,
    priceChange1h: 3,
    priceChange5m: 1,
    marketCap: 250000,
    liquidity: 75000,
    liquidityChange24h: 5,
    volume24h: 100000,
    volumeBuy24h: 55000,
    volumeSell24h: 45000,
    txns24hBuy: 450,
    txns24hSell: 380,
    holdersCount: 850,
    holderGrowth24hPercent: 8,
    createdAt: Date.now() - 3600 * 1000 * 24,
    ageHours: 24,
    creatorAddress: '5Q54...liveDeployer',
    riskScore: 25,
    opportunityScore: 82,
    isDemo: false,
    tags: ['hot', 'smart_money'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
  };

  const fakeVolumeToken: Token = {
    id: 'test-fake-volume-token',
    name: 'Farmed Wash Pump Token',
    symbol: 'WASHTOKEN',
    address: 'So11FakeVolumeAddress123456789',
    chain: 'solana',
    pairAddress: 'pairWash123',
    dexId: 'pumpfun',
    priceUsd: 0.002,
    priceChange24h: 120,
    priceChange1h: 15,
    priceChange5m: 2,
    marketCap: 40000,
    liquidity: 4500, // Very low liquidity ($4.5k)
    liquidityChange24h: 0,
    volume24h: 800000, // High volume ($800k) on $4.5k liq
    volumeBuy24h: 790000,
    volumeSell24h: 10000,
    txns24hBuy: 80,
    txns24hSell: 2, // Extreme buy bias
    holdersCount: 45,
    holderGrowth24hPercent: 0,
    createdAt: Date.now() - 3600 * 1000 * 3,
    ageHours: 3,
    creatorAddress: 'So11CabalCreator12345',
    riskScore: 65,
    opportunityScore: 70,
    isDemo: false,
    tags: ['new', 'high_risk'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
    fees24h: 25, // Deficit: only $25 in fees on $800k volume (<1/30000th)
  };

  it('should verify organic volume with healthy LP fee generation', () => {
    const result = engine.analyzeVolume(organicToken);

    expect(result.authenticity).toBe('ORGANIC');
    expect(result.washTradingRiskScore).toBeLessThan(35);
    expect(result.isPlaybookCompliant).toBe(true);
    expect(result.fees24h).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes('Healthy Fee Yield'))).toBe(true);
  });

  it('should detect wash trading when fee yield falls below safe 1/30th playbook threshold', () => {
    const result = engine.analyzeVolume(fakeVolumeToken);

    expect(result.authenticity).toBe('WASH_TRADING');
    expect(result.washTradingRiskScore).toBeGreaterThanOrEqual(60);
    expect(result.isPlaybookCompliant).toBe(false);
    expect(result.indicators).toContain('WASH_TRADING_FEE_DEFICIT');
    expect(result.indicators).toContain('UNSUSTAINABLE_VOLUME_LIQUIDITY_DISCONNECT');
    expect(result.indicators).toContain('UNNATURAL_BUY_BIAS');
  });

  it('should detect loop wash-trading with uniform ticket sizes', () => {
    const uniformToken: Token = {
      ...organicToken,
      volume24h: 100000,
      volumeBuy24h: 50000,
      volumeSell24h: 50000,
      txns24hBuy: 50, // exactly $1000/buy
      txns24hSell: 50, // exactly $1000/sell
      fees24h: 250,
    };

    const result = engine.analyzeVolume(uniformToken);
    expect(result.indicators).toContain('LOOP_WASH_TRADING_UNIFORMITY');
    expect(result.reasons.some((r) => r.includes('Uniform Ticket Sizing'))).toBe(true);
  });

  it('should penalize rug risk score when wash trading is present in audit', () => {
    const solanaSecurity = {
      mintAuthority: 'revoked' as const,
      freezeAuthority: 'revoked' as const,
      lpBurnedPercent: 100,
      top10HoldersPercent: 15,
      metadataMutable: false,
    };

    const cleanAudit = rugRiskEngine.auditSolanaToken(
      organicToken.address,
      solanaSecurity,
      0,
      false,
      organicToken
    );

    const washAudit = rugRiskEngine.auditSolanaToken(
      fakeVolumeToken.address,
      solanaSecurity,
      0,
      false,
      fakeVolumeToken
    );

    expect(cleanAudit.washTradingRisk).toBe('ORGANIC');
    expect(washAudit.washTradingRisk).toBe('WASH_TRADING');
    expect(washAudit.overallRiskScore).toBeGreaterThan(cleanAudit.overallRiskScore);
    expect(washAudit.indicators.some((i) => i.id === 'vol-i-washtrading')).toBe(true);
  });

  it('should reduce opportunity score when token is flagged for wash trading', () => {
    const riskAudit = rugRiskEngine.auditSolanaToken(
      fakeVolumeToken.address,
      {
        mintAuthority: 'revoked',
        freezeAuthority: 'revoked',
        lpBurnedPercent: 100,
        top10HoldersPercent: 15,
        metadataMutable: false,
      },
      0,
      false,
      fakeVolumeToken
    );

    const evaluated = opportunityEngine.evaluate(
      { ...fakeVolumeToken, volumeAuthenticity: 'WASH_TRADING' },
      riskAudit
    );

    expect(evaluated.negativeFactors.some((f) => f.factor.includes('Wash Trading'))).toBe(true);
    expect(evaluated.score).toBeLessThan(75);
  });
});
