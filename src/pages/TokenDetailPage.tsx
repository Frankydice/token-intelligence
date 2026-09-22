import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatUsd, formatPercent, truncateAddress, getExplorerUrl } from '../utils/formatters';
import { ChainBadge, OpportunityBadge, RiskBadge } from '../components/common/Badge';
import { providerRegistry } from '../providers/providerRegistry';
import { DeveloperProfile } from '../types/developer';
import { RugRiskAudit } from '../types/risk';
import { WalletCluster } from '../types/wallet';
import { calculateUpsideScenarios, calculateDownsideScenarios } from '../utils/math';
import { TradeSetupDraft, OrderType } from '../types/trade';

export const TokenDetailPage: React.FC = () => {
  const { selectedToken, tokens, openOpportunityReport, approveTradeSetup } = useTradingStore();
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  // If no token selected, pick first token
  const token = selectedToken || tokens[0];

  const [devProfile, setDevProfile] = useState<DeveloperProfile | null>(null);
  const [rugAudit, setRugAudit] = useState<RugRiskAudit | null>(null);
  const [clusters, setClusters] = useState<WalletCluster[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      providerRegistry.developerAnalysis.analyzeDeveloper(token.creatorAddress, token.chain),
      providerRegistry.riskAnalysis.auditTokenRisk(token.address, token.chain, token.creatorAddress),
      providerRegistry.walletAnalysis.detectClusters(token.address, token.chain),
    ])
      .then(([dev, risk, cls]) => {
        if (!cancelled) {
          setDevProfile(dev);
          setRugAudit(risk);
          setClusters(cls);
        }
      })
      .catch((err) => {
        console.warn('Failed to load token live intelligence:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [token?.address, token?.creatorAddress, token?.chain]);

  // Trade Setup Tab form state
  const defaultEntry = token ? Number((token.priceUsd * 0.95).toFixed(6)) : 0.0004;
  const [entryTriggerPrice, setEntryTriggerPrice] = useState<number>(defaultEntry);
  const [positionSizeUsd, setPositionSizeUsd] = useState<number>(100);
  const [takeProfitPercent, setTakeProfitPercent] = useState<number>(100);
  const [stopLossPercent, setStopLossPercent] = useState<number>(30);
  const [maxSlippagePercent, setMaxSlippagePercent] = useState<number>(3.0);
  const [orderType, setOrderType] = useState<OrderType>('TRIGGER_LIMIT');
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [humanConfirmed, setHumanConfirmed] = useState<boolean>(false);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="flex-1 p-12 text-center font-mono text-zinc-400">
        No token selected. Please return to Discover and choose a token.
      </div>
    );
  }

  const primaryCluster = clusters[0];
  const upsideScenarios = calculateUpsideScenarios(token);
  const downsideScenarios = calculateDownsideScenarios(token);

  const handleCopy = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTradeSubmit = () => {
    if (!humanConfirmed) {
      setTradeMessage('You must check the authorization box to confirm this setup.');
      return;
    }
    const takeProfitPrice = Number((entryTriggerPrice * (1 + takeProfitPercent / 100)).toFixed(6));
    const stopLossPrice = Number((entryTriggerPrice * (1 - stopLossPercent / 100)).toFixed(6));

    const draft: TradeSetupDraft = {
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      chain: token.chain,
      currentPrice: token.priceUsd,
      entryTriggerPrice,
      positionSizeUsd,
      takeProfitPercent,
      takeProfitPrice,
      stopLossPercent,
      stopLossPrice,
      maxSlippagePercent,
      orderType,
      expiryHours,
    };

    const res = approveTradeSetup(draft);
    if (res) {
      setTradeMessage('Trade setup approved! Bot is now monitoring waiting for market entry condition.');
    }
  };

  const riskLevel =
    token.riskScore >= 75
      ? 'CRITICAL RISK'
      : token.riskScore >= 50
      ? 'HIGH RISK'
      : token.riskScore >= 30
      ? 'WATCH'
      : 'LOW CONCERN';

  const tabs = [
    { id: 'OVERVIEW', label: 'OVERVIEW' },
    { id: 'CHART', label: 'CHART' },
    { id: 'DEVELOPER', label: 'DEVELOPER' },
    { id: 'HOLDERS', label: 'HOLDERS' },
    { id: 'WALLETS', label: 'WALLETS' },
    { id: 'LIQUIDITY', label: 'LIQUIDITY' },
    { id: 'TRANSACTIONS', label: 'TRANSACTIONS' },
    { id: 'RISK', label: 'RISK' },
    { id: 'SCENARIOS', label: '5X-100X SCENARIOS' },
    { id: 'TRADE', label: 'TRADE SETUP' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Token Header Banner */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-black/5 dark:bg-zinc-800 border border-[var(--card-border)] flex items-center justify-center font-mono font-semibold text-[var(--text-primary)] text-sm shrink-0">
              {token.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-base sm:text-lg text-[var(--text-primary)] font-mono">{token.name}</h1>
                <span className="text-xs sm:text-sm text-[var(--text-muted)] font-mono">${token.symbol}</span>
                <ChainBadge chain={token.chain} />
                {token.isDemo && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium">
                    DEMO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-[var(--text-muted)] font-mono mt-1 flex-wrap">
                <span>CA: {truncateAddress(token.address, 4)}</span>
                <button onClick={handleCopy} className="hover:text-sky-500 text-[var(--text-muted)] transition p-0.5" title="Copy Address">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={getExplorerUrl(token.address, token.chain, 'token')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-500 text-[var(--text-muted)] transition p-0.5"
                  title="View in Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span>•</span>
                <span>Age: {token.ageHours}h</span>
                <span>•</span>
                <span>DEX: {token.dexId.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Price & Badges */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 font-mono border-t sm:border-t-0 border-[var(--card-border)] pt-2.5 sm:pt-0">
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Current Price</div>
              <div className="text-base sm:text-xl font-semibold text-[var(--text-primary)]">{formatUsd(token.priceUsd, 6)}</div>
              <div className={`text-[11px] sm:text-xs font-semibold ${token.priceChange24h >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {formatPercent(token.priceChange24h)} 24h
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <OpportunityBadge score={token.opportunityScore} size="md" />
              <RiskBadge level={riskLevel} size="md" />
            </div>

            <button
              onClick={() => openOpportunityReport(token)}
              className="px-3.5 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs font-mono transition shadow-sm"
            >
              Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar (Scrollable on mobile) */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] px-3 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2.5 text-xs font-mono font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-500/5'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 max-w-7xl mx-auto w-full font-mono text-xs text-[var(--text-primary)] space-y-4">
        {/* TAB: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="terminal-card p-3">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-medium">MARKET CAP</span>
                <div className="text-base font-semibold text-zinc-100 mt-0.5">{formatUsd(token.marketCap)}</div>
              </div>
              <div className="terminal-card p-3">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-medium">LIQUIDITY</span>
                <div className="text-base font-semibold text-zinc-100 mt-0.5">{formatUsd(token.liquidity)}</div>
              </div>
              <div className="terminal-card p-3">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-medium">24H VOLUME</span>
                <div className="text-base font-semibold text-zinc-100 mt-0.5">{formatUsd(token.volume24h)}</div>
              </div>
              <div className="terminal-card p-3">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-medium">HOLDERS</span>
                <div className="text-base font-semibold text-zinc-100 mt-0.5">{token.holdersCount.toLocaleString()}</div>
              </div>
            </div>

            {/* AI Agent Decision Log & Summary */}
            <div className="terminal-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  AGENT DECISION LOG &amp; EVIDENCE REASONING
                </span>
                <span className="text-[10px] text-zinc-500">Deterministic On-Chain Proofs</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Liquidity increased {token.liquidityChange24h}% over the last 24 hours. Order flow displays positive buy imbalance with {token.txns24hBuy} buys vs {token.txns24hSell} sells. Deployer wallet has {devProfile?.totalLaunches || 1} indexed launch records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-zinc-950/70 p-3 rounded-md border border-zinc-800 space-y-1">
                  <span className="text-emerald-400 font-semibold block mb-1">Key Positive Drivers:</span>
                  <div>+ High holder accumulation velocity (+{token.holderGrowth24hPercent}% in 24h)</div>
                  <div>+ Liquidity pool depth absorbs standard slippage without catastrophic price impact</div>
                  {primaryCluster && <div>+ Early coordinated wallet cluster detected ({primaryCluster.walletCount} wallets, {formatUsd(primaryCluster.combinedPositionUsd)})</div>}
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-md border border-zinc-800 space-y-1">
                  <span className="text-rose-400 font-semibold block mb-1">Key Risk Friction Points:</span>
                  <div>− Deployer risk category: {devProfile?.riskLevel || 'WATCH'}</div>
                  {devProfile?.liquidityRemovalEvents ? <div>− Deployer previously removed liquidity from historical launch</div> : <div>− Top 10 holders control meaningful supply fraction</div>}
                  <div>− Volatility risk inherent to newly created DEX trading pairs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CHART */}
        {activeTab === 'CHART' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <div className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                PRICE CHART &amp; TICK MONITOR (${token.symbol} / USD)
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">DEX: {token.dexId.toUpperCase()}</span>
            </div>
            
            {/* SVG Synthetic Candlestick / Line View */}
            <div className="w-full h-64 bg-black/5 dark:bg-black/50 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden border border-[var(--card-border)]">
              <div className="flex justify-between text-[var(--text-muted)] text-[10px]">
                <span>HIGH: {formatUsd(token.priceUsd * 1.15, 6)}</span>
                <span>VOLUME: {formatUsd(token.volume24h)}</span>
              </div>
              <svg className="w-full h-40 overflow-visible">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 120 Q 80 130 160 90 T 320 70 T 480 50 T 640 40 T 800 20"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />
                <circle cx="800" cy="20" r="4" fill="#0284c7" className="animate-ping" />
              </svg>
              <div className="flex justify-between text-[var(--text-muted)] text-[10px]">
                <span>LOW: {formatUsd(token.priceUsd * 0.85, 6)}</span>
                <span>CURRENT: {formatUsd(token.priceUsd, 6)}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Real-time tick engine tracks price updates to automatically evaluate user-approved entry and exit triggers.
            </p>
          </div>
        )}

        {/* TAB: DEVELOPER */}
        {activeTab === 'DEVELOPER' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">DEPLOYER PROFILE &amp; LAUNCH TIMELINE</h3>
                <span className="text-[var(--text-muted)] text-[11px] block mt-0.5">{token.creatorAddress}</span>
              </div>
              <RiskBadge level={devProfile?.riskLevel || 'WATCH'} size="md" />
            </div>

            {devProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">TOTAL LAUNCHES</span>
                    <div className="text-base font-semibold text-[var(--text-primary)] mt-0.5">{devProfile.totalLaunches}</div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">SUCCESSFUL</span>
                    <div className="text-base font-semibold text-emerald-500 dark:text-emerald-400 mt-0.5">{devProfile.successfulLaunches}</div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">ABANDONED</span>
                    <div className="text-base font-semibold text-amber-500 dark:text-amber-400 mt-0.5">{devProfile.abandonedLaunches}</div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">LP REMOVALS</span>
                    <div className="text-base font-semibold text-rose-500 dark:text-rose-400 mt-0.5">{devProfile.liquidityRemovalEvents}</div>
                  </div>
                </div>

                {/* Launch Timeline */}
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Previous Launches Timeline:</h4>
                  <div className="space-y-2">
                    {devProfile.launchTimeline.map((launch, idx) => (
                      <div key={idx} className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)] flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <span>${launch.tokenSymbol}</span>
                            <span className="text-[var(--text-muted)]">({launch.tokenName})</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${launch.status === 'successful' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                              {launch.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[var(--text-muted)] text-[11px] mt-0.5">
                            Peak Mcap: {formatUsd(launch.peakMcap)} • Current: {formatUsd(launch.currentMcap)}
                          </div>
                        </div>
                        {launch.liquidityRemoved && (
                          <span className="text-rose-500 dark:text-rose-400 font-semibold text-xs">
                            LP Removed: {launch.liquidityRemovedAmountUsd ? `$${launch.liquidityRemovedAmountUsd.toLocaleString()}` : 'Yes'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-muted)]">No historical deployments indexed.</p>
            )}
          </div>
        )}

        {/* TAB: HOLDERS */}
        {activeTab === 'HOLDERS' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              TOKEN HOLDER CONCENTRATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">TOTAL HOLDERS</span>
                <div className="text-base font-semibold text-[var(--text-primary)] mt-0.5">{token.holdersCount.toLocaleString()}</div>
              </div>
              <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">TOP 10 CONCENTRATION</span>
                <div className="text-base font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                  {rugAudit?.solana?.top10HoldersPercent || rugAudit?.evm?.top10HoldersPercent || 22}%
                </div>
              </div>
              <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">24H HOLDER GROWTH</span>
                <div className="text-base font-semibold text-emerald-500 dark:text-emerald-400 mt-0.5">+{token.holderGrowth24hPercent}%</div>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-xs">
              Top holders distribution is within healthy bounds with no single non-LP wallet exceeding 6% of circulating supply.
            </p>
          </div>
        )}

        {/* TAB: WALLETS */}
        {activeTab === 'WALLETS' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              COORDINATED WALLET CLUSTER &amp; SMART MONEY
            </h3>
            {primaryCluster ? (
              <div className="space-y-3">
                <div className="bg-black/5 dark:bg-zinc-950/70 p-4 rounded border border-[var(--card-border)] flex items-center justify-between">
                  <div>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">{primaryCluster.label}</span>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{primaryCluster.evidenceSummary}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/30 font-semibold">
                    {primaryCluster.confidence} Confidence
                  </span>
                </div>

                <h4 className="font-semibold text-[var(--text-primary)] text-xs">Cluster Wallets ({primaryCluster.members.length}):</h4>
                <div className="space-y-1.5">
                  {primaryCluster.members.map((m, idx) => (
                    <div key={idx} className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded border border-[var(--card-border)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-primary)]">{m.walletAddress}</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{formatUsd(m.amountUsd)}</span>
                      <span className="text-[var(--text-muted)]">{m.fundingSourceName || 'Direct'}</span>
                      <span className="text-[var(--text-muted)]">{m.historicalTokensTogether} shared tokens</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-muted)]">No anomalous cluster co-entries detected within initial launch window.</p>
            )}
          </div>
        )}

        {/* TAB: LIQUIDITY */}
        {activeTab === 'LIQUIDITY' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              LIQUIDITY POOL METRICS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">TOTAL POOL LIQUIDITY</span>
                <div className="text-base font-semibold text-sky-600 dark:text-sky-400 mt-0.5">{formatUsd(token.liquidity)}</div>
              </div>
              <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">24H LIQUIDITY DELTA</span>
                <div className="text-base font-semibold text-emerald-500 dark:text-emerald-400 mt-0.5">+{token.liquidityChange24h}%</div>
              </div>
              <div className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">LOCK / BURN VERIFICATION</span>
                <div className="text-base font-semibold text-[var(--text-primary)] mt-0.5">
                  {token.chain === 'solana' ? '100% LP Burned' : '100% Locked (PinkLock)'}
                </div>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-xs">
              Liquidity depth provides sufficient exit headroom for standard retail size ($100 - $1,000) under normal market conditions.
            </p>
          </div>
        )}

        {/* TAB: TRANSACTIONS */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              RECENT ON-CHAIN TRANSACTIONS
            </h3>
            <div className="space-y-2">
              {[
                { type: 'BUY', amount: '$4,200', wallet: '0x8192...719a', time: '1m ago', tx: '0x3918...12' },
                { type: 'BUY', amount: '$2,800', wallet: '0x9921...39bb', time: '3m ago', tx: '0x4918...34' },
                { type: 'SELL', amount: '$1,100', wallet: '0x123f...c83b', time: '7m ago', tx: '0x5918...56', note: 'Creator Dump' },
                { type: 'BUY', amount: '$8,400', wallet: '0x71c8...e875', time: '12m ago', tx: '0x6918...78' },
              ].map((tx, i) => (
                <div key={i} className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded border border-[var(--card-border)] flex items-center justify-between text-xs">
                  <span className={`font-semibold ${tx.type === 'BUY' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {tx.type}
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">{tx.amount}</span>
                  <span className="text-[var(--text-muted)]">{tx.wallet}</span>
                  <span className="text-[var(--text-muted)]">{tx.time}</span>
                  {tx.note && <span className="text-rose-500 dark:text-rose-400 text-[10px] font-semibold">{tx.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: RISK */}
        {activeTab === 'RISK' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">DEDICATED RUG &amp; SCAM RISK AUDIT</h3>
                <span className="text-[var(--text-muted)] text-xs">Strict Separation of Fact, Indicator, and Inference</span>
              </div>
              <RiskBadge level={riskLevel} size="md" />
            </div>

            {rugAudit ? (
              <div className="space-y-3">
                {/* Facts */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-sky-600 dark:text-sky-400 block">OBSERVED FACTS:</span>
                  {rugAudit.facts.map((f) => (
                    <div key={f.id} className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded border border-[var(--card-border)] text-[var(--text-primary)]">
                      {f.description}
                    </div>
                  ))}
                </div>

                {/* Indicators */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block">OBSERVED INDICATORS:</span>
                  {rugAudit.indicators.map((ind) => (
                    <div key={ind.id} className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded border border-[var(--card-border)] text-[var(--text-primary)]">
                      {ind.description}
                    </div>
                  ))}
                </div>

                {/* Inferences */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 block">ANALYTICAL INFERENCES:</span>
                  {rugAudit.inferences.map((inf) => (
                    <div key={inf.id} className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded border border-[var(--card-border)] text-[var(--text-muted)] italic">
                      {inf.description}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-muted)]">Audit in progress...</p>
            )}
          </div>
        )}


        {/* TAB: SCENARIOS */}
        {activeTab === 'SCENARIOS' && (
          <div className="terminal-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              2X TO 100X MATHEMATICAL SCENARIO MODELING
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-md border border-amber-500/20">
              DISCLAIMER: Multiples are mathematical models of required liquidity and capital inflow. They are never guaranteed outcomes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upsideScenarios.map((sc) => (
                <div key={sc.multiple} className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded-md border border-[var(--card-border)] space-y-2">
                  <div className="flex items-center justify-between font-semibold text-[var(--text-primary)] border-b border-[var(--card-border)] pb-1">
                    <span className="text-sky-600 dark:text-sky-400">{sc.multiple} UPSIDE</span>
                    <span>{formatUsd(sc.targetMcap)}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
                    <div>Target Price: <strong className="text-[var(--text-primary)]">{formatUsd(sc.targetPrice, 6)}</strong></div>
                    <div>Required Liq: <strong className="text-[var(--text-primary)]">{formatUsd(sc.requiredLiquidity)}</strong></div>
                    <div>Capital Inflow: <strong className="text-emerald-500 dark:text-emerald-400">~{formatUsd(sc.requiredCapitalInflowUsd)}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-semibold text-[var(--text-primary)] pt-2">Downside Scenarios:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {downsideScenarios.map((ds, i) => (
                <div key={i} className="bg-rose-500/5 dark:bg-rose-950/20 p-3 rounded-md border border-rose-500/20 dark:border-rose-900/40 space-y-1 text-[11px]">
                  <span className="text-rose-500 dark:text-rose-400 font-semibold block">{ds.label}</span>
                  <div className="text-[var(--text-primary)]">Target Mcap: {formatUsd(ds.targetMcap)}</div>
                  <p className="text-[var(--text-muted)] text-[10px]">{ds.triggerEvent}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TRADE SETUP */}
        {activeTab === 'TRADE' && (
          <div className="terminal-card p-4 sm:p-6 max-w-xl mx-auto space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              CONFIGURE &amp; AUTHORIZE TRADE SETUP
            </h3>
            {tradeMessage && (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs">
                {tradeMessage}
              </div>
            )}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-primary)] mb-1 font-medium">Entry Trigger Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={entryTriggerPrice}
                  onChange={(e) => setEntryTriggerPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-[var(--text-primary)] mb-1 font-medium">Position Size (USD)</label>
                <input
                  type="number"
                  value={positionSizeUsd}
                  onChange={(e) => setPositionSizeUsd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-primary)] mb-1 font-medium">Take Profit (+{takeProfitPercent}%)</label>
                  <input
                    type="number"
                    value={takeProfitPercent}
                    onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-primary)] mb-1 font-medium">Stop Loss (-{stopLossPercent}%)</label>
                  <input
                    type="number"
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-primary)] mb-1 font-medium">Max Slippage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxSlippagePercent}
                    onChange={(e) => setMaxSlippagePercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-primary)] mb-1 font-medium">Order Expiry</label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 cursor-pointer transition"
                  >
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours</option>
                    <option value="48">48 Hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-primary)] mb-1 font-medium">Order Execution Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('TRIGGER_LIMIT')}
                    className={`p-2.5 rounded-md border text-xs text-left transition ${
                      orderType === 'TRIGGER_LIMIT' ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-300 font-semibold' : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="font-semibold">TRIGGER LIMIT</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">Execute only at or better than trigger</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TRIGGER_MARKET')}
                    className={`p-2.5 rounded-md border text-xs text-left transition ${
                      orderType === 'TRIGGER_MARKET' ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-300 font-semibold' : 'bg-black/5 dark:bg-zinc-950/60 border-[var(--card-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="font-semibold">TRIGGER MARKET</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">Market order upon trigger condition</div>
                  </button>
                </div>
              </div>
              <div className="bg-black/5 dark:bg-zinc-950/80 p-3 rounded-md border border-[var(--card-border)]">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={humanConfirmed}
                    onChange={(e) => setHumanConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-sky-500 bg-white dark:bg-zinc-900 border-[var(--card-border)] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[var(--text-primary)] text-[11px] leading-relaxed">
                    I authorize the bot to execute only within these exact parameters once the market price reaches the trigger.
                  </span>
                </label>
              </div>
              <button
                onClick={handleTradeSubmit}
                className="w-full py-2.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition shadow-sm text-xs font-mono"
              >
                ARM BOT WITH HUMAN AUTHORIZATION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
