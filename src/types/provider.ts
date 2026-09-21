import { Token, Chain } from './token';
import { DeveloperProfile } from './developer';
import { RugRiskAudit } from './risk';
import { WalletCluster } from './wallet';
import { OpportunityScore, ScenarioAnalysis } from './opportunity';
import { TradeSetup, Position } from './trade';

export interface ITokenDiscoveryProvider {
  readonly name: string;
  readonly isDemo: boolean;
  discoverTokens(chain?: Chain): Promise<Token[]>;
  getTokenByAddress(address: string, chain: Chain): Promise<Token | null>;
}

export interface IMarketDataProvider {
  readonly name: string;
  readonly isDemo: boolean;
  getPrice(address: string, chain: Chain): Promise<number>;
  getPriceHistory(address: string, chain: Chain): Promise<{ timestamp: number; price: number }[]>;
}

export interface IDeveloperAnalysisProvider {
  readonly name: string;
  readonly isDemo: boolean;
  analyzeDeveloper(creatorAddress: string, chain: Chain): Promise<DeveloperProfile>;
}

export interface IRiskAnalysisProvider {
  readonly name: string;
  readonly isDemo: boolean;
  auditTokenRisk(tokenAddress: string, chain: Chain, creatorAddress: string): Promise<RugRiskAudit>;
}

export interface IWalletAnalysisProvider {
  readonly name: string;
  readonly isDemo: boolean;
  detectClusters(tokenAddress: string, chain: Chain): Promise<WalletCluster[]>;
}

export interface IOpportunityProvider {
  readonly name: string;
  calculateOpportunity(token: Token, risk: RugRiskAudit, cluster?: WalletCluster): OpportunityScore;
  generateScenarios(token: Token): ScenarioAnalysis;
}

export interface IExecutionProvider {
  readonly name: string;
  readonly isDemo: boolean;
  executeEntry(setup: TradeSetup, currentPrice: number): Promise<{
    success: boolean;
    txHash: string;
    executedPrice: number;
    executedSizeUsd: number;
    tokenAmount: number;
    slippagePercent: number;
    error?: string;
  }>;
  executeExit(position: Position, exitPrice: number, reason: string): Promise<{
    success: boolean;
    txHash: string;
    executedPrice: number;
    realizedPnlUsd: number;
    realizedPnlPercent: number;
    error?: string;
  }>;
}
