import React from 'react';
import { Network, Users, ExternalLink } from 'lucide-react';
import { DEMO_WALLET_CLUSTERS } from '../providers/demoDataProvider';
import { formatUsd, truncateAddress, getExplorerUrl } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const WalletsPage: React.FC = () => {
  const allClusters = Object.values(DEMO_WALLET_CLUSTERS).flat();

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090d16] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                WALLET CLUSTER &amp; COORDINATION TRACKER
              </h2>
              <p className="text-slate-400 text-[11px]">
                Detecting co-entry windows, common funding origins, and repeatable on-chain wallet networks.
              </p>
            </div>
          </div>
          <span className="text-slate-400">{allClusters.length} Active Clusters Detected</span>
        </div>

        <div className="space-y-4">
          {allClusters.map((cluster) => (
            <div key={cluster.id} className="terminal-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-cyan-300">{cluster.label}</span>
                    <ChainBadge chain={cluster.chain} />
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                      {cluster.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{cluster.evidenceSummary}</p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">CLUSTER SIZE</span>
                    <span className="font-bold text-white text-sm">{cluster.walletCount} Wallets</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">TIME WINDOW</span>
                    <span className="font-bold text-amber-300 text-sm">{cluster.windowSeconds}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">COMBINED ENTRY</span>
                    <span className="font-bold text-emerald-400 text-sm">{formatUsd(cluster.combinedPositionUsd)}</span>
                  </div>
                </div>
              </div>

              {cluster.commonFundingSourceDetected && (
                <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Common Dispenser / Funder Detected:</span>
                    <span className="font-bold text-white">{cluster.commonFundingSourceAddress}</span>
                  </div>
                  <span className="text-amber-300 font-bold">Funded 30m prior to LP launch</span>
                </div>
              )}

              {/* Members Table */}
              <div>
                <span className="font-bold text-slate-300 block mb-2">Cluster Wallet Members:</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                        <th className="py-2 px-3">WALLET ADDRESS</th>
                        <th className="py-2 px-3">ENTRY AMOUNT</th>
                        <th className="py-2 px-3">FUNDING ORIGIN</th>
                        <th className="py-2 px-3">HISTORICAL OVERLAP</th>
                        <th className="py-2 px-3">TX HASH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {cluster.members.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {truncateAddress(m.walletAddress, 6)}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">
                            {formatUsd(m.amountUsd)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {m.fundingSourceName || 'Direct'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {m.historicalTokensTogether} tokens together
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            <a
                              href={getExplorerUrl(m.entryTxHash, cluster.chain, 'tx')}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-cyan-400 flex items-center gap-1"
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
