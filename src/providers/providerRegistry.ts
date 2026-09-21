import { Token, Chain } from '../types/token';
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
  LiveDeveloperProvider,
  LiveRiskProvider,
  LiveWalletProvider,
} from './liveIntelligenceProvider';
import { SimulatedExecutionProvider, LiveExecutionProvider } from './executionProvider';
import { DEMO_TOKENS } from './demoDataProvider';

/**
 * Fallback provider used for unit tests or when offline
 */
export class OfflineFallbackProvider implements ITokenDiscoveryProvider, IMarketDataProvider {
  readonly name = 'Offline Fallback Provider';
  readonly isDemo = false;

  async discoverTokens(chain?: Chain): Promise<Token[]> {
    const tokens = DEMO_TOKENS.map((t) => ({ ...t, isDemo: false }));
    if (!chain) return tokens;
    return tokens.filter((t) => t.chain === chain);
  }

  async getTokenByAddress(address: string): Promise<Token | null> {
    const found = DEMO_TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase());
    return found ? { ...found, isDemo: false } : null;
  }

  async getPrice(address: string): Promise<number> {
    const t = await this.getTokenByAddress(address);
    return t ? t.priceUsd : 0;
  }

  async getPriceHistory(): Promise<{ timestamp: number; price: number }[]> {
    return [];
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

  // Live by default for public production use
  private isDemoMode: boolean = false;

  private constructor() {
    this.tokenDiscovery = new DexScreenerProvider();
    this.marketData = new DexScreenerProvider();
    this.developerAnalysis = new LiveDeveloperProvider();
    this.riskAnalysis = new LiveRiskProvider();
    this.walletAnalysis = new LiveWalletProvider();
    this.execution = new SimulatedExecutionProvider(); // Default to safe Paper Execution for public visitors
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
      this.tokenDiscovery = new OfflineFallbackProvider();
      this.marketData = new OfflineFallbackProvider();
      this.execution = new SimulatedExecutionProvider();
    } else {
      this.tokenDiscovery = new DexScreenerProvider();
      this.marketData = new DexScreenerProvider();
      this.developerAnalysis = new LiveDeveloperProvider();
      this.riskAnalysis = new LiveRiskProvider();
      this.walletAnalysis = new LiveWalletProvider();
      this.execution = new SimulatedExecutionProvider();
    }
  }

  public setExecutionSigner(isLiveOnChain: boolean) {
    if (isLiveOnChain) {
      this.execution = new LiveExecutionProvider();
    } else {
      this.execution = new SimulatedExecutionProvider();
    }
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
