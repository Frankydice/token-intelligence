import { describe, it, expect } from 'vitest';
import {
  containsChineseCharacters,
  getChineseNarrativeTranslation,
  analyzeChineseCommunity,
} from '../src/engines/chineseCommunityEngine';
import { Token } from '../src/types/token';

describe('Chinese Community & Binance Cabal Engine Tests', () => {
  const chineseToken: Token = {
    id: 'cn-token-1',
    name: '龙之传承 Imperial Dragon',
    symbol: '龙',
    address: 'So11ChineseAddress123',
    chain: 'solana',
    pairAddress: 'pairCN',
    dexId: 'raydium',
    priceUsd: 0.002,
    priceChange24h: 45,
    priceChange1h: 12,
    priceChange5m: 4,
    marketCap: 60000,
    liquidity: 25000,
    liquidityChange24h: 15,
    volume24h: 50000,
    volumeBuy24h: 38000,
    volumeSell24h: 12000,
    txns24hBuy: 180,
    txns24hSell: 40,
    holdersCount: 220,
    holderGrowth24hPercent: 18,
    createdAt: Date.now() - 3600 * 1000 * 4,
    ageHours: 4,
    creatorAddress: 'So11CreatorChinese123',
    riskScore: 35,
    opportunityScore: 88,
    isDemo: false,
    tags: ['hot', 'smart_money'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
  };

  const binanceCabalToken: Token = {
    id: 'cabal-token-1',
    name: 'CZ Binance Lore Mascot',
    symbol: 'CZMEME',
    address: '0xbb4CdB9CBD36B01bD1cBaEBF2De08d9173bc095c',
    chain: 'bsc',
    pairAddress: 'pairBscCabal',
    dexId: 'pancakeswap',
    priceUsd: 0.05,
    priceChange24h: -12,
    priceChange1h: -5,
    priceChange5m: -2,
    marketCap: 120000,
    liquidity: 40000,
    liquidityChange24h: -5,
    volume24h: 65000,
    volumeBuy24h: 20000,
    volumeSell24h: 45000,
    txns24hBuy: 50,
    txns24hSell: 130,
    holdersCount: 450,
    holderGrowth24hPercent: 2,
    createdAt: Date.now() - 3600 * 1000 * 18,
    ageHours: 18,
    creatorAddress: '0xCreatorBsc123',
    riskScore: 68,
    opportunityScore: 50,
    isDemo: false,
    tags: ['high_risk'],
    circulatingSupply: 10000000,
    totalSupply: 10000000,
  };

  it('should detect Chinese characters in token name or symbol', () => {
    expect(containsChineseCharacters('龙之传承')).toBe(true);
    expect(containsChineseCharacters('龙')).toBe(true);
    expect(containsChineseCharacters('Wukong Token')).toBe(false);
    expect(containsChineseCharacters('SOL')).toBe(false);
  });

  it('should resolve English narrative translations for Chinese & Binance themes', () => {
    const dragonTranslation = getChineseNarrativeTranslation('龙之传承', '龙');
    expect(dragonTranslation).toContain('Imperial Dragon');

    const czTranslation = getChineseNarrativeTranslation('CZ Binance Lore', 'CZMEME');
    expect(czTranslation).toContain('Binance Cabal Lore');
  });

  it('should categorize activities into created, buying, and selling feeds', () => {
    const { created, buying, selling, summary } = analyzeChineseCommunity([
      chineseToken,
      binanceCabalToken,
    ]);

    expect(created.length).toBeGreaterThan(0);
    expect(buying.length).toBeGreaterThan(0);
    expect(selling.length).toBeGreaterThan(0);

    expect(summary.totalTrackedTokens).toBeGreaterThan(0);
    expect(summary.total24hBuyVolume).toBeGreaterThan(0);
    expect(summary.total24hSellVolume).toBeGreaterThan(0);
    expect(summary.dominantNarrative).toBeTruthy();

    const buyItem = buying[0];
    expect(buyItem.actorLabel).toBeTruthy();
    expect(buyItem.actionAmountUsd).toBeGreaterThan(0);
    expect(buyItem.narrativeTag).toBeTruthy();
  });
});
