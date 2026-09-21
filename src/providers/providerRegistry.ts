import { Token, Chain } from '../types/token';
import { DeveloperProfile } from '../types/developer';
import { RugRiskAudit } from '../types/risk';
import { WalletCluster } from '../types/wallet';
import {
  ITokenDiscoveryProvider,
  IMarketDataProvider,
  IDeveloperAnalysisProvider,
  IRiskAnalysisProvider,
  IWalletAnalysisProvider,
  IExecutionProvider,
} from '../types/provider';
import { DexScreenerProvider } from './dexScreenerProvider';
import {
  DEMO_TOKENS,
  DEMO_DEVELOPER_PROFILES,
  DEMO_RUG_RISKS,
  DEMO_WALLET_CLUSTERS,
} from './demoDataProvider';
import { SimulatedExecutionProvider, LiveExecutionProvider } from './executionProvider';

export class DemoDiscoveryProvider implements ITokenDiscoveryProvider, IMarketDataProvider {
  readonly name = 'Deterministic Demo Provider (DEMO)';
  readonly isDemo = true;

  async discoverTokens(chain?: Chain): Promise<Token[]> {
    if (!chain || chain === 'bsc' && !chain) return DEMO_TOKENS;
    return DEMO_TOKENS.filter((t) => !chain || t.chain === chain);
  }

  async getTokenByAddress(address: string): Promise<Token | null> {
    return DEMO_TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase()) || null;
  }

  async getPrice(address: string): Promise<number> {
    const t = await this.getTokenByAddress(address);
    return t ? t.priceUsd : 0;
  }

  async getPriceHistory(): Promise<{ timestamp: number; price: number }[]> {
    return [];
  }
}

export class DemoDeveloperProvider implements IDeveloperAnalysisProvider {
  readonly name = 'Demo Developer Intelligence Engine';
  readonly isDemo = true;

  async analyzeDeveloper(creatorAddress: string, chain: Chain): Promise<DeveloperProfile> {
    const existing = DEMO_DEVELOPER_PROFILES[creatorAddress];
    if (existing) return existing;

    // Generic safe fallback profile
    return {
      walletAddress: creatorAddress,
      chain,
      walletAgeDays: 14,
      totalLaunches: 1,
      observedPreviousLaunches: 0,
      successfulLaunches: 0,
      abandonedLaunches: 0,
      suspiciousLaunches: 0,
      liquidityRemovalEvents: 0,
      largeCreatorSells: 0,
      creatorTokenTransfers: 0,
      fundingSources: [],
      associatedWallets: [],
      riskLevel: 'WATCH',
      riskReasons: ['First observed token launch for this wallet address.'],
      evidence: [
        {
          id: 'ev-new-01',
          type: 'INDICATOR',
          description: 'No prior deployment history observed on-chain within 30-day index window.',
          timestamp: Date.now(),
        },
      ],
      launchTimeline: [],
    };
  }
}

export class DemoRiskProvider implements IRiskAnalysisProvider {
  readonly name = 'Demo Rug Risk Auditor';
  readonly isDemo = true;

  async auditTokenRisk(tokenAddress: string, chain: Chain): Promise<RugRiskAudit> {
    const existing = DEMO_RUG_RISKS[tokenAddress];
    if (existing) return existing;

    return {
      tokenAddress,
      chain,
      overallRiskScore: 35,
      riskCategory: 'LOW CONCERN',
      solana:
        chain === 'solana'
          ? {
              mintAuthority: 'revoked',
              freezeAuthority: 'revoked',
              lpBurnedPercent: 100,
              top10HoldersPercent: 16.5,
              metadataMutable: false,
            }
          : undefined,
      evm:
        chain === 'bsc'
          ? {
              ownershipRenounced: true,
              isHoneypot: false,
              buyTaxPercent: 0,
              sellTaxPercent: 0,
              lpLockedPercent: 100,
              top10HoldersPercent: 18.2,
              isUpgradeableProxy: false,
              hasBlacklist: false,
            }
          : undefined,
      facts: [
        {
          id: 'rf-gen-01',
          type: 'FACT',
          description: 'Token contract deployed without custom transfer fee overrides.',
          timestamp: Date.now(),
        },
      ],
      indicators: [],
      inferences: [],
      summary: 'Standard token deployment with standard liquidity lock and no critical vulnerabilities detected.',
      creatorSellRisk: 'LOW',
      liquidityRemovalRisk: 'LOW',
      holderConcentrationRisk: 'HEALTHY',
    };
  }
}

export class DemoWalletProvider implements IWalletAnalysisProvider {
  readonly name = 'Demo Wallet Cluster Engine';
  readonly isDemo = true;

  async detectClusters(tokenAddress: string): Promise<WalletCluster[]> {
    return DEMO_WALLET_CLUSTERS[tokenAddress] || [];
  }
}

export class ProviderRegistry {
  private static instance: ProviderRegistry;

  public tokenDiscovery: ITokenDiscoveryProvider;
  public marketData: IMarketDataProvider;
  public developerAnalysis: IDeveloperAnalysisProvider;
  public riskAnalysis: IRiskAnalysisProvider;
  public walletAnalysis: IWalletAnalysisProvider;
  public execution: IExecutionProvider;

  private isDemoMode: boolean = true;

  private constructor() {
    this.tokenDiscovery = new DemoDiscoveryProvider();
    this.marketData = new DemoDiscoveryProvider();
    this.developerAnalysis = new DemoDeveloperProvider();
    this.riskAnalysis = new DemoRiskProvider();
    this.walletAnalysis = new DemoWalletProvider();
    this.execution = new SimulatedExecutionProvider();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setMode(demo: boolean) {
    this.isDemoMode = demo;
    if (demo) {
      this.tokenDiscovery = new DemoDiscoveryProvider();
      this.marketData = new DemoDiscoveryProvider();
      this.developerAnalysis = new DemoDeveloperProvider();
      this.riskAnalysis = new DemoRiskProvider();
      this.walletAnalysis = new DemoWalletProvider();
      this.execution = new SimulatedExecutionProvider();
    } else {
      this.tokenDiscovery = new DexScreenerProvider();
      this.marketData = new DexScreenerProvider();
      // Developer and wallet providers can fall back to on-chain indexer or graceful demo indicators with LIVE labeling
      this.developerAnalysis = new DemoDeveloperProvider();
      this.riskAnalysis = new DemoRiskProvider();
      this.walletAnalysis = new DemoWalletProvider();
      this.execution = new LiveExecutionProvider();
    }
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
