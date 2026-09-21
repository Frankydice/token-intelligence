import { Chain } from './token';

export type RiskLevel = 'LOW CONCERN' | 'WATCH' | 'HIGH RISK' | 'CRITICAL RISK';

export type EvidenceType = 'FACT' | 'INDICATOR' | 'INFERENCE';

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  description: string;
  txHash?: string;
  walletAddress?: string;
  tokenAddress?: string;
  timestamp: number;
  explorerUrl?: string;
  amount?: string;
  percentage?: number;
}

export interface PreviousLaunch {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  chain: Chain;
  launchTimestamp: number;
  peakMcap: number;
  currentMcap: number;
  status: 'active' | 'abandoned' | 'rug_pulled' | 'successful';
  liquidityRemoved: boolean;
  liquidityRemovedAmountUsd?: number;
  creatorDumped: boolean;
  creatorSoldPercent?: number;
  timeBetweenNextLaunchHours?: number;
}

export interface DeveloperProfile {
  walletAddress: string;
  chain: Chain;
  walletAgeDays: number;
  totalLaunches: number;
  observedPreviousLaunches: number;
  successfulLaunches: number;
  abandonedLaunches: number;
  suspiciousLaunches: number;
  liquidityRemovalEvents: number;
  largeCreatorSells: number;
  creatorTokenTransfers: number;
  fundingSources: {
    sourceAddress: string;
    sourceType: 'CEX_HOT_WALLET' | 'TORNADO_CASH' | 'ANOTHER_DEV_WALLET' | 'DISPENSER' | 'UNKNOWN';
    txHash: string;
    timestamp: number;
  }[];
  associatedWallets: {
    address: string;
    relationship: 'RECEIVED_CREATOR_TOKENS' | 'CO_DEPLOYER' | 'COMMON_FUNDER';
    tokensShared: number;
  }[];
  riskLevel: RiskLevel;
  riskReasons: string[];
  evidence: EvidenceItem[];
  launchTimeline: PreviousLaunch[];
}
