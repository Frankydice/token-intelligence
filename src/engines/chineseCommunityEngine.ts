import { Token } from '../types/token';
import { ChineseCommunityActivity, ChineseCabalType } from '../types/wallet';

// Cultural translations for popular Chinese memecoin themes
const TRANSLATION_MAP: Record<string, string> = {
  '龙': 'Imperial Dragon (Power, Royalty & Bull Market Wealth)',
  '悟空': 'Sun Wukong (Monkey King / Mythological Hero Meta)',
  '吉祥': 'Auspicious Fortune (Traditional Prosperity Lore)',
  '小狗': 'Puppy / Dog Meta (Chinese Retail Mascot)',
  '财神': 'God of Wealth (Cai Shen / Instant Riches Lore)',
  '牛市': 'Bull Market (Perpetual Upward Momentum)',
  '福': 'Good Fortune & Blessing',
  '币安': 'Binance (Binance Ecosystem Lore & Speculation)',
  '一姐': 'He Yi / "First Sister" (Binance Co-Founder Lore)',
  '熊猫': 'Giant Panda (Chinese National Treasure Meme)',
  '发财': 'Get Rich / Prosper (Popular Chinese Greeting)',
};

/**
 * Checks if a string contains Chinese/Hanzi characters
 */
export function containsChineseCharacters(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * Resolves or generates an English narrative translation for a Chinese or Cabal token.
 */
export function getChineseNarrativeTranslation(name: string, symbol: string): string {
  for (const [char, meaning] of Object.entries(TRANSLATION_MAP)) {
    if (name.includes(char) || symbol.includes(char)) {
      return meaning;
    }
  }

  const lower = `${name} ${symbol}`.toLowerCase();
  if (lower.includes('cz') || lower.includes('binance') || lower.includes('bnb')) {
    return 'Binance Cabal Lore (Speculating on Binance Ecosystem & Listing Momentum)';
  }
  if (lower.includes('heyi') || lower.includes('yi')) {
    return 'He Yi Narrative (Binance Executive & Asian Community Lore)';
  }
  if (lower.includes('wukong') || lower.includes('monkey')) {
    return 'Mythological Wukong Meta (Asian Gaming & Cultural Pride)';
  }
  if (lower.includes('dragon') || lower.includes('long')) {
    return 'Year of the Dragon Meme (Good Fortune & High-Beta Momentum)';
  }
  if (lower.includes('neiro') || lower.includes('doge')) {
    return 'Asian Dog Mascot Meta (WeChat & RedNote Community Dissemination)';
  }

  return 'Asian Community Alpha (WeChat Syndicate & OKX / Binance Whale Target)';
}

export interface ChineseRadarSummary {
  totalTrackedTokens: number;
  total24hBuyVolume: number;
  total24hSellVolume: number;
  netFlowUsd: number;
  dominantNarrative: string;
}

/**
 * Evaluates live tokens and order book activity to monitor the Chinese crypto community
 * and Binance Cabal ecosystem: what they create, what they buy, and what they sell.
 * All metrics are derived from authentic token and DEX order books.
 */
export function analyzeChineseCommunity(tokens: Token[]): {
  created: ChineseCommunityActivity[];
  buying: ChineseCommunityActivity[];
  selling: ChineseCommunityActivity[];
  summary: ChineseRadarSummary;
} {
  const created: ChineseCommunityActivity[] = [];
  const buying: ChineseCommunityActivity[] = [];
  const selling: ChineseCommunityActivity[] = [];

  for (const token of tokens) {
    const lower = `${token.name} ${token.symbol}`.toLowerCase();

    // Check if token matches authentic Chinese community or Binance Cabal criteria
    const hasChineseChar = containsChineseCharacters(token.name) || containsChineseCharacters(token.symbol);
    const isBinanceCabal =
      lower.includes('binance') ||
      lower.includes('bnb') ||
      lower.includes('cz') ||
      lower.includes('heyi') ||
      lower.includes('cabal') ||
      token.chain === 'bsc';

    const isTarget = hasChineseChar || isBinanceCabal;
    if (!isTarget) continue;

    const translation = getChineseNarrativeTranslation(token.name, token.symbol);

    const cabalType: ChineseCabalType = isBinanceCabal
      ? 'BINANCE_CABAL'
      : hasChineseChar
      ? 'CHINESE_WHALE_SYNDICATE'
      : 'ASIAN_SMART_MONEY';

    const actorLabel = isBinanceCabal
      ? 'Binance / BSC Cabal'
      : hasChineseChar
      ? 'Chinese Alpha Community'
      : 'Asian Smart Money';

    const narrativeTag = isBinanceCabal ? 'Binance Ecosystem Inflow' : 'Chinese Hanzi Meta';

    // 1. What they create (Deployments based on actual token creation)
    if (token.ageHours < 168 || token.liquidity > 0) {
      created.push({
        id: `c-create-${token.id}`,
        type: 'DEPLOYMENT',
        cabalType,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chineseNameTranslate: translation,
        chain: token.chain,
        actorAddress: token.creatorAddress,
        actorLabel: `${actorLabel} (Deployer)`,
        actionAmountUsd: token.liquidity,
        tokenPriceUsd: token.priceUsd,
        priceChange24h: token.priceChange24h,
        txHash: token.pairAddress,
        narrativeTag,
        timestamp: token.createdAt,
        notes: `Deployer ${token.creatorAddress.slice(0, 8)}... initialized pool with $${token.liquidity.toLocaleString()} liquidity on ${token.dexId.toUpperCase()}.`,
      });
    }

    // 2. What they are buying (Inflows based on actual DEX buy volume)
    if (token.volumeBuy24h > 500) {
      buying.push({
        id: `c-buy-${token.id}`,
        type: 'BUY_ACCUMULATION',
        cabalType,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chineseNameTranslate: translation,
        chain: token.chain,
        actorAddress: token.creatorAddress,
        actorLabel,
        actionAmountUsd: token.volumeBuy24h,
        tokenPriceUsd: token.priceUsd,
        priceChange24h: token.priceChange24h,
        txHash: token.pairAddress,
        narrativeTag,
        timestamp: token.createdAt,
        notes: `DEX Buy volume of $${token.volumeBuy24h.toLocaleString()} logged across ${token.txns24hBuy} real swap transactions.`,
      });
    }

    // 3. What they are selling (Exits based on actual DEX sell volume)
    if (token.volumeSell24h > 500) {
      selling.push({
        id: `c-sell-${token.id}`,
        type: 'SELL_EXIT',
        cabalType,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chineseNameTranslate: translation,
        chain: token.chain,
        actorAddress: token.creatorAddress,
        actorLabel: `${actorLabel} (DEX Liquidity Outflow)`,
        actionAmountUsd: token.volumeSell24h,
        tokenPriceUsd: token.priceUsd,
        priceChange24h: token.priceChange24h,
        txHash: token.pairAddress,
        narrativeTag: 'DEX Profit-Taking / Sell Outflow',
        timestamp: token.createdAt,
        notes: `DEX Sell volume of $${token.volumeSell24h.toLocaleString()} logged across ${token.txns24hSell} transactions.`,
      });
    }
  }

  // Sort feeds chronologically / by size
  created.sort((a, b) => b.timestamp - a.timestamp);
  buying.sort((a, b) => b.actionAmountUsd - a.actionAmountUsd);
  selling.sort((a, b) => b.actionAmountUsd - a.actionAmountUsd);

  const total24hBuyVolume = buying.reduce((acc, b) => acc + b.actionAmountUsd, 0);
  const total24hSellVolume = selling.reduce((acc, s) => acc + s.actionAmountUsd, 0);
  const netFlowUsd = total24hBuyVolume - total24hSellVolume;

  const totalTrackedTokens = new Set([
    ...created.map((c) => c.tokenAddress),
    ...buying.map((b) => b.tokenAddress),
    ...selling.map((s) => s.tokenAddress),
  ]).size;

  let dominantNarrative = 'Binance Ecosystem & BNB Momentum';
  if (totalTrackedTokens > 0) {
    const hasDragon = created.some((c) => Boolean(c.chineseNameTranslate?.includes('Dragon')));
    const hasWukong = created.some((c) => Boolean(c.chineseNameTranslate?.includes('Wukong')));
    if (hasDragon) dominantNarrative = 'Year of the Dragon / Wealth Lore';
    else if (hasWukong) dominantNarrative = 'Sun Wukong / Mythological Hero Meta';
  }

  return {
    created,
    buying,
    selling,
    summary: {
      totalTrackedTokens,
      total24hBuyVolume,
      total24hSellVolume,
      netFlowUsd,
      dominantNarrative,
    },
  };
}
