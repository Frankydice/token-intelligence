import { Chain } from './token';

export interface ClusterMember {
  walletAddress: string;
  entryTimestamp: number;
  entryTxHash: string;
  amountUsd: number;
  tokenAmount: number;
  fundingSourceAddress?: string;
  fundingSourceName?: string;
  historicalTokensTogether: number;
  isKnownEntity?: boolean;
  entityLabel?: string;
}

export interface WalletCluster {
  id: string;
  tokenAddress: string;
  chain: Chain;
  detectedAt: number;
  walletCount: number;
  windowSeconds: number; // e.g., 85 seconds
  combinedPositionUsd: number;
  commonFundingSourceDetected: boolean;
  commonFundingSourceAddress?: string;
  commonFundingSourceName?: string;
  confidence: 'Low' | 'Medium' | 'High';
  label: string; // e.g. "COORDINATED WALLET ACTIVITY", "EARLY WALLET CLUSTER"
  members: ClusterMember[];
  evidenceSummary: string;
}

export interface SmartMoneySignal {
  walletAddress: string;
  walletLabel: string;
  tokenAddress: string;
  chain: Chain;
  action: 'BUY' | 'ACCUMULATING' | 'SELL';
  amountUsd: number;
  timestamp: number;
  historicalWinRatePercent: number;
  verifiedSource?: string;
}

export interface TiedWalletPuppet {
  address: string;
  role: 'BUYER_PUMP' | 'DUMPER_SELL' | 'STAGING_HOLDER';
  actionUsd: number;
  txHash: string;
  timestamp: number;
  fundingTxHash?: string;
  initialFundAmountSolOrBnb: number;
}

export interface TiedWalletRing {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: Chain;
  commonFunderAddress: string;
  commonFunderLabel: string;
  totalWallets: number;
  pumpWallets: TiedWalletPuppet[];
  dumpWallets: TiedWalletPuppet[];
  holdingWallets: TiedWalletPuppet[];
  totalPumpVolumeUsd: number;
  totalDumpVolumeUsd: number;
  netExtractedUsd: number; // Dumped - Pumped
  tactic: 'WASH_PUMP_AND_DUMP' | 'DISGUISED_DISTRIBUTION' | 'COORDINATED_SNIPER_ACCUMULATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  explanation: string;
  detectedAt: number;
}

export interface WhaleBuySignal {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: Chain;
  buyerAddress: string;
  buyerLabel: string;
  buyAmountUsd: number;
  tokenAmount: number;
  priceUsd: number;
  percentOfLiquidity: number;
  timestamp: number;
  txHash: string;
  isClusterMember: boolean;
  clusterId?: string;
  riskScore: number;
}

export interface FlowAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: Chain;
  type: 'AGGRESSIVE_DUMP' | 'AGGRESSIVE_INFLOW';
  severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY';
  headline: string;
  reason: string;
  priceUsd: number;
  priceChangePercent: number; // 5m or 1h
  volume24h: number;
  netFlowUsd: number;
  buySellRatio: number;
  sellVolumeUsd: number;
  buyVolumeUsd: number;
  sellCount: number;
  buyCount: number;
  liquidityUsd: number;
  liquidityDrainPercent?: number;
  urgency: 'IMMEDIATE_EXIT' | 'HIGH_RISK_AVOID' | 'SCALP_BREAKOUT' | 'STRONG_ACCUMULATION';
  timestamp: number;
}

export type ChineseCabalType =
  | 'BINANCE_CABAL'
  | 'CHINESE_WHALE_SYNDICATE'
  | 'WECHAT_ALPHA_GROUP'
  | 'ASIAN_SMART_MONEY';

export interface ChineseCommunityActivity {
  id: string;
  type: 'DEPLOYMENT' | 'BUY_ACCUMULATION' | 'SELL_EXIT';
  cabalType: ChineseCabalType;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chineseNameTranslate?: string; // English translation/cultural explanation of the name/symbol
  chain: Chain;
  actorAddress: string;
  actorLabel: string; // e.g. "Binance VIP Cabal 01", "WeChat Alpha Ring 88", "OKX High-Net-Worth Whale"
  actionAmountUsd: number;
  tokenPriceUsd: number;
  priceChange24h: number;
  txHash: string;
  narrativeTag: string; // e.g. "Binance Listing Speculation", "WeChat Viral Call", "Chinese Lore Meta"
  timestamp: number;
  notes: string;
}


