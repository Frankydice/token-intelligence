import { Chain } from './token';

export type WalletProviderType =
  | 'phantom'
  | 'solflare'
  | 'metamask'
  | 'rabby'
  | 'coinbase'
  | 'trust'
  | 'watch_only';

export interface ConnectedWallet {
  address: string;
  chain: Chain;
  providerType: WalletProviderType;
  providerName: string;
  balanceNative: number;
  balanceUsd: number;
  isWatchOnly: boolean;
  connectedAt: number;
}
