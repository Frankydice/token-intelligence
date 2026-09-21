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
