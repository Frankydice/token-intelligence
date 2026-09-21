import React from 'react';
import { X, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Token } from '../../types/token';
import { useTradingStore } from '../../store/useTradingStore';
import { formatUsd, truncateAddress } from '../../utils/formatters';
import { ChainBadge, OpportunityBadge, RiskBadge } from '../common/Badge';
import { DEMO_DEVELOPER_PROFILES, DEMO_WALLET_CLUSTERS, DEMO_RUG_RISKS } from '../../providers/demoDataProvider';
import { calculateUpsideScenarios } from '../../utils/math';

export const OpportunityReportModal: React.FC<{ token: Token }> = ({ token }) => {
  const { closeOpportunityReport, openTradeSetup } = useTradingStore();

  const devProfile = DEMO_DEVELOPER_PROFILES[token.creatorAddress];
  const clusters = DEMO_WALLET_CLUSTERS[token.address] || [];
  const primaryCluster = clusters[0];
  const rugAudit = DEMO_RUG_RISKS[token.address];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="terminal-card bg-[#0d1322] border border-cyan-500/40 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold">
              {token.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-100 text-base">
                  TOKEN ALERT OPPORTUNITY REPORT
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-semibold border border-cyan-500/20">
                  REPORT FIRST
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Investigative breakdown generated autonomously. Final trade entry requires human approval.
              </p>
            </div>
          </div>
          <button
            onClick={closeOpportunityReport}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 font-mono text-xs text-slate-200">
          {/* Section: Core Identity */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">TOKEN</span>
              <span className="font-bold text-sm text-white">${token.symbol}</span>
              <span className="text-slate-400 block text-[10px]">{token.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">CHAIN</span>
              <div className="mt-1">
                <ChainBadge chain={token.chain} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">AGE</span>
              <span className="font-bold text-sm text-cyan-300">{token.ageHours} hours</span>
              <span className="text-slate-400 block text-[10px]">&lt; 30-day index</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">CURRENT PRICE</span>
              <span className="font-bold text-sm text-white">{formatUsd(token.priceUsd, 6)}</span>
            </div>
          </div>

          {/* Section: Market & Liquidity Structure */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">MARKET CAP</span>
              <div className="font-bold text-slate-100 mt-0.5">{formatUsd(token.marketCap)}</div>
            </div>
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">LIQUIDITY</span>
              <div className="font-bold text-cyan-300 mt-0.5">{formatUsd(token.liquidity)}</div>
            </div>
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">24H VOLUME</span>
              <div className="font-bold text-slate-100 mt-0.5">{formatUsd(token.volume24h)}</div>
            </div>
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">HOLDERS</span>
              <div className="font-bold text-slate-100 mt-0.5">{token.holdersCount.toLocaleString()}</div>
            </div>
          </div>

          {/* Section: Scores & Ratings */}
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">OPPORTUNITY RATING:</span>
              <OpportunityBadge score={token.opportunityScore} size="md" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">STRUCTURAL RISK:</span>
              <RiskBadge level={riskLevel} size="md" />
            </div>
          </div>

          {/* Section: Developer Intelligence */}
          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                DEPLOYER / CREATOR INTELLIGENCE
              </span>
              <span className="text-slate-400 font-normal">{truncateAddress(token.creatorAddress, 6)}</span>
            </div>

            {devProfile ? (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 py-1">
                  <div>Previous Launches: <span className="font-bold text-white">{devProfile.observedPreviousLaunches}</span></div>
                  <div>Successful: <span className="font-bold text-emerald-400">{devProfile.successfulLaunches}</span></div>
                  <div>Abandoned: <span className="font-bold text-amber-400">{devProfile.abandonedLaunches}</span></div>
                  <div>LP Removals: <span className="font-bold text-rose-400">{devProfile.liquidityRemovalEvents}</span></div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 space-y-1">
                  <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Key Risk Indicators:
                  </div>
                  {devProfile.riskReasons.map((r, i) => (
                    <div key={i} className="text-slate-300 text-[11px] pl-4 list-item">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No prior deployment records indexed within 30-day scan history.</p>
            )}
          </div>

          {/* Section: Wallet Cluster / Smart Money */}
          {primaryCluster && (
            <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
                <span>COORDINATED WALLET ACTIVITY</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {primaryCluster.confidence} Confidence
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                {primaryCluster.evidenceSummary}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>Cluster Size: <strong className="text-white">{primaryCluster.walletCount} wallets</strong></span>
                <span>Time Window: <strong className="text-white">{primaryCluster.windowSeconds}s</strong></span>
                <span>Combined Buy: <strong className="text-emerald-400">{formatUsd(primaryCluster.combinedPositionUsd)}</strong></span>
              </div>
            </div>
          )}

          {/* Section: 5X & 10X Upside Scenarios */}
          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="text-slate-300 font-bold border-b border-slate-800 pb-2">
              UPSIDE &amp; DOWNSIDE SCENARIO MODELING (NOT GUARANTEED)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {scenario5x && (
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span>5X SCENARIO</span>
                    <span>{formatUsd(scenario5x.targetMcap)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Target Price: {formatUsd(scenario5x.targetPrice, 6)} • Required Liq: {formatUsd(scenario5x.requiredLiquidity)}
                  </p>
                </div>
              )}
              {scenario10x && (
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span>10X SCENARIO</span>
                    <span>{formatUsd(scenario10x.targetMcap)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Target Price: {formatUsd(scenario10x.targetPrice, 6)} • Required Liq: {formatUsd(scenario10x.requiredLiquidity)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Key Rug Risk Audit Evidence */}
          {rugAudit && (
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5 text-[11px]">
              <div className="font-bold text-slate-300">OBSERVED EVIDENCE CHAIN:</div>
              {rugAudit.facts.slice(0, 2).map((f) => (
                <div key={f.id} className="text-slate-300">
                  <span className="text-cyan-400 font-bold">[FACT]: </span>
                  {f.description}
                </div>
              ))}
              {rugAudit.indicators.slice(0, 1).map((ind) => (
                <div key={ind.id} className="text-slate-400">
                  <span className="text-amber-400 font-bold">[INDICATOR]: </span>
                  {ind.description}
                </div>
              ))}
              {rugAudit.inferences.slice(0, 1).map((inf) => (
                <div key={inf.id} className="text-slate-400 italic">
                  <span className="text-indigo-400 font-bold">[INFERENCE]: </span>
                  {inf.description}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-xl flex items-center justify-between gap-4 font-mono text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>HUMAN APPROVAL REQUIRED BEFORE ANY ORDER</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeOpportunityReport}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              IGNORE
            </button>

            <button
              onClick={() => openTradeSetup(token)}
              className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>BUY (CONFIGURE SETUP)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
