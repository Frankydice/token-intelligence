import { Token, Chain } from '../types/token';
import { ITokenDiscoveryProvider, IMarketDataProvider } from '../types/provider';

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  priceChange?: {
    m5?: number;
    h1?: number;
    h24?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export class DexScreenerProvider implements ITokenDiscoveryProvider, IMarketDataProvider {
  readonly name = 'DexScreener API (LIVE)';
  readonly isDemo = false;
  private baseUrl = 'https://api.dexscreener.com/latest/dex';

  async discoverTokens(chain?: Chain): Promise<Token[]> {
    try {
      // Fetch latest high-activity tokens across target chains
      const queries = chain ? [chain === 'bsc' ? 'bsc' : chain] : ['solana', 'bsc'];
      const allTokens: Token[] = [];

      for (const q of queries) {
        const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(q)}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn(`[DexScreenerProvider] Search failed: HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const pairs: DexScreenerPair[] = data.pairs || [];

        const now = Date.now();
        const thirtyDaysMs = 30 * 86400 * 1000;

        for (const pair of pairs) {
          // Normalize chain
          let mappedChain: Chain | null = null;
          if (pair.chainId === 'solana') mappedChain = 'solana';
          else if (pair.chainId === 'bsc') mappedChain = 'bsc';
          else if (pair.chainId === 'base') mappedChain = 'base';
          else if (pair.chainId === 'ethereum') mappedChain = 'ethereum';

          if (!mappedChain) continue;
          if (chain && mappedChain !== chain) continue;

          // Check token age (< 30 days old if timestamp exists)
          const createdAt = pair.pairCreatedAt || (now - 24 * 3600 * 1000);
          const ageMs = now - createdAt;
          if (ageMs > thirtyDaysMs) continue;

          const priceUsd = parseFloat(pair.priceUsd) || 0;
          const liquidity = pair.liquidity?.usd || 0;
          const marketCap = pair.marketCap || pair.fdv || (liquidity * 3);
          const volume24h = pair.volume?.h24 || 0;

          // Heuristic opportunity and risk scores for real feeds
          const buyVolRatio = (pair.txns?.h24?.buys || 1) / Math.max(1, (pair.txns?.h24?.sells || 1));
          const opportunityScore = Math.min(95, Math.max(30, Math.round(50 + Math.min(25, (pair.priceChange?.h24 || 0) / 4) + (buyVolRatio > 1.2 ? 15 : -10))));
          const riskScore = Math.min(90, Math.max(15, Math.round(45 + (liquidity < 20_000 ? 30 : 0) + (buyVolRatio < 0.8 ? 20 : -10))));

          allTokens.push({
            id: `real-${pair.chainId}-${pair.baseToken.address}`,
            name: pair.baseToken.name,
            symbol: pair.baseToken.symbol,
            address: pair.baseToken.address,
            chain: mappedChain,
            pairAddress: pair.pairAddress,
            dexId: pair.dexId,
            priceUsd,
            priceChange24h: pair.priceChange?.h24 || 0,
            priceChange1h: pair.priceChange?.h1 || 0,
            priceChange5m: pair.priceChange?.m5 || 0,
            marketCap,
            liquidity,
            liquidityChange24h: 0,
            volume24h,
            volumeBuy24h: volume24h * 0.55,
            volumeSell24h: volume24h * 0.45,
            txns24hBuy: pair.txns?.h24?.buys || 0,
            txns24hSell: pair.txns?.h24?.sells || 0,
            holdersCount: Math.round(Math.max(50, marketCap / 500)),
            holderGrowth24hPercent: 5.0,
            createdAt,
            ageHours: Number((ageMs / (3600 * 1000)).toFixed(1)),
            creatorAddress: '0x... (inspect via explorer)',
            riskScore,
            opportunityScore,
            isDemo: false,
            tags: ['new', 'hot'],
            imageUrl: pair.info?.imageUrl,
            circulatingSupply: marketCap > 0 && priceUsd > 0 ? marketCap / priceUsd : 1_000_000_000,
            totalSupply: marketCap > 0 && priceUsd > 0 ? marketCap / priceUsd : 1_000_000_000,
          });
        }
      }

      return allTokens;
    } catch (err) {
      console.error('[DexScreenerProvider] Error discovering tokens:', err);
      return [];
    }
  }

  async getTokenByAddress(address: string, chain: Chain): Promise<Token | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${address}`);
      if (!response.ok) return null;
      const data = await response.json();
      const pairs: DexScreenerPair[] = data.pairs || [];
      if (pairs.length === 0) return null;

      const pair = pairs[0];
      const now = Date.now();
      const createdAt = pair.pairCreatedAt || (now - 24 * 3600 * 1000);
      const ageMs = now - createdAt;
      const priceUsd = parseFloat(pair.priceUsd) || 0;
      const liquidity = pair.liquidity?.usd || 0;
      const marketCap = pair.marketCap || pair.fdv || (liquidity * 3);

      return {
        id: `real-${pair.chainId}-${pair.baseToken.address}`,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address,
        chain,
        pairAddress: pair.pairAddress,
        dexId: pair.dexId,
        priceUsd,
        priceChange24h: pair.priceChange?.h24 || 0,
        priceChange1h: pair.priceChange?.h1 || 0,
        priceChange5m: pair.priceChange?.m5 || 0,
        marketCap,
        liquidity,
        liquidityChange24h: 0,
        volume24h: pair.volume?.h24 || 0,
        volumeBuy24h: (pair.volume?.h24 || 0) * 0.52,
        volumeSell24h: (pair.volume?.h24 || 0) * 0.48,
        txns24hBuy: pair.txns?.h24?.buys || 0,
        txns24hSell: pair.txns?.h24?.sells || 0,
        holdersCount: 500,
        holderGrowth24hPercent: 0,
        createdAt,
        ageHours: Number((ageMs / (3600 * 1000)).toFixed(1)),
        creatorAddress: '0x... (inspect via explorer)',
        riskScore: 50,
        opportunityScore: 70,
        isDemo: false,
        tags: ['new'],
        imageUrl: pair.info?.imageUrl,
        circulatingSupply: marketCap > 0 && priceUsd > 0 ? marketCap / priceUsd : 1_000_000_000,
        totalSupply: marketCap > 0 && priceUsd > 0 ? marketCap / priceUsd : 1_000_000_000,
      };
    } catch {
      return null;
    }
  }

  async getPrice(address: string): Promise<number> {
    const token = await this.getTokenByAddress(address, 'solana');
    return token ? token.priceUsd : 0;
  }

  async getPriceHistory(): Promise<{ timestamp: number; price: number }[]> {
    return [];
  }
}
