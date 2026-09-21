import React from 'react';
import { Users, AlertTriangle, ExternalLink } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { DEMO_DEVELOPER_PROFILES } from '../providers/demoDataProvider';
import { RiskBadge, ChainBadge } from '../components/common/Badge';
import { formatUsd, getExplorerUrl } from '../utils/formatters';

export const DevelopersPage: React.FC = () => {
  const { setSelectedToken, setActiveNav, tokens } = useTradingStore();

  const profiles = Object.values(DEMO_DEVELOPER_PROFILES);

  const handleInspect = (creatorAddress: string) => {
    const token = tokens.find((t) => t.creatorAddress.toLowerCase() === creatorAddress.toLowerCase());
    if (token) {
      setSelectedToken(token);
      setActiveNav('TOKEN_DETAIL');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090d16] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                DEPLOYER / CREATOR INTELLIGENCE HUB
              </h2>
              <p className="text-slate-400 text-[11px]">
                Tracking deployer wallets, repeat launch cycles, liquidity withdrawals, and token dumping.
              </p>
            </div>
          </div>
          <span className="text-slate-400">{profiles.length} Deployers Indexed</span>
        </div>

        <div className="space-y-4">
          {profiles.map((dev) => (
            <div key={dev.walletAddress} className="terminal-card p-5 space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{dev.walletAddress}</span>
                    <a
                      href={getExplorerUrl(dev.walletAddress, dev.chain, 'address')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-cyan-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <ChainBadge chain={dev.chain} />
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Wallet Age: {dev.walletAgeDays} days • Total Launches: {dev.totalLaunches}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge level={dev.riskLevel} size="md" />
                  <button
                    onClick={() => handleInspect(dev.walletAddress)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 transition"
                  >
                    Inspect Current Token
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px]">HISTORICAL LAUNCHES</span>
                  <div className="font-bold text-white text-sm">{dev.observedPreviousLaunches}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px]">SUCCESSFUL</span>
                  <div className="font-bold text-emerald-400 text-sm">{dev.successfulLaunches}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px]">ABANDONED</span>
                  <div className="font-bold text-amber-400 text-sm">{dev.abandonedLaunches}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px]">LP REMOVAL EVENTS</span>
                  <div className="font-bold text-rose-400 text-sm">{dev.liquidityRemovalEvents}</div>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80 space-y-1">
                <span className="text-amber-300 font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Observed Risk Factors:
                </span>
                {dev.riskReasons.map((reason, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px] pl-3 list-item">
                    {reason}
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div>
                <span className="font-bold text-slate-300 block mb-2">Previous Token Launch History:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dev.launchTimeline.map((lt, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">${lt.tokenSymbol}</span>
                        <span className="text-slate-500 ml-1">({lt.tokenName})</span>
                        <div className="text-slate-400 text-[10px]">Peak Mcap: {formatUsd(lt.peakMcap)}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded font-bold ${lt.status === 'successful' ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'}`}>
                          {lt.status.toUpperCase()}
                        </span>
                        {lt.liquidityRemoved && (
                          <div className="text-rose-400 font-bold text-[10px] mt-0.5">
                            LP Pulled: {formatUsd(lt.liquidityRemovedAmountUsd || 0)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
