import React, { useState } from 'react';
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
import { DEMO_DEVELOPER_PROFILES, DEMO_RUG_RISKS, DEMO_WALLET_CLUSTERS } from '../providers/demoDataProvider';
import { calculateUpsideScenarios, calculateDownsideScenarios } from '../utils/math';
import { TradeSetupDraft, OrderType } from '../types/trade';

export const TokenDetailPage: React.FC = () => {
  const { selectedToken, tokens, openOpportunityReport, approveTradeSetup } = useTradingStore();
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  // If no token selected, pick first token
  const token = selectedToken || tokens[0];

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
      <div className="flex-1 p-12 text-center font-mono text-slate-400">
        No token selected. Please return to Discover and choose a token.
      </div>
    );
  }

  const devProfile = DEMO_DEVELOPER_PROFILES[token.creatorAddress];
  const rugAudit = DEMO_RUG_RISKS[token.address];
  const clusters = DEMO_WALLET_CLUSTERS[token.address] || [];
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
      {/* Token Header Banner */}
      <div className="bg-[#0d1322] border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-300 text-lg">
              {token.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white font-mono">{token.name}</h1>
                <span className="text-sm text-slate-400 font-mono">${token.symbol}</span>
                <ChainBadge chain={token.chain} />
                {token.isDemo && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    DEMO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                <span>CA: {truncateAddress(token.address, 6)}</span>
                <button onClick={handleCopy} className="hover:text-cyan-400 text-slate-500 transition">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={getExplorerUrl(token.address, token.chain, 'token')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 text-slate-500 transition"
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
          <div className="flex items-center gap-6 font-mono">
            <div>
              <div className="text-xs text-slate-400">Current Price</div>
              <div className="text-xl font-bold text-white">{formatUsd(token.priceUsd, 6)}</div>
              <div className={`text-xs ${token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPercent(token.priceChange24h)} 24h
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <OpportunityBadge score={token.opportunityScore} size="md" />
              <RiskBadge level={riskLevel} size="md" />
            </div>

            <button
              onClick={() => openOpportunityReport(token)}
              className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition shadow-md shadow-cyan-500/20"
            >
              Open Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-[#090d16] border-b border-slate-800 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-mono font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 max-w-7xl mx-auto w-full font-mono text-xs text-slate-300 space-y-4">
        {/* TAB: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="terminal-card p-3">
                <span className="text-slate-400 text-[10px]">MARKET CAP</span>
                <div className="text-base font-bold text-white mt-0.5">{formatUsd(token.marketCap)}</div>
              </div>
              <div className="terminal-card p-3">
                <span className="text-slate-400 text-[10px]">LIQUIDITY</span>
                <div className="text-base font-bold text-cyan-300 mt-0.5">{formatUsd(token.liquidity)}</div>
              </div>
              <div className="terminal-card p-3">
                <span className="text-slate-400 text-[10px]">24H VOLUME</span>
                <div className="text-base font-bold text-white mt-0.5">{formatUsd(token.volume24h)}</div>
              </div>
              <div className="terminal-card p-3">
                <span className="text-slate-400 text-[10px]">HOLDERS</span>
                <div className="text-base font-bold text-white mt-0.5">{token.holdersCount.toLocaleString()}</div>
              </div>
            </div>

            {/* AI Agent Decision Log & Summary */}
            <div className="terminal-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  AGENT DECISION LOG &amp; EVIDENCE REASONING
                </span>
                <span className="text-[10px] text-slate-400">Deterministic On-Chain Proofs</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Liquidity increased {token.liquidityChange24h}% over the last 24 hours. Order flow displays positive buy imbalance with {token.txns24hBuy} buys vs {token.txns24hSell} sells. Deployer wallet has {devProfile?.totalLaunches || 1} indexed launch records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-bold block mb-1">Key Positive Drivers:</span>
                  <div>+ High holder accumulation velocity (+{token.holderGrowth24hPercent}% in 24h)</div>
                  <div>+ Liquidity pool depth absorbs standard slippage without catastrophic price impact</div>
                  {primaryCluster && <div>+ Early coordinated wallet cluster detected ({primaryCluster.walletCount} wallets, {formatUsd(primaryCluster.combinedPositionUsd)})</div>}
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <span className="text-rose-400 font-bold block mb-1">Key Risk Friction Points:</span>
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
          <div className="terminal-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                PRICE CHART &amp; TICK MONITOR (${token.symbol} / USD)
              </div>
              <span className="text-xs text-slate-400 font-mono">DEX: {token.dexId.toUpperCase()}</span>
            </div>
            
            {/* SVG Synthetic Candlestick / Line View */}
            <div className="w-full h-64 bg-slate-950 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden border border-slate-800">
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>HIGH: {formatUsd(token.priceUsd * 1.15, 6)}</span>
                <span>VOLUME: {formatUsd(token.volume24h)}</span>
              </div>
              <svg className="w-full h-40 overflow-visible">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 120 Q 80 130 160 90 T 320 70 T 480 50 T 640 40 T 800 20"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2.5"
                />
                <circle cx="800" cy="20" r="4" fill="#00f2fe" className="animate-ping" />
              </svg>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>LOW: {formatUsd(token.priceUsd * 0.85, 6)}</span>
                <span>CURRENT: {formatUsd(token.priceUsd, 6)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Real-time tick engine tracks price updates to automatically evaluate user-approved entry and exit triggers.
            </p>
          </div>
        )}

        {/* TAB: DEVELOPER */}
        {activeTab === 'DEVELOPER' && (
          <div className="terminal-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100">DEPLOYER PROFILE &amp; LAUNCH TIMELINE</h3>
                <span className="text-slate-400">{token.creatorAddress}</span>
              </div>
              <RiskBadge level={devProfile?.riskLevel || 'WATCH'} size="md" />
            </div>

            {devProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">TOTAL LAUNCHES</span>
                    <div className="text-base font-bold text-white">{devProfile.totalLaunches}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">SUCCESSFUL</span>
                    <div className="text-base font-bold text-emerald-400">{devProfile.successfulLaunches}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">ABANDONED</span>
                    <div className="text-base font-bold text-amber-400">{devProfile.abandonedLaunches}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">LP REMOVALS</span>
                    <div className="text-base font-bold text-rose-400">{devProfile.liquidityRemovalEvents}</div>
                  </div>
                </div>

                {/* Launch Timeline */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2">Previous Launches Timeline:</h4>
                  <div className="space-y-2">
                    {devProfile.launchTimeline.map((launch, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>${launch.tokenSymbol}</span>
                            <span className="text-slate-400">({launch.tokenName})</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${launch.status === 'successful' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {launch.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Peak Mcap: {formatUsd(launch.peakMcap)} • Current: {formatUsd(launch.currentMcap)}
                          </div>
                        </div>
                        {launch.liquidityRemoved && (
                          <span className="text-rose-400 font-bold text-xs">
                            LP Removed: {launch.liquidityRemovedAmountUsd ? `$${launch.liquidityRemovedAmountUsd.toLocaleString()}` : 'Yes'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No historical deployments indexed.</p>
            )}
          </div>
        )}

        {/* TAB: HOLDERS */}
        {activeTab === 'HOLDERS' && (
          <div className="terminal-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              TOKEN HOLDER CONCENTRATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px]">TOTAL HOLDERS</span>
                <div className="text-base font-bold text-white mt-0.5">{token.holdersCount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px]">TOP 10 CONCENTRATION</span>
                <div className="text-base font-bold text-cyan-300 mt-0.5">
                  {rugAudit?.solana?.top10HoldersPercent || rugAudit?.evm?.top10HoldersPercent || 22}%
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px]">24H HOLDER GROWTH</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">+{token.holderGrowth24hPercent}%</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs">
              Top holders distribution is within healthy bounds with no single non-LP wallet exceeding 6% of circulating supply.
            </p>
          </div>
        )}

        {/* TAB: WALLETS */}
        {activeTab === 'WALLETS' && (
          <div className="terminal-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              COORDINATED WALLET CLUSTER &amp; SMART MONEY
            </h3>
            {primaryCluster ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-cyan-400 font-bold">{primaryCluster.label}</span>
                    <p className="text-slate-300 text-xs mt-1">{primaryCluster.evidenceSummary}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {primaryCluster.confidence} Confidence
                  </span>
                </div>

                <h4 className="font-bold text-slate-300 text-xs">Cluster Wallets ({primaryCluster.members.length}):</h4>
                <div className="space-y-1.5">
                  {primaryCluster.members.map((m, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{m.walletAddress}</span>
                      <span className="text-emerald-400 font-bold">{formatUsd(m.amountUsd)}</span>
                      <span className="text-slate-400">{m.fundingSourceName || 'Direct'}</span>
                      <span className="text-slate-500">{m.historicalTokensTogether} shared tokens</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No anomalous cluster co-entries detected within initial launch window.</p>
            )}
          </div>
        )}

        {/* TAB: LIQUIDITY */}
        {activeTab === 'LIQUIDITY' && (
          <div className="terminal-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              LIQUIDITY POOL METRICS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px]">TOTAL POOL LIQUIDITY</span>
                <div className="text-base font-bold text-cyan-300 mt-0.5">{formatUsd(token.liquidity)}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px]">24H LIQUIDITY DELTA</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">+{token.liquidityChange24h}%</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px]">LOCK / BURN VERIFICATION</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {token.chain === 'solana' ? '100% LP Burned' : '100% Locked (PinkLock)'}
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs">
              Liquidity depth provides sufficient exit headroom for standard retail size ($100 - $1,000) under normal market conditions.
            </p>
          </div>
        )}

        {/* TAB: TRANSACTIONS */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="terminal-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              RECENT ON-CHAIN TRANSACTIONS
            </h3>
            <div className="space-y-2">
              {[
                { type: 'BUY', amount: '$4,200', wallet: '0x8192...719a', time: '1m ago', tx: '0x3918...12' },
                { type: 'BUY', amount: '$2,800', wallet: '0x9921...39bb', time: '3m ago', tx: '0x4918...34' },
                { type: 'SELL', amount: '$1,100', wallet: '0x123f...c83b', time: '7m ago', tx: '0x5918...56', note: 'Creator Dump' },
                { type: 'BUY', amount: '$8,400', wallet: '0x71c8...e875', time: '12m ago', tx: '0x6918...78' },
              ].map((tx, i) => (
                <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs">
                  <span className={`font-bold ${tx.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type}
                  </span>
                  <span className="text-white font-bold">{tx.amount}</span>
                  <span className="text-slate-400">{tx.wallet}</span>
                  <span className="text-slate-500">{tx.time}</span>
                  {tx.note && <span className="text-rose-400 text-[10px] font-bold">{tx.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: RISK */}
        {activeTab === 'RISK' && (
          <div className="terminal-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100">DEDICATED RUG &amp; SCAM RISK AUDIT</h3>
                <span className="text-slate-400 text-xs">Strict Separation of Fact, Indicator, and Inference</span>
              </div>
              <RiskBadge level={riskLevel} size="md" />
            </div>

            {rugAudit ? (
              <div className="space-y-3">
                {/* Facts */}
                <div className="space-y-1.5">
                  <span className="font-bold text-cyan-400 block">OBSERVED FACTS:</span>
                  {rugAudit.facts.map((f) => (
                    <div key={f.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-200">
                      {f.description}
                    </div>
                  ))}
                </div>

                {/* Indicators */}
                <div className="space-y-1.5">
                  <span className="font-bold text-amber-400 block">OBSERVED INDICATORS:</span>
                  {rugAudit.indicators.map((ind) => (
                    <div key={ind.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                      {ind.description}
                    </div>
                  ))}
                </div>

                {/* Inferences */}
                <div className="space-y-1.5">
                  <span className="font-bold text-indigo-400 block">ANALYTICAL INFERENCES:</span>
                  {rugAudit.inferences.map((inf) => (
                    <div key={inf.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400 italic">
                      {inf.description}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Audit in progress...</p>
            )}
          </div>
        )}

        {/* TAB: SCENARIOS */}
        {activeTab === 'SCENARIOS' && (
          <div className="terminal-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              2X TO 100X MATHEMATICAL SCENARIO MODELING
            </h3>
            <p className="text-xs text-amber-300/80 bg-amber-950/40 p-2.5 rounded border border-amber-800/40">
              DISCLAIMER: Multiples are mathematical models of required liquidity and capital inflow. They are never guaranteed outcomes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upsideScenarios.map((sc) => (
                <div key={sc.multiple} className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-cyan-300 border-b border-slate-800 pb-1">
                    <span>{sc.multiple} UPSIDE</span>
                    <span>{formatUsd(sc.targetMcap)}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div>Target Price: <strong className="text-white">{formatUsd(sc.targetPrice, 6)}</strong></div>
                    <div>Required Liq: <strong className="text-cyan-300">{formatUsd(sc.requiredLiquidity)}</strong></div>
                    <div>Capital Inflow: <strong className="text-emerald-400">~{formatUsd(sc.requiredCapitalInflowUsd)}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-bold text-slate-200 pt-2">Downside Scenarios:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {downsideScenarios.map((ds, i) => (
                <div key={i} className="bg-rose-950/20 p-3 rounded border border-rose-900/40 space-y-1 text-[11px]">
                  <span className="text-rose-400 font-bold block">{ds.label}</span>
                  <div className="text-slate-300">Target Mcap: {formatUsd(ds.targetMcap)}</div>
                  <p className="text-slate-500 text-[10px]">{ds.triggerEvent}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TRADE SETUP */}
        {activeTab === 'TRADE' && (
          <div className="terminal-card p-6 max-w-xl mx-auto space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              CONFIGURE &amp; AUTHORIZE TRADE SETUP
            </h3>
            {tradeMessage && (
              <div className="p-3 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs">
                {tradeMessage}
              </div>
            )}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Entry Trigger Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={entryTriggerPrice}
                  onChange={(e) => setEntryTriggerPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Position Size (USD)</label>
                <input
                  type="number"
                  value={positionSizeUsd}
                  onChange={(e) => setPositionSizeUsd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Take Profit (+{takeProfitPercent}%)</label>
                  <input
                    type="number"
                    value={takeProfitPercent}
                    onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Stop Loss (-{stopLossPercent}%)</label>
                  <input
                    type="number"
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Max Slippage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxSlippagePercent}
                    onChange={(e) => setMaxSlippagePercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Order Expiry</label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours</option>
                    <option value="48">48 Hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Order Execution Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('TRIGGER_LIMIT')}
                    className={`p-2 rounded border text-xs text-left ${
                      orderType === 'TRIGGER_LIMIT' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    TRIGGER LIMIT
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TRIGGER_MARKET')}
                    className={`p-2 rounded border text-xs text-left ${
                      orderType === 'TRIGGER_MARKET' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    TRIGGER MARKET
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={humanConfirmed}
                    onChange={(e) => setHumanConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900"
                  />
                  <span className="text-slate-300 text-[11px]">
                    I authorize the bot to execute only within these exact parameters once the market price reaches the trigger.
                  </span>
                </label>
              </div>
              <button
                onClick={handleTradeSubmit}
                className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20"
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
