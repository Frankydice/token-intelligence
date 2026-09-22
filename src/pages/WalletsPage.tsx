import React, { useState, useEffect } from 'react';
import { Network, Users, ExternalLink } from 'lucide-react';
import { formatUsd, truncateAddress, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';
import { useTradingStore } from '../store/useTradingStore';
import { providerRegistry } from '../providers/providerRegistry';
import { WalletCluster } from '../types/wallet';

export const WalletsPage: React.FC = () => {
  const { tokens, isScanning, refreshTokens } = useTradingStore();
  const [allClusters, setAllClusters] = useState<WalletCluster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <Network className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                WALLET CLUSTER &amp; COORDINATION TRACKER
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Detecting co-entry windows, common funding origins, and repeatable on-chain wallet networks.
              </p>
            </div>
          </div>
          <span className="text-[var(--text-muted)] font-medium">{allClusters.length} Active Clusters Detected</span>
        </div>

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
          <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-zinc-800 border border-[var(--card-border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-semibold text-[var(--text-primary)]">
              {isLoading || isScanning ? 'Auditing Order Flow for Wallet Clusters...' : 'No Coordinated Clusters Detected'}
            </h3>
            <p className="font-mono text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Listening to sub-second swap streams to detect sniper rings, coordinated entry blocks, and shared funding origins.
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
