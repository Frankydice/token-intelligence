export type Chain = 'solana' | 'bsc' | 'base' | 'ethereum';

export type TokenTag = 'new' | 'hot' | 'watchlist' | 'high_risk' | 'dev_alert' | 'smart_money';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: Chain;
  pairAddress: string;
  dexId: string; // e.g. 'raydium', 'pumpfun', 'pancakeswap'
  priceUsd: number;
  priceChange24h: number;
  priceChange1h: number;
  priceChange5m: number;
  marketCap: number;
  liquidity: number;
  liquidityChange24h: number;
  volume24h: number;
  volumeBuy24h: number;
  volumeSell24h: number;
  txns24hBuy: number;
  txns24hSell: number;
  holdersCount: number;
  holderGrowth24hPercent: number;
  createdAt: number; // Unix timestamp ms
  ageHours: number;
  creatorAddress: string;
  riskScore: number; // 0-100 (100 = highest risk)
  opportunityScore: number; // 0-100 (100 = best opportunity)
  isDemo: boolean;
  tags: TokenTag[];
  imageUrl?: string;
  circulatingSupply: number;
  totalSupply: number;
}

export interface TokenFilter {
  chain: 'all' | Chain;
  maxAgeHours: number;
  minLiquidity: number;
  maxLiquidity?: number;
  minMarketCap: number;
  maxMarketCap?: number;
  minVolume24h: number;
  minHolders: number;
  minOpportunityScore: number;
  maxRiskScore: number;
  tag?: TokenTag | 'all';
  searchQuery?: string;
}
