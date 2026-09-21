import React from 'react';
import { Users, AlertTriangle, ExternalLink } from 'lucide-react';
import { DEMO_DEVELOPER_PROFILES } from '../providers/demoDataProvider';
import { formatUsd, getExplorerUrl } from '../utils/formatters';
import { ChainBadge, RiskBadge } from '../components/common/Badge';
import { useTradingStore } from '../store/useTradingStore';

export const DevelopersPage: React.FC = () => {
  const { tokens, setSelectedToken, setActiveNav } = useTradingStore();
  const profiles = Object.values(DEMO_DEVELOPER_PROFILES);

  const handleInspect = (creatorAddress: string) => {
    const token = tokens.find((t) => t.creatorAddress.toLowerCase() === creatorAddress.toLowerCase());
    if (token) {
      setSelectedToken(token);
      setActiveNav('TOKEN_DETAIL');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090a0f] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-semibold text-sm text-zinc-100 uppercase tracking-wide">
                DEPLOYER / CREATOR INTELLIGENCE HUB
              </h2>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Tracking deployer wallets, repeat launch cycles, liquidity withdrawals, and token dumping.
              </p>
            </div>
          </div>
          <span className="text-zinc-500 font-medium">{profiles.length} Deployers Indexed</span>
        </div>

        <div className="space-y-4">
          {profiles.map((dev) => (
            <div key={dev.walletAddress} className="terminal-card p-5 space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-100 font-semibold text-sm">{dev.walletAddress}</span>
                    <a
                      href={getExplorerUrl(dev.walletAddress, dev.chain, 'address')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-sky-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <ChainBadge chain={dev.chain} />
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-1">
                    Wallet Age: {dev.walletAgeDays} days • Total Launches: {dev.totalLaunches}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge level={dev.riskLevel} size="md" />
                  <button
                    onClick={() => handleInspect(dev.walletAddress)}
                    className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium border border-zinc-700/60 transition shadow-sm"
                  >
                    Inspect Current Token
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-zinc-950/70 p-2.5 rounded-md border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">HISTORICAL LAUNCHES</span>
                  <div className="font-semibold text-zinc-100 text-sm mt-0.5">{dev.observedPreviousLaunches}</div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-md border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">SUCCESSFUL</span>
                  <div className="font-semibold text-emerald-400 text-sm mt-0.5">{dev.successfulLaunches}</div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-md border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">ABANDONED</span>
                  <div className="font-semibold text-amber-400 text-sm mt-0.5">{dev.abandonedLaunches}</div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-md border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">LP REMOVAL EVENTS</span>
                  <div className="font-semibold text-rose-400 text-sm mt-0.5">{dev.liquidityRemovalEvents}</div>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="bg-zinc-950/80 p-3 rounded-md border border-zinc-800 space-y-1">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Observed Risk Factors:
                </span>
                {dev.riskReasons.map((reason, idx) => (
                  <div key={idx} className="text-zinc-300 text-[11px] pl-3 list-item">
                    {reason}
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div>
                <span className="font-semibold text-zinc-300 block mb-2">Previous Token Launch History:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dev.launchTimeline.map((lt, idx) => (
                    <div key={idx} className="bg-zinc-950/70 p-3 rounded-md border border-zinc-800 text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-zinc-100">${lt.tokenSymbol}</span>
                        <span className="text-zinc-500 ml-1">({lt.tokenName})</span>
                        <div className="text-zinc-400 text-[10px] mt-0.5">Peak Mcap: {formatUsd(lt.peakMcap)}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${lt.status === 'successful' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                          {lt.status.toUpperCase()}
                        </span>
                        {lt.liquidityRemoved && (
                          <div className="text-rose-400 font-semibold text-[10px] mt-1">
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
