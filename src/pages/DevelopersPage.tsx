import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatUsd, getExplorerUrl } from '../utils/formatters';
import { ChainBadge, RiskBadge } from '../components/common/Badge';
import { useTradingStore } from '../store/useTradingStore';
import { providerRegistry } from '../providers/providerRegistry';
import { DeveloperProfile } from '../types/developer';

export const DevelopersPage: React.FC = () => {
  const { tokens, setSelectedToken, setActiveNav, isScanning, refreshTokens } = useTradingStore();
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      if (tokens.length === 0) {
        setProfiles([]);
        return;
      }
      setIsLoading(true);

      const seen = new Set<string>();
      const uniqueTokens = tokens.filter((t) => {
        if (!t.creatorAddress || seen.has(t.creatorAddress.toLowerCase())) return false;
        seen.add(t.creatorAddress.toLowerCase());
        return true;
      });

      try {
        const results = await Promise.all(
          uniqueTokens.slice(0, 15).map((t) =>
            providerRegistry.developerAnalysis.analyzeDeveloper(t.creatorAddress, t.chain)
          )
        );
        if (!cancelled) {
          setProfiles(results);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Error loading developer profiles:', err);
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [tokens]);

  const handleInspect = (creatorAddress: string) => {
    const token = tokens.find((t) => t.creatorAddress.toLowerCase() === creatorAddress.toLowerCase());
    if (token) {
      setSelectedToken(token);
      setActiveNav('TOKEN_DETAIL');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                DEPLOYER / CREATOR INTELLIGENCE HUB
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Tracking deployer wallets, repeat launch cycles, liquidity withdrawals, and token dumping.
              </p>
            </div>
          </div>
          <span className="text-[var(--text-muted)] font-medium">{profiles.length} Deployers Indexed</span>
        </div>

        {profiles.length > 0 ? (
          <div className="space-y-4">
            {profiles.map((dev) => (
              <div key={dev.walletAddress} className="terminal-card p-4 sm:p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[var(--text-primary)] font-semibold text-sm">{dev.walletAddress}</span>
                      <a
                        href={getExplorerUrl(dev.walletAddress, dev.chain, 'address')}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--text-muted)] hover:text-sky-500 transition p-0.5"
                        title="View in Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <ChainBadge chain={dev.chain} />
                    </div>
                    <div className="text-[var(--text-muted)] text-[11px] mt-1">
                      Wallet Age: {dev.walletAgeDays} days • Total Launches: {dev.totalLaunches}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <RiskBadge level={dev.riskLevel} size="md" />
                    <button
                      onClick={() => handleInspect(dev.walletAddress)}
                      className="px-3 py-1.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/30 transition shadow-sm text-xs"
                    >
                      Inspect Token
                    </button>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">HISTORICAL LAUNCHES</span>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mt-0.5">{dev.observedPreviousLaunches}</div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">SUCCESSFUL</span>
                    <div className="font-semibold text-emerald-500 dark:text-emerald-400 text-sm mt-0.5">{dev.successfulLaunches}</div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">ABANDONED</span>
                    <div className="font-semibold text-amber-500 dark:text-amber-400 text-sm mt-0.5">{dev.abandonedLaunches}</div>
                  </div>
                  <div className="bg-black/5 dark:bg-zinc-950/70 p-2.5 rounded-md border border-[var(--card-border)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">LP REMOVAL EVENTS</span>
                    <div className="font-semibold text-rose-500 dark:text-rose-400 text-sm mt-0.5">{dev.liquidityRemovalEvents}</div>
                  </div>
                </div>

                {/* Key Indicators */}
                <div className="bg-black/5 dark:bg-zinc-950/80 p-3 rounded-md border border-[var(--card-border)] space-y-1">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Observed Risk Factors:
                  </span>
                  {dev.riskReasons.map((reason, idx) => (
                    <div key={idx} className="text-[var(--text-primary)] text-[11px] pl-3 list-item">
                      {reason}
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <span className="font-semibold text-[var(--text-primary)] block mb-2">Previous Token Launch History:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {dev.launchTimeline.map((lt, idx) => (
                      <div key={idx} className="bg-black/5 dark:bg-zinc-950/70 p-3 rounded-md border border-[var(--card-border)] text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-[var(--text-primary)]">${lt.tokenSymbol}</span>
                          <span className="text-[var(--text-muted)] ml-1">({lt.tokenName})</span>
                          <div className="text-[var(--text-muted)] text-[10px] mt-0.5">Peak Mcap: {formatUsd(lt.peakMcap)}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${lt.status === 'successful' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border border-rose-500/20'}`}>
                            {lt.status.toUpperCase()}
                          </span>
                          {lt.liquidityRemoved && (
                            <div className="text-rose-500 dark:text-rose-400 font-semibold text-[10px] mt-1">
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
        ) : (
          <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-zinc-800 border border-[var(--card-border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-semibold text-[var(--text-primary)]">
              {isLoading || isScanning ? 'Indexing Discovered Token Deployers...' : 'No Deployers Indexed Yet'}
            </h3>
            <p className="font-mono text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Scanning real-time DEX liquidity pools to extract creator addresses, previous launch counts, and liquidity withdrawal audits.
            </p>
            <button
              onClick={() => refreshTokens()}
              disabled={isScanning}
              className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-semibold transition"
            >
              {isScanning ? 'Scanning DEX Pools...' : 'Scan For Tokens Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
