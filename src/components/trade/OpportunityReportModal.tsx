import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Token } from '../../types/token';
import { useTradingStore } from '../../store/useTradingStore';
import { formatUsd, truncateAddress } from '../../utils/formatters';
import { ChainBadge, RiskBadge } from '../common/Badge';
import { providerRegistry } from '../../providers/providerRegistry';
import { DeveloperProfile } from '../../types/developer';
import { RugRiskAudit } from '../../types/risk';
import { WalletCluster } from '../../types/wallet';
import { calculateUpsideScenarios } from '../../utils/math';

export const OpportunityReportModal: React.FC<{ token: Token }> = ({ token }) => {
  const { closeOpportunityReport, openTradeSetup } = useTradingStore();

  const [devProfile, setDevProfile] = useState<DeveloperProfile | null>(null);
  const [rugAudit, setRugAudit] = useState<RugRiskAudit | null>(null);
  const [clusters, setClusters] = useState<WalletCluster[]>([]);

  useEffect(() => {
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
        console.warn('Failed to load opportunity report live intelligence:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [token.address, token.creatorAddress, token.chain]);

  const primaryCluster = clusters[0];
  const scenarios = calculateUpsideScenarios(token);
  const scenario5x = scenarios.find((s) => s.multiple === '5X');
  const scenario10x = scenarios.find((s) => s.multiple === '10X');

  const riskLevel =
    token.riskScore >= 75
      ? 'CRITICAL RISK'
      : token.riskScore >= 50
      ? 'HIGH RISK'
      : token.riskScore >= 30
      ? 'WATCH'
      : 'LOW CONCERN';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm overflow-hidden animate-fade-in">
      {/* Tap backdrop to close */}
      <div className="fixed inset-0" onClick={closeOpportunityReport} />

      <div className="relative z-10 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-zinc-700/80 w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl rounded-t-2xl sm:rounded-xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700/60 flex items-center justify-center text-slate-800 dark:text-zinc-200 font-mono font-semibold text-xs shrink-0">
              {token.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                  OPPORTUNITY &amp; RISK REPORT
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono font-medium">
                  REPORT FIRST
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 hidden sm:block">
                Investigative due diligence generated autonomously. Entry requires explicit human signoff.
              </p>
            </div>
          </div>
          <button
            onClick={closeOpportunityReport}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 font-mono text-xs text-slate-700 dark:text-zinc-200">
          {/* Section: Core Identity */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div>
              <span className="text-slate-400 dark:text-zinc-400 block text-[10px] sm:text-[11px]">TOKEN</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">${token.symbol}</span>
              <span className="text-slate-400 dark:text-zinc-400 block text-[10px] truncate">{token.name}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-400 block text-[10px] sm:text-[11px]">CHAIN</span>
              <div className="mt-1">
                <ChainBadge chain={token.chain} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-400 block text-[10px] sm:text-[11px]">POOL AGE</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">{token.ageHours} hours</span>
              <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">&lt; 30-day index</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-400 block text-[10px] sm:text-[11px]">PRICE</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">{formatUsd(token.priceUsd, 6)}</span>
            </div>
          </div>

          {/* Section: Market & Liquidity Structure */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-zinc-800/80">
              <span className="text-slate-400 dark:text-zinc-400 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">MARKET CAP</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{formatUsd(token.marketCap)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-zinc-800/80">
              <span className="text-slate-400 dark:text-zinc-400 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">LIQUIDITY</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{formatUsd(token.liquidity)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-zinc-800/80">
              <span className="text-slate-400 dark:text-zinc-400 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">24H VOLUME</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{formatUsd(token.volume24h)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-zinc-800/80">
              <span className="text-slate-400 dark:text-zinc-400 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">HOLDERS</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{token.holdersCount.toLocaleString()}</div>
            </div>
          </div>

          {/* Section: Risk Assessment */}
          <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 sm:p-4 rounded-md border border-slate-200 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-semibold text-slate-900 dark:text-zinc-100">ON-CHAIN INTEGRITY AUDIT</span>
              </div>
              <RiskBadge level={riskLevel} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
              <div className="space-y-1">
                <div className="text-slate-400 dark:text-zinc-400">Mint Authority:</div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">
                  {token.chain === 'solana'
                    ? (rugAudit?.solana?.mintAuthority === 'revoked' ? 'Permanently Revoked' : 'Active (Unrevoked)')
                    : (rugAudit?.evm?.ownershipRenounced ? 'Ownership Renounced' : 'Active Owner')}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 dark:text-zinc-400">Freeze Authority:</div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">
                  {token.chain === 'solana'
                    ? (rugAudit?.solana?.freezeAuthority === 'revoked' ? 'Permanently Revoked' : 'Active (Can Freeze)')
                    : 'Standard Transfer'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 dark:text-zinc-400">LP Security:</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {token.chain === 'solana'
                    ? `${rugAudit?.solana?.lpBurnedPercent || 100}% LP Burned`
                    : `${rugAudit?.evm?.lpLockedPercent || 100}% LP Locked`}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 dark:text-zinc-400">Top 10 Holder Share:</div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">
                  {rugAudit?.solana?.top10HoldersPercent || rugAudit?.evm?.top10HoldersPercent || 18}% of supply
                </div>
              </div>
            </div>
          </div>

          {/* Section: Deployer Intelligence */}
          {devProfile && (
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 sm:p-4 rounded-md border border-slate-200 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">DEPLOYER REPUTATION</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">{truncateAddress(devProfile.walletAddress, 6)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">TOTAL LAUNCHES</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{devProfile.totalLaunches}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">SUCCESSFUL</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{devProfile.successfulLaunches}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">ABANDONED</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{devProfile.abandonedLaunches}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">LP REMOVALS</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{devProfile.liquidityRemovalEvents}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Coordinated Cluster Intelligence */}
          {primaryCluster && (
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 sm:p-4 rounded-md border border-slate-200 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">{primaryCluster.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">{primaryCluster.walletCount} Linked Wallets</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">COMBINED POSITION</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{formatUsd(primaryCluster.combinedPositionUsd)}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">DETECTION CONFIDENCE</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">{primaryCluster.confidence} Confidence</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px]">COMMON FUNDING</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {primaryCluster.commonFundingSourceDetected ? 'Detected' : 'None Detected'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Upside Scenarios */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-900 dark:text-zinc-100 block">UPSIDE TARGET MILESTONES</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scenario5x && (
                <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-zinc-100">
                    <span className="text-emerald-600 dark:text-emerald-400">5X SCENARIO</span>
                    <span>{formatUsd(scenario5x.targetMcap)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Target: {formatUsd(scenario5x.targetPrice, 6)} • Req Liq: {formatUsd(scenario5x.requiredLiquidity)}
                  </p>
                </div>
              )}
              {scenario10x && (
                <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-zinc-100">
                    <span className="text-sky-600 dark:text-sky-400">10X SCENARIO</span>
                    <span>{formatUsd(scenario10x.targetMcap)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Target: {formatUsd(scenario10x.targetPrice, 6)} • Req Liq: {formatUsd(scenario10x.requiredLiquidity)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer (Sticky on Mobile) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/90 flex items-center justify-between gap-3 font-mono text-xs shrink-0">
          <button
            onClick={closeOpportunityReport}
            className="py-2 px-3 sm:px-4 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700/60 transition font-medium min-h-[40px]"
          >
            IGNORE
          </button>

          <button
            onClick={() => openTradeSetup(token)}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-semibold transition flex items-center justify-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <span>CONFIGURE SETUP &amp; BUY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
