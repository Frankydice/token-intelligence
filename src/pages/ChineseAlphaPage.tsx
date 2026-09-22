import React, { useState, useMemo } from 'react';
import {
  Globe,
  Coins,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { analyzeChineseCommunity } from '../engines/chineseCommunityEngine';
import { formatUsd, formatPercent, truncateAddress, getExplorerUrl, formatTimeAgo } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

type ChineseSubTab = 'create' | 'buy' | 'sell';

export const ChineseAlphaPage: React.FC = () => {
  const {
    tokens,
    isScanning,
    refreshTokens,
    openOpportunityReport,
    openTradeSetup,
    setSelectedToken,
    setActiveNav,
  } = useTradingStore();

  const [activeTab, setActiveTab] = useState<ChineseSubTab>('buy');

  const { created, buying, selling, summary } = useMemo(
    () => analyzeChineseCommunity(tokens),
    [tokens]
  );

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
            <div className="w-8 h-8 rounded-md bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2 flex-wrap">
                <span>CHINESE COMMUNITY &amp; BINANCE CABAL RADAR</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-bold">
                  🇨🇳 CHINESE META
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                  🟡 BINANCE CABAL
                </span>
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Monitoring what the Chinese crypto community and Binance Cabals create, what they are buying, and what they are dumping.
              </p>
            </div>
          </div>

          <button
            onClick={() => refreshTokens()}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] text-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Refresh Cabal Stream'}</span>
          </button>
        </div>

        {/* Top Telemetry Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="terminal-card p-3 space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">TRACKED CABAL TOKENS</span>
            <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{summary.totalTrackedTokens} Tokens</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block">Chinese Lore &amp; BSC Meta</span>
          </div>

          <div className="terminal-card p-3 space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">24H CHINESE BUY INFLOW</span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>+{formatUsd(summary.total24hBuyVolume)}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Whale &amp; WeChat Inflow</span>
          </div>

          <div className="terminal-card p-3 space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">24H CABAL SELL VOLUME</span>
            <div className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span>-{formatUsd(summary.total24hSellVolume)}</span>
            </div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">Profit-Taking &amp; Dumps</span>
          </div>

          <div className="terminal-card p-3 space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">NET FLOW DELTA</span>
            <div className={`text-base font-bold ${summary.netFlowUsd >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {summary.netFlowUsd >= 0 ? `+${formatUsd(summary.netFlowUsd)}` : `-${formatUsd(Math.abs(summary.netFlowUsd))}`}
            </div>
            <span className="text-[10px] text-amber-500 block truncate" title={summary.dominantNarrative}>
              {summary.dominantNarrative}
            </span>
          </div>
        </div>

        {/* 3-Way Sub-Navigation Tabs */}
        <div className="flex border border-[var(--card-border)] rounded-lg p-1 bg-black/5 dark:bg-zinc-900/60 text-xs overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>WHAT THEY ARE BUYING ({buying.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>WHAT THEY CREATE ({created.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded font-semibold text-center transition flex items-center justify-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>WHAT THEY ARE SELLING ({selling.length})</span>
          </button>
        </div>

        {/* TAB 1: WHAT THEY ARE BUYING (INFLOWS) */}
        {activeTab === 'buy' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-[11px] text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wide">
                  CHINESE WHALE &amp; BINANCE CABAL ACCUMULATION STREAM
                </span>
                <span>
                  Tracks high-conviction buy orders executed by Chinese smart money wallets, WeChat alpha call syndicates, and Binance Cabal VIP accounts.
                </span>
              </div>
            </div>

            {buying.length > 0 ? (
              <div className="space-y-3">
                {buying.map((act) => {
                  const tokenObj = tokens.find((t) => t.address.toLowerCase() === act.tokenAddress.toLowerCase());

                  return (
                    <div
                      key={act.id}
                      className="terminal-card p-4 border-l-4 border-l-emerald-500 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-[var(--text-primary)]">${act.tokenSymbol}</span>
                            <span className="text-[var(--text-muted)]">({act.tokenName})</span>
                            <ChainBadge chain={act.chain} />
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              {act.actorLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                              {act.narrativeTag}
                            </span>
                          </div>

                          {act.chineseNameTranslate && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-sans">
                              🇨🇳 Meaning / Lore: <span className="font-medium text-[var(--text-primary)]">{act.chineseNameTranslate}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 block">
                            +{formatUsd(act.actionAmountUsd)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {formatTimeAgo(act.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Notes & Intelligence */}
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {act.notes}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                          <span>Buyer: {truncateAddress(act.actorAddress, 5)}</span>
                          <span>•</span>
                          <a
                            href={getExplorerUrl(act.txHash, act.chain, 'tx')}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-500 hover:underline flex items-center gap-0.5"
                          >
                            <span>Tx Hash</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(act.tokenAddress)}
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
                                className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-950 text-xs font-bold transition flex items-center gap-1"
                              >
                                <span>Copy Cabal Buy</span>
                                <ArrowRight className="w-3 h-3" />
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
                <Flame className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Active Chinese Inflow Spikes</h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  Monitoring DEX swap streams for coordinated accumulation from Chinese alpha syndicates.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WHAT THEY CREATE (DEPLOYMENTS) */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
              <Coins className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wide">
                  CHINESE DEVELOPER &amp; BINANCE CABAL TOKEN CREATIONS
                </span>
                <span>
                  Tracks fresh token pairs launched by Chinese developers, featuring Chinese characters/Hanzi or funded via Asian CEX hot wallets (OKX, Gate, Binance).
                </span>
              </div>
            </div>

            {created.length > 0 ? (
              <div className="space-y-3">
                {created.map((act) => {
                  const tokenObj = tokens.find((t) => t.address.toLowerCase() === act.tokenAddress.toLowerCase());

                  return (
                    <div
                      key={act.id}
                      className="terminal-card p-4 border-l-4 border-l-amber-500 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-[var(--text-primary)]">${act.tokenSymbol}</span>
                            <span className="text-[var(--text-muted)]">({act.tokenName})</span>
                            <ChainBadge chain={act.chain} />
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              {act.cabalType.replace(/_/g, ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/5 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--card-border)]">
                              {act.narrativeTag}
                            </span>
                          </div>

                          {act.chineseNameTranslate && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-sans">
                              🇨🇳 Cultural Meaning: <span className="font-medium text-[var(--text-primary)]">{act.chineseNameTranslate}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">INITIAL POOL LIQUIDITY</span>
                          <span className="font-bold text-base text-[var(--text-primary)]">
                            {formatUsd(act.actionAmountUsd)}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {act.notes}
                      </p>

                      {/* Deployer Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/5 dark:bg-zinc-950/60 p-2.5 rounded border border-[var(--card-border)]">
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">DEPLOYER WALLET</span>
                          <span className="font-semibold text-[var(--text-primary)]">{truncateAddress(act.actorAddress, 5)}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">PRICE</span>
                          <span className="font-semibold text-[var(--text-primary)]">{formatUsd(act.tokenPriceUsd, 6)}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">24H MOMENTUM</span>
                          <span className={`font-semibold ${act.priceChange24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatPercent(act.priceChange24h)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px] uppercase font-medium">LAUNCH TIME</span>
                          <span className="font-semibold text-[var(--text-primary)]">{formatTimeAgo(act.timestamp)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          CA: {truncateAddress(act.tokenAddress, 5)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspect(act.tokenAddress)}
                            className="px-2.5 py-1.5 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] text-xs font-semibold transition"
                          >
                            Inspect
                          </button>
                          {tokenObj && (
                            <button
                              onClick={() => openOpportunityReport(tokenObj)}
                              className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-950 text-xs font-bold transition"
                            >
                              Opportunity Report
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
                <Coins className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Chinese Community Deployments Found</h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  New token pairs with Chinese Hanzi names or Binance Cabal patterns will be indexed automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WHAT THEY ARE SELLING (EXITS / DUMPS) */}
        {activeTab === 'sell' && (
          <div className="space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-[11px] text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wide">
                  CABAL EXIT &amp; CHINESE WHALE DUMP WARNING STREAM
                </span>
                <span>
                  Tracks profit-taking events, insider liquidations, and sell-the-news dumps from Binance Cabals and Chinese whales.
                </span>
              </div>
            </div>

            {selling.length > 0 ? (
              <div className="space-y-3">
                {selling.map((act) => {
                  return (
                    <div
                      key={act.id}
                      className="terminal-card p-4 border-l-4 border-l-rose-500 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-[var(--text-primary)]">${act.tokenSymbol}</span>
                            <span className="text-[var(--text-muted)]">({act.tokenName})</span>
                            <ChainBadge chain={act.chain} />
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              URGENT EXIT SIGNAL
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              {act.actorLabel}
                            </span>
                          </div>

                          {act.chineseNameTranslate && (
                            <div className="text-[11px] text-slate-400 dark:text-zinc-400 mt-1 font-sans">
                              Meaning: <span className="font-medium text-[var(--text-primary)]">{act.chineseNameTranslate}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-base text-rose-600 dark:text-rose-400 block">
                            -{formatUsd(act.actionAmountUsd)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {formatTimeAgo(act.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {act.notes}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                          <span>Seller: {truncateAddress(act.actorAddress, 5)}</span>
                          <span>•</span>
                          <a
                            href={getExplorerUrl(act.txHash, act.chain, 'tx')}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-500 hover:underline flex items-center gap-0.5"
                          >
                            <span>Tx Hash</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <button
                          onClick={() => handleInspect(act.tokenAddress)}
                          className="px-2.5 py-1.5 rounded bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] text-xs font-semibold transition"
                        >
                          Inspect Token
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="terminal-card p-12 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">No Active Cabal Dumps Logged</h4>
                <p className="text-[var(--text-muted)] text-[11px] max-w-md mx-auto">
                  Chinese whales and Binance Cabals are not actively liquidating tracked token positions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
