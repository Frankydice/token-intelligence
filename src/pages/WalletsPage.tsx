import React from 'react';
import { Network, Users, ExternalLink } from 'lucide-react';
import { DEMO_WALLET_CLUSTERS } from '../providers/demoDataProvider';
import { formatUsd, truncateAddress, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const WalletsPage: React.FC = () => {
  const allClusters = Object.values(DEMO_WALLET_CLUSTERS).flat();

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090a0f] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Network className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-semibold text-sm text-zinc-100 uppercase tracking-wide">
                WALLET CLUSTER &amp; COORDINATION TRACKER
              </h2>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Detecting co-entry windows, common funding origins, and repeatable on-chain wallet networks.
              </p>
            </div>
          </div>
          <span className="text-zinc-500 font-medium">{allClusters.length} Active Clusters Detected</span>
        </div>

        <div className="space-y-4">
          {allClusters.map((cluster) => (
            <div key={cluster.id} className="terminal-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-sky-400">{cluster.label}</span>
                    <ChainBadge chain={cluster.chain} />
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[10px] font-semibold">
                      {cluster.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs mt-1">{cluster.evidenceSummary}</p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px] block uppercase tracking-wider font-medium">CLUSTER SIZE</span>
                    <span className="font-semibold text-zinc-100 text-sm mt-0.5">{cluster.walletCount} Wallets</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block uppercase tracking-wider font-medium">TIME WINDOW</span>
                    <span className="font-semibold text-amber-400 text-sm mt-0.5">{cluster.windowSeconds}s</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block uppercase tracking-wider font-medium">COMBINED ENTRY</span>
                    <span className="font-semibold text-emerald-400 text-sm mt-0.5">{formatUsd(cluster.combinedPositionUsd)}</span>
                  </div>
                </div>
              </div>

              {cluster.commonFundingSourceDetected && (
                <div className="bg-zinc-950/70 p-3 rounded-md border border-zinc-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Common Dispenser / Funder Detected:</span>
                    <span className="font-semibold text-zinc-100">{cluster.commonFundingSourceAddress}</span>
                  </div>
                  <span className="text-amber-400 font-semibold">Funded 30m prior to LP launch</span>
                </div>
              )}

              {/* Members Table */}
              <div>
                <span className="font-semibold text-zinc-300 block mb-2">Cluster Wallet Members:</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                        <th className="py-2 px-3 font-medium">WALLET ADDRESS</th>
                        <th className="py-2 px-3 font-medium">ENTRY AMOUNT</th>
                        <th className="py-2 px-3 font-medium">FUNDING ORIGIN</th>
                        <th className="py-2 px-3 font-medium">HISTORICAL OVERLAP</th>
                        <th className="py-2 px-3 font-medium">TX HASH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                      {cluster.members.map((m, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/40">
                          <td className="py-2.5 px-3 font-semibold text-zinc-100">
                            {truncateAddress(m.walletAddress, 6)}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                            {formatUsd(m.amountUsd)}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">
                            {m.fundingSourceName || 'Direct'}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">
                            {m.historicalTokensTogether} tokens together
                          </td>
                          <td className="py-2.5 px-3 text-zinc-500">
                            <a
                              href={getExplorerUrl(m.entryTxHash, cluster.chain, 'tx')}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-sky-400 flex items-center gap-1 transition"
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
      </div>
    </div>
  );
};
