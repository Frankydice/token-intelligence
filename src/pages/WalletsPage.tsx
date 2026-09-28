import React, { useState, useEffect, useMemo } from 'react';
import {
  Network,
  Users,
  ExternalLink,
  GitBranch,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  DollarSign,
  RefreshCw,
  Sparkles,
  Star,
  Check,
  Copy,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { formatUsd, truncateAddress, getExplorerUrl, formatTimeAgo } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';
import { useTradingStore } from '../store/useTradingStore';
import { providerRegistry } from '../providers/providerRegistry';
import { WalletCluster } from '../types/wallet';
import { detectTiedWalletRings, detectWhaleBuySignals } from '../engines/clusterIntelEngine';
import { earlyAccumulatorEngine } from '../engines/earlyAccumulatorEngine';
import { storageService } from '../services/storageService';

type SubView = 'tied_wallets' | 'whales' | 'clusters' | 'smart_money';

export const WalletsPage: React.FC = () => {
  const {
    tokens,
    isScanning,
    refreshTokens,
    openOpportunityReport,
    openTradeSetup,
    setSelectedToken,
    setActiveNav,
  } = useTradingStore();

  const [activeSubView, setActiveSubView] = useState<SubView>('tied_wallets');
  const [allClusters, setAllClusters] = useState<WalletCluster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Private Smart Money Filter State
  const [minWinRate, setMinWinRate] = useState<number>(60);
  const [maxEntryMcap, setMaxEntryMcap] = useState<number>(60000);
  const [onlyStealth, setOnlyStealth] = useState<boolean>(true);
  const [watchlistOnly, setWatchlistOnly] = useState<boolean>(false);
  const [watchlistWallets, setWatchlistWallets] = useState<string[]>([]);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  // Load saved alpha watchlist on mount
  useEffect(() => {
    storageService.loadAlphaWatchlist().then(setWatchlistWallets);
  }, []);

  const toggleWatchlist = (walletAddress: string) => {
    const updated = watchlistWallets.includes(walletAddress)
      ? watchlistWallets.filter((w) => w !== walletAddress)
      : [...watchlistWallets, walletAddress];
    setWatchlistWallets(updated);
    storageService.saveAlphaWatchlist(updated);
  };

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 1500);
  };

  // Compute live tied rings and whale signals from tokens
  const tiedRings = useMemo(() => detectTiedWalletRings(tokens), [tokens]);
  const whaleSignals = useMemo(() => detectWhaleBuySignals(tokens), [tokens]);

  // Compute smart money profiles
  const accumulatorProfiles = useMemo(() => {
    const profiles = earlyAccumulatorEngine.reverseEngineerAllTokens(tokens, {
      minWinRate: minWinRate > 0 ? minWinRate : undefined,
      maxEntryMcap: maxEntryMcap > 0 ? maxEntryMcap : undefined,
      onlyStealth,
    });
    if (watchlistOnly) {
      return profiles.filter((p) => watchlistWallets.includes(p.walletAddress));
    }
    return profiles;
  }, [tokens, minWinRate, maxEntryMcap, onlyStealth, watchlistOnly, watchlistWallets]);

  useEffect(() => {
    let cancelled = false;
    async function loadClusters() {
      if (tokens.length === 0) {
        setAllClusters([]);
        return;
      }
      setIsLoading(true);

      try {
        const clusterArrays = await Promise.all(
          tokens.slice(0, 10).map((t) =>
            providerRegistry.walletAnalysis.detectClusters(t.address, t.chain)
          )
        );
        if (!cancelled) {
          setAllClusters(clusterArrays.flat());
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load wallet clusters:', err);
        if (!cancelled) setIsLoading(false);
      }
    }

    loadClusters();
    return () => {
      cancelled = true;
    };
  }, [tokens]);

  const handleInspect = (tokenAddress: string) => {
    const token = tokens.find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase());
    if (token) {
      setSelectedToken(token);
      setActiveNav('TOKEN_DETAIL');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-sky-500/10 dark:bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-500">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                <span>CLUSTERS, WHALES &amp; TIED-WALLET INTEL</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold">
                  RADAR
                </span>
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Exposing connected puppet rings (buying with one wallet while dumping with another), whale accumulation, and co-entry sniper rings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshTokens()}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Wallets'}</span>
            </button>
          </div>
        </div>

        {/* 4-Way Sub-Navigation Tabs */}
        <div className="flex border border-[var(--card-border)] rounded-lg p-1 bg-black/5 dark:bg-zinc-900/60 text-xs overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveSubView('tied_wallets')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-1.5 ${
              activeSubView === 'tied_wallets'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>TIED WALLETS ({tiedRings.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('whales')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-1.5 ${
              activeSubView === 'whales'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>WHALES ({whaleSignals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('clusters')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-1.5 ${
              activeSubView === 'clusters'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>SNIPER CLUSTERS ({allClusters.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('smart_money')}
            className={`flex-1 min-w-[180px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-1.5 ${
              activeSubView === 'smart_money'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎯 PRIVATE SMART MONEY ({accumulatorProfiles.length})</span>
          </button>
        </div>

        {/* SUBVIEW 1: TIED WALLETS & WASH DUMPING VISUALIZER */}
        {activeSubView === 'tied_wallets' && (
          <div className="space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-[11px] text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wide">
                  DISGUISED DISTRIBUTION &amp; WASH DUMPING SCHEME DETECTOR
                </span>
                <span>
                  Identifies situations where a single entity uses connected sub-wallets from a common funder to create fake green candles (Wallet A buying) while secretly dumping massive supply on retail (Wallet B selling).
                </span>
              </div>
            </div>

            {tiedRings.length > 0 ? (
              <div className="space-y-4">
                {tiedRings.map((ring) => {
                  const tokenObj = tokens.find((t) => t.address.toLowerCase() === ring.tokenAddress.toLowerCase());

                  return (
                    <div
                      key={ring.id}
                      className="terminal-card p-4 sm:p-5 border-l-4 border-l-rose-500 space-y-4"
                    >
                      {/* Ring Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-[var(--text-primary)]">${ring.tokenSymbol}</span>
                            <span className="text-[var(--text-muted)]">({ring.tokenName})</span>
                            <ChainBadge chain={ring.chain} />
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              {ring.tactic.replace(/_/g, ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--card-border)]">
                              {ring.totalWallets} Tied Wallets
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                            {ring.explanation}
                          </p>
                        </div>

                        {/* Extraction PnL Box */}
                        <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 sm:p-3 rounded border border-[var(--card-border)] text-right">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">NET PROFIT EXTRACTED</span>
                          <span className="font-bold text-base text-rose-600 dark:text-rose-400">
                            -{formatUsd(ring.netExtractedUsd)}
                          </span>
                          <span className="text-[10px] text-amber-500 block mt-0.5">Dumping on Retail</span>
                        </div>
                      </div>

                      {/* VISUAL CONNECTION TREE: Funder -> Puppet A vs Puppet B */}
                      <div className="bg-black/5 dark:bg-zinc-950/70 p-3 sm:p-4 rounded-lg border border-[var(--card-border)] space-y-3">
                        {/* ROOT NODE: The Common Funder */}
                        <div className="flex items-center gap-2 p-2.5 rounded bg-white dark:bg-zinc-900 border border-sky-500/40 text-xs shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                            1
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-sky-600 dark:text-sky-400 block text-[10px] uppercase">
                              COMMON FUNDING ORIGIN (MASTER ENTITY)
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text-primary)] truncate">{ring.commonFunderAddress}</span>
                              <a
                                href={getExplorerUrl(ring.commonFunderAddress, ring.chain, 'address')}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--text-muted)] hover:text-sky-500"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 shrink-0">
                            DISPENSER ROOT
                          </span>
                        </div>

                        {/* CONNECTION BRANCHES */}
                        <div className="pl-4 sm:pl-6 border-l-2 border-dashed border-slate-300 dark:border-zinc-700 space-y-2.5">
                          {/* Puppet A: The Bait Buyer */}
                          {ring.pumpWallets.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-2.5 rounded bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                                    PUPPET {idx + 1} (BAIT BUYER) • CREATED GREEN CANDLES
                                  </span>
                                  <span className="font-mono text-[var(--text-primary)] truncate block">{p.address}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatUsd(p.actionUsd)} BUY</span>
                                <span className="text-[10px] text-[var(--text-muted)] block">{formatTimeAgo(p.timestamp)}</span>
                              </div>
                            </div>
                          ))}

                          {/* Puppet B: The Dumper */}
                          {ring.dumpWallets.map((d, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-2.5 rounded bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/30 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                                    PUPPET {idx + 1 + ring.pumpWallets.length} (DISGUISED DUMPER) • DUMPING ON BUYERS
                                  </span>
                                  <span className="font-mono text-[var(--text-primary)] truncate block">{d.address}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-rose-600 dark:text-rose-400">-{formatUsd(d.actionUsd)} DUMP</span>
                                <span className="text-[10px] text-[var(--text-muted)] block">{formatTimeAgo(d.timestamp)}</span>
                              </div>
                            </div>
                          ))}

                          {/* Puppet C: Holding Supply */}
                          {ring.holdingWallets.map((h, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-2 rounded bg-black/5 dark:bg-zinc-900 border border-[var(--card-border)] text-xs text-[var(--text-muted)]"
                            >
                              <span className="truncate">{h.address}</span>
                              <span>STAGED: {formatUsd(h.actionUsd)} remaining</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          CA: {truncateAddress(ring.tokenAddress, 5)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(ring.tokenAddress)}
                            className="px-3 py-1.5 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] text-xs font-semibold transition"
                          >
                            Inspect Token Detail
                          </button>
                          {tokenObj && (
                            <button
                              onClick={() => openOpportunityReport(tokenObj)}
                              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-950 text-xs font-semibold transition"
                            >
                              View Full Audit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="terminal-card p-12 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Tied-Wallet Rings Detected</h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  Swaps and order flows currently exhibit normal independent buyer behaviors without common dispenser puppet nodes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 2: BIG BUYERS & WHALE INFLOWS */}
        {activeSubView === 'whales' && (
          <div className="space-y-4">
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 text-[11px] text-sky-950 dark:text-sky-200 flex items-start gap-2.5">
              <DollarSign className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wide">
                  WHALE &amp; SMART MONEY CAPITAL TRACKER
                </span>
                <span>
                  Tracking individual high-conviction market buy orders exceeding $2,500 or absorbing over 4% of pool liquidity.
                </span>
              </div>
            </div>

            {whaleSignals.length > 0 ? (
              <div className="space-y-3">
                {whaleSignals.map((whale) => {
                  const tokenObj = tokens.find((t) => t.address.toLowerCase() === whale.tokenAddress.toLowerCase());

                  return (
                    <div
                      key={whale.id}
                      className="terminal-card p-4 sm:p-5 border-l-4 border-l-sky-500 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-base text-[var(--text-primary)]">${whale.tokenSymbol}</span>
                          <span className="text-[var(--text-muted)]">({whale.tokenName})</span>
                          <ChainBadge chain={whale.chain} />
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                            {whale.buyerLabel}
                          </span>
                          {whale.isClusterMember && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Linked to Cluster
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 block">
                            +{formatUsd(whale.buyAmountUsd)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {whale.percentOfLiquidity}% of pool liquidity
                          </span>
                        </div>
                      </div>

                      {/* Whale Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/5 dark:bg-zinc-950/60 p-2.5 rounded border border-[var(--card-border)]">
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">BUYER WALLET</span>
                          <span className="font-semibold text-[var(--text-primary)]">{truncateAddress(whale.buyerAddress, 5)}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">TOKENS BOUGHT</span>
                          <span className="font-semibold text-[var(--text-primary)]">{whale.tokenAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">ENTRY TIME</span>
                          <span className="font-semibold text-[var(--text-primary)]">{formatTimeAgo(whale.timestamp)}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">TX HASH</span>
                          <a
                            href={getExplorerUrl(whale.txHash, whale.chain, 'tx')}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sky-500 hover:underline flex items-center gap-1"
                          >
                            <span>{truncateAddress(whale.txHash, 4)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          CA: {truncateAddress(whale.tokenAddress, 4)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(whale.tokenAddress)}
                            className="px-2.5 py-1.5 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] text-xs font-semibold transition"
                          >
                            Inspect
                          </button>
                          {tokenObj && (
                            <>
                              <button
                                onClick={() => openOpportunityReport(tokenObj)}
                                className="px-2.5 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition"
                              >
                                Opportunity Report
                              </button>
                              <button
                                onClick={() => openTradeSetup(tokenObj)}
                                className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-950 text-xs font-bold transition"
                              >
                                Copy Whale Setup
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="terminal-card p-12 text-center space-y-2">
                <DollarSign className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Whale Purchases Logged</h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  No single buy orders exceeding $2,500 have entered the tracked liquidity pools in the last scan interval.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 3: CO-ENTRY SNIPER CLUSTERS */}
        {activeSubView === 'clusters' && (
          <div className="space-y-4">
            {allClusters.length > 0 ? (
              <div className="space-y-4">
                {allClusters.map((cluster) => (
                  <div key={cluster.id} className="terminal-card p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-sky-600 dark:text-sky-400">{cluster.label}</span>
                          <ChainBadge chain={cluster.chain} />
                          <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--card-border)] text-[10px] font-semibold">
                            {cluster.confidence.toUpperCase()} CONFIDENCE
                          </span>
                        </div>
                        <p className="text-[var(--text-muted)] text-xs mt-1">{cluster.evidenceSummary}</p>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 text-xs">
                        <div>
                          <span className="text-[var(--text-muted)] text-[10px] block uppercase font-medium">CLUSTER SIZE</span>
                          <span className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">{cluster.walletCount} Wallets</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] text-[10px] block uppercase font-medium">TIME WINDOW</span>
                          <span className="font-semibold text-amber-500 dark:text-amber-400 text-sm mt-0.5">{cluster.windowSeconds}s</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] text-[10px] block uppercase font-medium">COMBINED ENTRY</span>
                          <span className="font-semibold text-emerald-500 dark:text-emerald-400 text-sm mt-0.5">{formatUsd(cluster.combinedPositionUsd)}</span>
                        </div>
                      </div>
                    </div>

                    {cluster.commonFundingSourceDetected && (
                      <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded-md border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 text-[var(--text-primary)]">
                          <Users className="w-4 h-4 text-sky-500 shrink-0" />
                          <span>Common Funder:</span>
                          <span className="font-semibold">{truncateAddress(cluster.commonFundingSourceAddress || '', 6)}</span>
                        </div>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Funded 30m prior to LP launch</span>
                      </div>
                    )}

                    {/* Members List (Mobile Stacked + Desktop Table) */}
                    <div>
                      <span className="font-semibold text-[var(--text-primary)] block mb-2">Cluster Wallet Members:</span>
                      
                      {/* Mobile Card List (< 640px) */}
                      <div className="block sm:hidden space-y-2">
                        {cluster.members.map((m, idx) => (
                          <div key={idx} className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[var(--text-primary)]">{truncateAddress(m.walletAddress, 6)}</span>
                              <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{formatUsd(m.amountUsd)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)]">
                              <span>Origin: {m.fundingSourceName || 'Direct'}</span>
                              <span>{m.historicalTokensTogether} tokens together</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table (>= 640px) */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                              <th className="py-2 px-3 font-medium">WALLET ADDRESS</th>
                              <th className="py-2 px-3 font-medium">ENTRY AMOUNT</th>
                              <th className="py-2 px-3 font-medium">FUNDING ORIGIN</th>
                              <th className="py-2 px-3 font-medium">HISTORICAL OVERLAP</th>
                              <th className="py-2 px-3 font-medium">TX HASH</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--card-border)] text-[var(--text-primary)]">
                            {cluster.members.map((m, idx) => (
                              <tr key={idx} className="hover:bg-black/5 dark:hover:bg-zinc-900/40">
                                <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">
                                  {truncateAddress(m.walletAddress, 6)}
                                </td>
                                <td className="py-2.5 px-3 text-emerald-500 dark:text-emerald-400 font-semibold">
                                  {formatUsd(m.amountUsd)}
                                </td>
                                <td className="py-2.5 px-3 text-[var(--text-muted)]">
                                  {m.fundingSourceName || 'Direct'}
                                </td>
                                <td className="py-2.5 px-3 text-[var(--text-muted)]">
                                  {m.historicalTokensTogether} tokens together
                                </td>
                                <td className="py-2.5 px-3 text-[var(--text-muted)]">
                                  <a
                                    href={getExplorerUrl(m.entryTxHash, cluster.chain, 'tx')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-sky-500 flex items-center gap-1 transition p-0.5"
                                    title="View in Explorer"
                                  >
                                    <span>{truncateAddress(m.entryTxHash, 4)}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="terminal-card p-12 text-center space-y-2">
                <Network className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                  {isLoading || isScanning ? 'Auditing Order Flow for Sniper Clusters...' : 'No Sniper Clusters Detected'}
                </h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  Awaiting block transactions with coordinated multi-wallet entries.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 4: PRIVATE SMART MONEY & REVERSE-ENGINEERED EARLY ACCUMULATORS */}
        {activeSubView === 'smart_money' && (
          <div className="space-y-4">
            {/* Playbook Chapter 14 Guidance Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-emerald-500/30 rounded-lg p-3.5 text-[11px] text-[var(--text-primary)] flex items-start gap-3">
              <div className="p-2 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold uppercase tracking-wide text-xs text-emerald-400">
                    REVERSE-ENGINEER EARLY ACCUMULATORS (PLAYBOOK CH. 14 &amp; 14.5)
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    ANTI-KOL / ANTI-SLIPPAGE
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                  Following public KOL call channels buys tops with 15%+ slippage into 500 copytrade bots. 
                  True alpha is identifying the private wallets that bought at <span className="text-emerald-400 font-semibold">&lt;$50k market cap</span>, 
                  held through the 40-50% dip, took staged 2x/5x scale-outs, and maintain a <span className="text-emerald-400 font-semibold">&gt;60% win rate</span> with independent CEX funding.
                </p>
              </div>
            </div>

            {/* Interactive Filters Bar */}
            <div className="terminal-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Filters:</span>
                </div>

                {/* Min Win Rate Filter */}
                <div className="flex items-center gap-1 bg-black/5 dark:bg-zinc-800/80 px-2 py-1 rounded border border-[var(--card-border)]">
                  <span className="text-[var(--text-muted)] text-[11px]">Min Win Rate:</span>
                  <select
                    value={minWinRate}
                    onChange={(e) => setMinWinRate(Number(e.target.value))}
                    className="bg-transparent text-[var(--text-primary)] font-bold text-xs outline-none cursor-pointer"
                  >
                    <option value={0}>Any</option>
                    <option value={50}>50%+</option>
                    <option value={60}>60%+ (Playbook Standard)</option>
                    <option value={70}>70%+ (Elite)</option>
                  </select>
                </div>

                {/* Max Entry Mcap Filter */}
                <div className="flex items-center gap-1 bg-black/5 dark:bg-zinc-800/80 px-2 py-1 rounded border border-[var(--card-border)]">
                  <span className="text-[var(--text-muted)] text-[11px]">Max Entry Mcap:</span>
                  <select
                    value={maxEntryMcap}
                    onChange={(e) => setMaxEntryMcap(Number(e.target.value))}
                    className="bg-transparent text-[var(--text-primary)] font-bold text-xs outline-none cursor-pointer"
                  >
                    <option value={0}>Any Mcap</option>
                    <option value={30000}>&lt; $30k (Genesis Accumulation)</option>
                    <option value={50000}>&lt; $50k (Playbook Rule)</option>
                    <option value={60000}>&lt; $60k (Standard Bonding)</option>
                    <option value={100000}>&lt; $100k</option>
                  </select>
                </div>

                {/* Stealth Only Toggle */}
                <button
                  onClick={() => setOnlyStealth(!onlyStealth)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border transition ${
                    onlyStealth
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border-[var(--card-border)]'
                  }`}
                  title="Filter out public KOLs with 250+ copybots and micro-duration jeeters"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Stealth Only (Disqualify KOLs &amp; Jeets)</span>
                </button>

                {/* Watchlist Only Toggle */}
                <button
                  onClick={() => setWatchlistOnly(!watchlistOnly)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border transition ${
                    watchlistOnly
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border-[var(--card-border)]'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${watchlistOnly ? 'fill-amber-400' : ''}`} />
                  <span>Saved Alpha Watchlist ({watchlistWallets.length})</span>
                </button>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                Showing <span className="font-bold text-[var(--text-primary)]">{accumulatorProfiles.length}</span> verified profiles
              </div>
            </div>

            {/* Profiles List */}
            {accumulatorProfiles.length > 0 ? (
              <div className="space-y-3">
                {accumulatorProfiles.map((p) => {
                  const isStarred = watchlistWallets.includes(p.walletAddress);
                  const isStealth = p.classification === 'STEALTH_WHALE' || p.classification === 'CONVICTION_ACCUMULATOR';

                  return (
                    <div
                      key={p.id}
                      className={`terminal-card p-4 space-y-3 border-l-4 transition ${
                        p.classification === 'STEALTH_WHALE'
                          ? 'border-l-emerald-500 hover:border-emerald-400'
                          : p.classification === 'CONVICTION_ACCUMULATOR'
                          ? 'border-l-cyan-500 hover:border-cyan-400'
                          : p.classification === 'KOL_COPYCAT_DISQUALIFIED'
                          ? 'border-l-amber-500/60 opacity-80'
                          : 'border-l-rose-500/60 opacity-75'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Star Watchlist Button */}
                          <button
                            onClick={() => toggleWatchlist(p.walletAddress)}
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-zinc-800 transition text-amber-400"
                            title={isStarred ? 'Remove from Watchlist' : 'Add to Alpha Watchlist'}
                          >
                            <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : 'text-slate-400'}`} />
                          </button>

                          {/* Wallet Address + Copy */}
                          <div className="flex items-center gap-1 bg-black/5 dark:bg-zinc-900 px-2 py-0.5 rounded border border-[var(--card-border)]">
                            <span className="font-bold text-[var(--text-primary)]">{p.walletAddress}</span>
                            <button
                              onClick={() => handleCopyWallet(p.walletAddress)}
                              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 transition"
                              title="Copy Address"
                            >
                              {copiedWallet === p.walletAddress ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <ChainBadge chain={p.chain} />

                          {/* Classification Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              p.classification === 'STEALTH_WHALE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : p.classification === 'CONVICTION_ACCUMULATOR'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : p.classification === 'KOL_COPYCAT_DISQUALIFIED'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {p.classificationLabel}
                          </span>

                          <span className="text-[10px] text-[var(--text-muted)]">
                            Target Token: <strong className="text-[var(--text-primary)]">${p.tokenSymbol}</strong>
                          </span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(p.tokenAddress)}
                            className="px-2.5 py-1 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <span>Inspect Token</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Key Accumulation Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-[11px]">
                        <div className="bg-black/5 dark:bg-zinc-900/60 p-2 rounded border border-[var(--card-border)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">ENTRY MCAP</span>
                          <span className={`font-bold text-xs ${p.entryMarketCap <= 50000 ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                            {formatUsd(p.entryMarketCap)}
                          </span>
                        </div>

                        <div className="bg-black/5 dark:bg-zinc-900/60 p-2 rounded border border-[var(--card-border)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">ROI MULTIPLE</span>
                          <span className="font-bold text-xs text-emerald-400">
                            {p.roiMultiple.toFixed(1)}x
                          </span>
                        </div>

                        <div className="bg-black/5 dark:bg-zinc-900/60 p-2 rounded border border-[var(--card-border)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">WIN RATE</span>
                          <span className={`font-bold text-xs ${p.historicalWinRate >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {p.historicalWinRate}% ({p.totalTokensTraded} tokens)
                          </span>
                        </div>

                        <div className="bg-black/5 dark:bg-zinc-900/60 p-2 rounded border border-[var(--card-border)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">AVG HOLD TIME</span>
                          <span className={`font-bold text-xs ${p.avgHoldDurationHours < 0.1 ? 'text-rose-400' : 'text-[var(--text-primary)]'}`}>
                            {p.avgHoldDurationHours >= 1 ? `${p.avgHoldDurationHours}h` : `${Math.round(p.avgHoldDurationHours * 60)}m`}
                          </span>
                        </div>

                        <div className="bg-black/5 dark:bg-zinc-900/60 p-2 rounded border border-[var(--card-border)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">STAGE-OUTS</span>
                          <span className="font-bold text-xs text-[var(--text-primary)]">
                            {p.stagedExitsCount} exits ({p.remainingBagPercent}% moonbag)
                          </span>
                        </div>

                        <div className="bg-black/5 dark:bg-zinc-900/60 p-2 rounded border border-[var(--card-border)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">FUNDING ORIGIN</span>
                          <span className="font-semibold text-[10px] text-[var(--text-primary)] truncate block" title={p.fundingSource}>
                            {p.fundingSource}
                          </span>
                        </div>
                      </div>

                      {/* Verdict & Evidence Notes */}
                      <div className="bg-black/5 dark:bg-zinc-900/40 p-2.5 rounded border border-[var(--card-border)] space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          {isStealth ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className={isStealth ? 'text-emerald-400' : 'text-amber-400'}>
                            {p.playbookVerdict}
                          </span>
                        </div>
                        <ul className="list-disc list-inside text-[var(--text-muted)] space-y-0.5 pl-1">
                          {p.evidence.map((ev, idx) => (
                            <li key={idx}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="terminal-card p-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                  No Accumulator Profiles Found
                </h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  {watchlistOnly
                    ? 'Your Alpha Watchlist is currently empty. Star early accumulator wallets from the list to track them.'
                    : 'Try adjusting your filters (e.g. lower win rate threshold or expand maximum entry market cap).'}
                </p>
                {(minWinRate > 0 || maxEntryMcap < 100000 || watchlistOnly) && (
                  <button
                    onClick={() => {
                      setMinWinRate(0);
                      setMaxEntryMcap(0);
                      setWatchlistOnly(false);
                      setOnlyStealth(false);
                    }}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
