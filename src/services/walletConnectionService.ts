import { ConnectedWallet, WalletProviderType } from '../types/walletConnection';
import { Chain } from '../types/token';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      publicKey?: { toString: () => string };
    };
    phantom?: {
      solana?: Window['solana'];
    };
    ethereum?: {
      isMetaMask?: boolean;
      isRabby?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      selectedAddress?: string;
    };
  }
}

const STORAGE_KEY = 'token_intel_connected_wallet';

export class WalletConnectionService {
  private currentWallet: ConnectedWallet | null = null;
  private listeners: ((wallet: ConnectedWallet | null) => void)[] = [];

  constructor() {
    this.currentWallet = this.loadPersistedWallet();
  }

  public getWallet(): ConnectedWallet | null {
    return this.currentWallet;
  }

  public onWalletChange(callback: (wallet: ConnectedWallet | null) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public isProviderInstalled(type: WalletProviderType): boolean {
    if (type === 'watch_only') return true;
    if (typeof window === 'undefined') return false;
    if (type === 'phantom') return Boolean(window.solana?.isPhantom || window.phantom?.solana);
    if (type === 'solflare') return Boolean((window as unknown as { solflare?: unknown }).solflare);
    if (type === 'metamask') return Boolean(window.ethereum?.isMetaMask);
    if (type === 'rabby') return Boolean(window.ethereum?.isRabby);
    if (type === 'coinbase') return Boolean(window.ethereum?.isCoinbaseWallet);
    if (type === 'trust') return Boolean(window.ethereum);
    return false;
  }

  public async connect(
    providerType: WalletProviderType,
    options?: { customAddress?: string; preferredChain?: Chain }
  ): Promise<ConnectedWallet> {
    let address = '';
    let chain: Chain = options?.preferredChain || 'solana';
    let isWatchOnly = false;
    let providerName = 'Web3 Wallet';

    // 1. WATCH-ONLY MODE (Paste any address)
    if (providerType === 'watch_only') {
      const input = (options?.customAddress || '').trim();
      if (!input) throw new Error('Please enter a valid wallet address to monitor.');

      isWatchOnly = true;
      providerName = 'Watch-Only';

      if (input.startsWith('0x') && input.length === 42) {
        address = input;
        chain = options?.preferredChain === 'robinhood' ? 'robinhood' : 'bsc';
      } else if (input.length >= 32 && input.length <= 44 && !input.startsWith('0x')) {
        address = input;
        chain = 'solana';
      } else {
        throw new Error('Invalid address format. Enter a valid Solana or EVM address.');
      }
    }
    // 2. SOLANA EXTENSIONS (Phantom, Solflare)
    else if (providerType === 'phantom' || providerType === 'solflare') {
      providerName = providerType === 'phantom' ? 'Phantom' : 'Solflare';
      chain = 'solana';

      if (typeof window !== 'undefined' && window.solana) {
        try {
          const resp = await window.solana.connect();
          address = resp.publicKey.toString();
        } catch {
          throw new Error(`Connection request rejected by ${providerName}.`);
        }
      } else {
        // Mock fallback for desktop preview / testing without extension installed
        address = `7xKXtg2C${Math.random().toString(36).substring(2, 6)}...${providerName}`;
      }
    }
    // 3. EVM EXTENSIONS (MetaMask, Rabby, Coinbase, Trust)
    else {
      providerName =
        providerType === 'metamask'
          ? 'MetaMask'
          : providerType === 'rabby'
          ? 'Rabby'
          : providerType === 'coinbase'
          ? 'Coinbase Wallet'
          : 'Trust Wallet';

      chain = options?.preferredChain || 'bsc';

      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
          if (!accounts || accounts.length === 0) {
            throw new Error(`No accounts authorized by ${providerName}.`);
          }
          address = accounts[0];
        } catch {
          throw new Error(`Connection request rejected by ${providerName}.`);
        }
      } else {
        // Mock fallback for desktop preview / testing without extension installed
        address = `0x71c0b1${Math.random().toString(16).substring(2, 8)}...${providerType.slice(0, 4)}`;
      }
    }

    const nativeBalance = chain === 'solana' ? 14.85 : chain === 'bsc' ? 3.42 : 1.25;
    const usdRate = chain === 'solana' ? 180 : chain === 'bsc' ? 580 : 3400;

    const wallet: ConnectedWallet = {
      address,
      chain,
      providerType,
      providerName,
      balanceNative: nativeBalance,
      balanceUsd: Number((nativeBalance * usdRate).toFixed(2)),
      isWatchOnly,
      connectedAt: Date.now(),
    };

    this.currentWallet = wallet;
    this.persistWallet(wallet);
    this.notify(wallet);
    return wallet;
  }

  public disconnect(): void {
    if (this.currentWallet?.providerType === 'phantom' && typeof window !== 'undefined' && window.solana?.disconnect) {
      window.solana.disconnect().catch(() => {});
    }

    this.currentWallet = null;
    this.persistWallet(null);
    this.notify(null);
  }

  private notify(wallet: ConnectedWallet | null) {
    this.listeners.forEach((cb) => cb(wallet));
  }

  private persistWallet(wallet: ConnectedWallet | null) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      if (wallet) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage quotas
    }
  }

  private loadPersistedWallet(): ConnectedWallet | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ConnectedWallet;
    } catch {
      return null;
    }
  }
}

export const walletConnectionService = new WalletConnectionService();
