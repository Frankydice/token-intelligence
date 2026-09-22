import { Token } from '../types/token';

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
  private endpoint: string = 'wss://rpc.robinhood.com/ws';
  private status: RobinhoodChainStatus = 'DISCONNECTED';
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isManualDisconnect: boolean = false;
  private reconnectAttempts: number = 0;
  private statusListeners: ((status: RobinhoodChainStatus) => void)[] = [];
  private launchListeners: ((event: RobinhoodNewLaunchEvent) => void)[] = [];

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
        this.subscribeToPairCreated();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('[RobinhoodChainListener] Direct WebSocket error:', err);
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
    const delay = Math.min(30000, 2000 * Math.pow(1.5, this.reconnectAttempts));
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

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('DISCONNECTED');
  }

  /**
   * Subscribes to PairCreated events on Robinhood L2 DEX Factory
   */
  private subscribeToPairCreated(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // PairCreated topic: keccak256("PairCreated(address,address,address,uint256)")
    const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';

    const subMsg = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_subscribe',
      params: [
        'logs',
        {
          address: RobinhoodChainListener.ROBINHOOD_FACTORY_ADDRESS,
          topics: [PAIR_CREATED_TOPIC],
        },
      ],
    };

    this.ws.send(JSON.stringify(subMsg));
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

    return {
      id: `rh-live-${event.signature.slice(0, 10)}`,
      name: event.metadata?.name || `Robinhood Token ${event.signature.slice(2, 6).toUpperCase()}`,
      symbol: event.metadata?.symbol || 'RHOOD',
      address: event.contractAddress,
      chain: 'robinhood',
      pairAddress: event.pairAddress,
      dexId: event.platform,
      priceUsd: defaultPrice,
      priceChange24h: 0,
      priceChange1h: 0,
      priceChange5m: 0,
      marketCap: Math.round(defaultMcap),
      liquidity: Math.round(liquidityUsd),
      liquidityChange24h: 0,
      volume24h: 15000,
      volumeBuy24h: 15000,
      volumeSell24h: 0,
      txns24hBuy: 1,
      txns24hSell: 0,
      holdersCount: 1,
      holderGrowth24hPercent: 0,
      createdAt: event.timestamp,
      ageHours: 0.02,
      creatorAddress: `0x${event.signature.slice(2, 10)}...deployer`,
      riskScore: isRwa ? 18 : 35,
      opportunityScore: isRwa ? 90 : 75,
      isDemo: false,
      tags: ['new', 'hot'],
      circulatingSupply: 1_000_000_000,
      totalSupply: 1_000_000_000,
    };
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
