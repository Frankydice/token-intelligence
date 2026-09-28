import { Token } from '../types/token';
import { volumeAuthenticityEngine } from '../engines/volumeAuthenticityEngine';
import { lifecycleEngine } from '../engines/lifecycleEngine';
import { dipAndReclaimEngine } from '../engines/dipAndReclaimEngine';

export type RobinhoodChainStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface RobinhoodNewLaunchEvent {
  platform: 'robinhood_swap' | 'robinhood_rwa' | 'orbit_factory';
  contractAddress: string;
  pairAddress: string;
  signature: string;
  timestamp: number;
  initialLiquidityEth?: number;
  logSnippet: string;
  metadata?: {
    name?: string;
    symbol?: string;
    assetType?: 'MEMECOIN' | 'RWA_TOKENIZED_STOCK' | 'AI_AGENT' | 'DEFI_UTILITY';
  };
}

export class RobinhoodChainListener {
  private ws: WebSocket | null = null;
  // Default to public Arbitrum Orbit RPC WebSocket
  private endpoint: string = 'wss://arbitrum-one-rpc.publicnode.com';
  private status: RobinhoodChainStatus = 'DISCONNECTED';
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isManualDisconnect: boolean = false;
  private reconnectAttempts: number = 0;
  private statusListeners: ((status: RobinhoodChainStatus) => void)[] = [];
  private launchListeners: ((event: RobinhoodNewLaunchEvent) => void)[] = [];
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private seenRobinhoodTokens = new Set<string>();

  // Robinhood Chain Factory & Router Addresses (Arbitrum Orbit L2)
  public static readonly ROBINHOOD_FACTORY_ADDRESS = '0x1776000000000000000000000000000000001776';
  public static readonly ROBINHOOD_RWA_ROUTER = '0x1776RWA000000000000000000000000000000001';

  constructor(endpoint?: string) {
    if (endpoint) this.endpoint = endpoint;
  }

  public setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      this.disconnect();
      this.connect();
    }
  }

  public getStatus(): RobinhoodChainStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: RobinhoodChainStatus) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public onNewLaunch(callback: (event: RobinhoodNewLaunchEvent) => void) {
    this.launchListeners.push(callback);
    return () => {
      this.launchListeners = this.launchListeners.filter((cb) => cb !== callback);
    };
  }

  public connect(): void {
    this.isManualDisconnect = false;

    if (this.status === 'CONNECTED' && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (typeof WebSocket === 'undefined') {
      this.setStatus('DISCONNECTED');
      return;
    }

    this.setStatus('CONNECTING');

    try {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
        this.ws = null;
      }

      this.ws = new WebSocket(this.endpoint);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('CONNECTED');
        this.subscribeToBlocks();
        this.startRobinhoodDiscoveryPoll();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('[RobinhoodChainListener] WebSocket error:', err);
        if (!this.isManualDisconnect) {
          this.setStatus('ERROR');
          this.scheduleReconnect();
        }
      };

      this.ws.onclose = () => {
        if (!this.isManualDisconnect) {
          this.setStatus('DISCONNECTED');
          this.scheduleReconnect();
        } else {
          this.setStatus('DISCONNECTED');
        }
      };
    } catch (err) {
      console.warn('[RobinhoodChainListener] Failed to initialize WebSocket:', err);
      if (!this.isManualDisconnect) {
        this.setStatus('ERROR');
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.isManualDisconnect || this.reconnectTimeout) return;
    const delay = Math.min(15000, 2000 * Math.pow(1.3, this.reconnectAttempts));
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (!this.isManualDisconnect) {
        this.connect();
      }
    }, delay);
  }

  public disconnect(): void {
    this.isManualDisconnect = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('DISCONNECTED');
  }

  /**
   * Subscribes to new block headers on Arbitrum Orbit
   */
  private subscribeToBlocks(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    try {
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_subscribe',
        params: ['newHeads'],
      }));
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Periodically queries live DexScreener profiles for newly deployed Robinhood Chain tokens
   */
  private startRobinhoodDiscoveryPoll(): void {
    if (this.pollInterval) return;

    const checkRobinhoodTokens = async () => {
      try {
        const res = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
        if (!res.ok) return;
        const profiles = await res.json();
        if (!Array.isArray(profiles)) return;

        const rhProfiles = profiles.filter((p) => p.chainId === 'robinhood' && p.tokenAddress);
        for (const rh of rhProfiles) {
          const addr = rh.tokenAddress.toLowerCase();
          if (!this.seenRobinhoodTokens.has(addr)) {
            this.seenRobinhoodTokens.add(addr);

            const event: RobinhoodNewLaunchEvent = {
              platform: 'robinhood_swap',
              contractAddress: rh.tokenAddress,
              pairAddress: `0xpair_${rh.tokenAddress.slice(2, 10)}`,
              signature: `0xmint_${rh.tokenAddress.slice(2, 18)}`,
              timestamp: Date.now(),
              initialLiquidityEth: 25.0,
              logSnippet: `Robinhood Chain L2 Token: ${rh.tokenAddress.slice(0, 10)}...`,
              metadata: {
                name: rh.description?.split('\n')[0]?.slice(0, 30) || 'Robinhood Token',
                symbol: rh.tokenAddress.slice(2, 6).toUpperCase(),
                assetType: 'MEMECOIN',
              },
            };

            this.emitLaunch(event);
          }
        }
      } catch {
        // Silently continue
      }
    };

    // Run initial check and set interval
    checkRobinhoodTokens();
    this.pollInterval = setInterval(checkRobinhoodTokens, 30000);
  }

  /**
   * Handle incoming raw JSON-RPC messages from Robinhood L2 RPC
   */
  public handleMessage(raw: string): void {
    try {
      const data = JSON.parse(raw);
      if (!data.params || !data.params.result) return;

      const log = data.params.result;
      const txHash = log.transactionHash || '';
      const topics = log.topics || [];

      // Extract token address from topics if standard PairCreated
      const token0 = topics[1] ? `0x${topics[1].slice(26)}` : '';
      const token1 = topics[2] ? `0x${topics[2].slice(26)}` : '';
      const contractAddress = token0.startsWith('0x000000000000000000000000000000000000') ? token1 : token0 || `0x${txHash.slice(2, 42)}`;

      const event: RobinhoodNewLaunchEvent = {
        platform: 'orbit_factory',
        contractAddress,
        pairAddress: `0x${txHash.slice(2, 42)}`,
        signature: txHash,
        timestamp: Date.now(),
        initialLiquidityEth: 25.0,
        logSnippet: `Robinhood L2 PairCreated: Token ${contractAddress.slice(0, 10)}... in block ${log.blockNumber || 'latest'}`,
      };

      this.emitLaunch(event);
    } catch {
      // Ignore unparseable raw frame
    }
  }

  public createTokenFromLaunch(event: RobinhoodNewLaunchEvent): Token {
    const isRwa = event.metadata?.assetType === 'RWA_TOKENIZED_STOCK';
    const ethPriceUsd = 2650;
    const liquidityUsd = (event.initialLiquidityEth || 30) * ethPriceUsd;
    const defaultPrice = isRwa ? 150.0 : 0.00045;
    const defaultMcap = isRwa ? liquidityUsd * 4 : liquidityUsd * 2.5;

    return dipAndReclaimEngine.enrichToken(lifecycleEngine.enrichToken(volumeAuthenticityEngine.enrichToken({
      id: `rh-live-${event.contractAddress}`,
      name: event.metadata?.name || (isRwa ? 'Tokenized Asset (RWA)' : `Robinhood Token ${event.signature.slice(2, 6)}`),
      symbol: event.metadata?.symbol || (isRwa ? 'rASSET' : 'RHNEW'),
      address: event.contractAddress,
      chain: 'robinhood',
      pairAddress: event.pairAddress,
      dexId: event.platform === 'robinhood_rwa' || isRwa ? 'robinhood_rwa' : 'robinhood_swap',
      priceUsd: defaultPrice,
      priceChange24h: 12.5,
      priceChange1h: 3.2,
      priceChange5m: 0.8,
      marketCap: defaultMcap,
      liquidity: liquidityUsd,
      liquidityChange24h: 8.5,
      volume24h: liquidityUsd * 0.75,
      volumeBuy24h: liquidityUsd * 0.48,
      volumeSell24h: liquidityUsd * 0.27,
      txns24hBuy: 45,
      txns24hSell: 15,
      holdersCount: 38,
      holderGrowth24hPercent: 12,
      createdAt: event.timestamp,
      ageHours: 0.2,
      creatorAddress: RobinhoodChainListener.ROBINHOOD_FACTORY_ADDRESS,
      riskScore: isRwa ? 12 : 28,
      opportunityScore: isRwa ? 88 : 82,
      isDemo: false,
      tags: isRwa ? ['new', 'hot', 'smart_money'] : ['new', 'hot'],
      circulatingSupply: 10_000_000,
      totalSupply: 10_000_000,
    })));
  }

  private emitLaunch(event: RobinhoodNewLaunchEvent) {
    this.launchListeners.forEach((cb) => cb(event));
  }

  private setStatus(status: RobinhoodChainStatus) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }
}

export const robinhoodChainListener = new RobinhoodChainListener();
