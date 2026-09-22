import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, CheckCircle2, AlertCircle, Eye, ArrowRight } from 'lucide-react';
import { walletConnectionService } from '../../services/walletConnectionService';
import { WalletProviderType } from '../../types/walletConnection';
import { Chain } from '../../types/token';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose, onConnected }) => {
  const [activeTab, setActiveTab] = useState<'solana' | 'evm' | 'watch_only'>('solana');
  const [evmChain, setEvmChain] = useState<Chain>('bsc');
  const [watchAddress, setWatchAddress] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<WalletProviderType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (type: WalletProviderType) => {
    setLoadingProvider(type);
    setErrorMsg(null);

    try {
      if (type === 'watch_only') {
        await walletConnectionService.connect('watch_only', {
          customAddress: watchAddress,
          preferredChain: evmChain,
        });
      } else {
        await walletConnectionService.connect(type, {
          preferredChain: activeTab === 'solana' ? 'solana' : evmChain,
        });
      }

      onConnected?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet.';
      setErrorMsg(msg);
    } finally {
      setLoadingProvider(null);
    }
  };

  const solanaWallets: { id: WalletProviderType; name: string; icon: string; desc: string }[] = [
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '🟣',
      desc: 'Popular Solana & multi-chain web wallet',
    },
    {
      id: 'solflare',
      name: 'Solflare',
      icon: '🟠',
      desc: 'High-speed Solana native extension',
    },
  ];

  const evmWallets: { id: WalletProviderType; name: string; icon: string; desc: string }[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      desc: 'Industry standard Ethereum & EVM wallet',
    },
    {
      id: 'rabby',
      name: 'Rabby Wallet',
      icon: '🐰',
      desc: 'DeFi & MEV-protected browser extension',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      desc: 'Self-custody multi-network wallet',
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      desc: 'Web3 browser & multi-chain wallet',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-mono text-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#10121a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                CONNECT WEB3 WALLET
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Non-custodial connection • Zero private key access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Solana / EVM / Watch-Only */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
          <button
            onClick={() => {
              setActiveTab('solana');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition text-center flex items-center justify-center gap-1 ${
              activeTab === 'solana'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>SOLANA</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('evm');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition text-center flex items-center justify-center gap-1 ${
              activeTab === 'evm'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>EVM &amp; L2</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('watch_only');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition text-center flex items-center justify-center gap-1 ${
              activeTab === 'watch_only'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>WATCH-ONLY</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3">
          {errorMsg && (
            <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: SOLANA */}
          {activeTab === 'solana' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                Available Solana Wallets
              </span>
              <div className="space-y-1.5">
                {solanaWallets.map((w) => {
                  const isDetected = walletConnectionService.isProviderInstalled(w.id);
                  const isLoading = loadingProvider === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleConnect(w.id)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{w.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                              {w.name}
                            </span>
                            {isDetected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                Installed
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                            {w.desc}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EVM (BNB Chain & Robinhood L2) */}
          {activeTab === 'evm' && (
            <div className="space-y-3">
              {/* Target Chain Selector */}
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold block mb-1.5">
                  Select Target EVM Network:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEvmChain('bsc')}
                    className={`p-2 rounded-md border text-center transition flex items-center justify-center gap-1.5 ${
                      evmChain === 'bsc'
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                    <span>BNB CHAIN</span>
                  </button>
                  <button
                    onClick={() => setEvmChain('robinhood')}
                    className={`p-2 rounded-md border text-center transition flex items-center justify-center gap-1.5 ${
                      evmChain === 'robinhood'
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00c805] animate-pulse"></span>
                    <span>ROBINHOOD L2</span>
                  </button>
                </div>
              </div>

              {/* Wallets List */}
              <div className="space-y-1.5">
                {evmWallets.map((w) => {
                  const isDetected = walletConnectionService.isProviderInstalled(w.id);
                  const isLoading = loadingProvider === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleConnect(w.id)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{w.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                              {w.name}
                            </span>
                            {isDetected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                Installed
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                            {w.desc}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WATCH-ONLY (Zero Risk) */}
          {activeTab === 'watch_only' && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-sky-500/10 border border-sky-500/20 text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  100% Zero-Signature Watch Mode:
                </span>
                Paste any Solana or EVM address (your own cold wallet, a whale wallet, or a smart money tracker). Monitor balances and inspect live setups without signing any permissions.
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-800 dark:text-zinc-200 block mb-1">
                  Public Wallet Address:
                </label>
                <input
                  type="text"
                  placeholder="Paste 0x... (EVM/Robinhood) or Base58 (Solana)..."
                  value={watchAddress}
                  onChange={(e) => setWatchAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-2.5 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition text-xs font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setWatchAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')}
                  className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Fill Sample Solana Whale
                </button>
                <span className="text-slate-400">•</span>
                <button
                  onClick={() => setWatchAddress('0x71c0b1928374928173918273918273918273918f')}
                  className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Fill Sample Robinhood L2
                </button>
              </div>

              <button
                onClick={() => handleConnect('watch_only')}
                disabled={!watchAddress.trim() || loadingProvider === 'watch_only'}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <span>CONNECT WATCH-ONLY WALLET</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Security Notice Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[10px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Non-custodial &amp; Client-Side
            </span>
            <span>Keys never leave your browser</span>
          </div>
        </div>
      </div>
    </div>
  );
};
