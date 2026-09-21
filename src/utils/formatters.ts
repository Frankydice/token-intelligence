import { Chain } from '../types/token';

export function formatUsd(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '$0.00';
  if (val === 0 || Math.abs(val) < 0.0000001) return '$0.00';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  if (abs < 0.000001) {
    return `${sign}$${abs.toExponential(4)}`;
  }
  if (abs < 0.01) {
    return `${sign}$${abs.toFixed(6)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatCompactNumber(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatPercent(val: number, includeSign: boolean = true): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const prefix = includeSign && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimeAgo(timestampMs: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestampMs) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getExplorerUrl(address: string, chain: Chain, type: 'token' | 'address' | 'tx' = 'token'): string {
  if (chain === 'solana') {
    if (type === 'tx') return `https://solscan.io/tx/${address}`;
    return `https://solscan.io/account/${address}`;
  }
  if (chain === 'bsc') {
    if (type === 'tx') return `https://bscscan.com/tx/${address}`;
    return `https://bscscan.com/token/${address}`;
  }
  if (chain === 'base') {
    if (type === 'tx') return `https://basescan.org/tx/${address}`;
    return `https://basescan.org/token/${address}`;
  }
  if (type === 'tx') return `https://etherscan.io/tx/${address}`;
  return `https://etherscan.io/token/${address}`;
}
