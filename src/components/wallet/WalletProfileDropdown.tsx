import React, { useState, useEffect, useRef } from 'react';
import { Wallet, ChevronDown, Copy, Check, ExternalLink, LogOut, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { walletConnectionService } from '../../services/walletConnectionService';
import { ConnectedWallet } from '../../types/walletConnection';
import { ConnectWalletModal } from './ConnectWalletModal';
import { truncateAddress, getExplorerUrl, formatUsd } from '../../utils/formatters';

interface WalletProfileDropdownProps {
  className?: string;
}

export const WalletProfileDropdown: React.FC<WalletProfileDropdownProps> = ({ className = '' }) => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(walletConnectionService.getWallet());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = walletConnectionService.onWalletChange((w) => {
      setWallet(w);
    });
    return unsub;
  }, []);

  // Fetch live balance whenever dropdown opens
  useEffect(() => {
    if (isDropdownOpen && wallet) {
      walletConnectionService.refreshBalance().catch(() => {});
    }
  }, [isDropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRefreshBalance = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRefreshing || !wallet) return;
    setIsRefreshing(true);
    try {
      await walletConnectionService.refreshBalance();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = () => {
    walletConnectionService.disconnect();
    setIsDropdownOpen(false);
  };

  // If not connected: Show Connect Wallet Button
  if (!wallet) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-mono font-semibold rounded-md bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 ${className}`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>CONNECT WALLET</span>
        </button>

        <ConnectWalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // If connected: Show Connected Pill with Dropdown
  const networkDot =
    wallet.chain === 'solana'
      ? 'bg-[#14f195]'
      : wallet.chain === 'bsc'
      ? 'bg-[#f59e0b]'
      : wallet.chain === 'robinhood'
      ? 'bg-[#00c805] animate-pulse'
      : 'bg-sky-400';

  const explorerUrl = getExplorerUrl(wallet.address, wallet.chain, 'address');

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      {/* Wallet Status Pill */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-zinc-700/80 bg-slate-100 dark:bg-zinc-800/90 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-800 dark:text-zinc-100 transition shadow-sm ${className}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${networkDot}`} />
        <span className="font-semibold text-[11px]">
          {truncateAddress(wallet.address, 4)}
        </span>
        {wallet.isWatchOnly && (
          <span className="px-1 py-0.2 rounded text-[9px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            WATCH
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Profile Details Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-1.5 w-64 p-3 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 text-xs space-y-3 animate-fade-in">
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${networkDot}`} />
              <span className="font-semibold text-slate-900 dark:text-zinc-100 text-[11px] uppercase">
                {wallet.chain === 'bsc' ? 'BNB CHAIN' : wallet.chain.toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              {wallet.providerName}
            </span>
          </div>

          {/* Full Address + Copy & Explorer */}
          <div className="bg-slate-50 dark:bg-zinc-950/70 p-2 rounded-lg border border-slate-200 dark:border-zinc-800/80 space-y-1.5">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500">Connected Address</div>
            <div className="font-medium text-[11px] text-slate-800 dark:text-zinc-200 break-all leading-tight">
              {wallet.address}
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px]">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Live On-Chain Balance */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 dark:text-zinc-500">Native Balance:</span>
              <button
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className="text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition"
                title="Query live on-chain balance"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
              </button>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                {wallet.balanceNative.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{' '}
                {wallet.chain === 'solana' ? 'SOL' : wallet.chain === 'bsc' ? 'BNB' : 'ETH'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                ≈ {formatUsd(wallet.balanceUsd)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Switch Chain & Disconnect */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full py-1.5 px-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition flex items-center justify-center gap-1.5 font-semibold text-[11px]"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-500" />
              <span>SWITCH WALLET / CHAIN</span>
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full py-1.5 px-2 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition flex items-center justify-center gap-1.5 font-semibold text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>DISCONNECT WALLET</span>
            </button>
          </div>
        </div>
      )}

      {/* Switch Wallet Modal */}
      <ConnectWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
