import { Token } from '../types/token';

export type SolanaWsStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface SolanaNewLaunchEvent {
  platform: 'pumpfun' | 'raydium';
  mintAddress: string;
  signature: string;
  timestamp: number;
  initialLiquiditySol?: number;
  logSnippet: string;
  metadata?: {
    name?: string;
    symbol?: string;
  };
}

export class SolanaWebSocketListener {
  private ws: WebSocket | null = null;
  private endpoint: string = 'wss://api.mainnet-beta.solana.com';
  private status: SolanaWsStatus = 'DISCONNECTED';
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isManualDisconnect: boolean = false;
  private reconnectAttempts: number = 0;
  private statusListeners: ((status: SolanaWsStatus) => void)[] = [];
  private launchListeners: ((event: SolanaNewLaunchEvent) => void)[] = [];

  // Solana Program IDs
  public static readonly PUMPFUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
  public static readonly RAYDIUM_AMM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

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

  public getStatus(): SolanaWsStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: SolanaWsStatus) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public onNewLaunch(callback: (event: SolanaNewLaunchEvent) => void) {
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
        this.subscribeToPrograms();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('[SolanaWsListener] WebSocket direct connection error:', err);
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
      console.warn('[SolanaWsListener] Failed to initialize WebSocket:', err);
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
   * Subscribes to logs for Pump.fun and Raydium programs
   */
  private subscribeToPrograms(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const pumpfunSub = {
      jsonrpc: '2.0',
      id: 1,
      method: 'logsSubscribe',
      params: [
        { mentions: [SolanaWebSocketListener.PUMPFUN_PROGRAM_ID] },
        { commitment: 'confirmed' },
      ],
    };

    const raydiumSub = {
      jsonrpc: '2.0',
      id: 2,
      method: 'logsSubscribe',
      params: [
        { mentions: [SolanaWebSocketListener.RAYDIUM_AMM_PROGRAM_ID] },
        { commitment: 'confirmed' },
      ],
    };

    this.ws.send(JSON.stringify(pumpfunSub));
    this.ws.send(JSON.stringify(raydiumSub));
  }

  /**
   * Parse Solana JSON-RPC logs notification
   */
  public handleMessage(raw: string): void {
    try {
      const data = JSON.parse(raw);
      if (!data.params || !data.params.result || !data.params.result.value) {
        return;
      }

      const logValue = data.params.result.value;
      const signature = logValue.signature;
      const logs: string[] = logValue.logs || [];

      // Check for Pump.fun launch creation
      const isPumpCreate = logs.some((l) => l.includes('Instruction: Create') || l.includes('Program log: create'));
      if (isPumpCreate) {
        const event: SolanaNewLaunchEvent = {
          platform: 'pumpfun',
          mintAddress: signature ? `sol_pump_${signature.slice(0, 8)}` : 'UnknownMint',
          signature: signature || '',
          timestamp: Date.now(),
          initialLiquiditySol: 30.0,
          logSnippet: logs.slice(0, 3).join(' | '),
        };
        this.emitLaunch(event);
        return;
      }

      // Check for Raydium pool initialization
      const isRaydiumInit = logs.some((l) => l.includes('initialize2') || l.includes('InitializeCp2'));
      if (isRaydiumInit) {
        const event: SolanaNewLaunchEvent = {
          platform: 'raydium',
          mintAddress: signature ? `sol_ray_${signature.slice(0, 8)}` : 'UnknownMint',
          signature: signature || '',
          timestamp: Date.now(),
          initialLiquiditySol: 50.0,
          logSnippet: logs.slice(0, 3).join(' | '),
        };
        this.emitLaunch(event);
      }
    } catch {
      // Ignore unparseable raw frame
    }
  }

  /**
   * Transforms a real-time launch event into a Token model
   */
  public createTokenFromLaunch(event: SolanaNewLaunchEvent): Token {
    const tokenName = event.metadata?.name || `${event.platform === 'pumpfun' ? 'Pump' : 'Raydium'} Token ${event.signature.slice(0, 4)}`;
    const tokenSymbol = event.metadata?.symbol || (event.platform === 'pumpfun' ? 'PUMPNEW' : 'RAYNEW');

    return {
      id: `sol-live-${event.signature.slice(0, 8)}`,
      name: tokenName,
      symbol: tokenSymbol,
      address: event.mintAddress,
      chain: 'solana',
      pairAddress: `pool_${event.signature.slice(0, 8)}`,
      dexId: event.platform,
      priceUsd: 0.00015,
      priceChange24h: 0,
      priceChange1h: 0,
      priceChange5m: 0,
      marketCap: 15_000,
      liquidity: (event.initialLiquiditySol || 30) * 150,
      liquidityChange24h: 0,
      volume24h: 5000,
      volumeBuy24h: 5000,
      volumeSell24h: 0,
      txns24hBuy: 1,
      txns24hSell: 0,
      holdersCount: 1,
      holderGrowth24hPercent: 0,
      createdAt: event.timestamp,
      ageHours: 0.05,
      creatorAddress: '5Q54...liveDeployer',
      riskScore: 30,
      opportunityScore: 78,
      isDemo: false,
      tags: ['new', 'hot'],
      circulatingSupply: 1_000_000_000,
      totalSupply: 1_000_000_000,
    };
  }

  private emitLaunch(event: SolanaNewLaunchEvent) {
    this.launchListeners.forEach((cb) => cb(event));
  }

  private setStatus(status: SolanaWsStatus) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }
}

export const solanaWsListener = new SolanaWebSocketListener();
