import React, { useState } from 'react';
import { FileText, Search, User, Bot, Download } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { formatTimeAgo } from '../utils/formatters';
import { ChainBadge } from '../components/common/Badge';

export const AuditPage: React.FC = () => {
  const { auditLogs, exportAuditLogsJson } = useTradingStore();
  const [filterActor, setFilterActor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleExport = () => {
    const json = exportAuditLogsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterActor !== 'all' && log.actor !== filterActor) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.summary.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.tokenSymbol && log.tokenSymbol.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#090a0f] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-semibold text-sm text-zinc-100 uppercase tracking-wide">
                IMMUTABLE AUDIT TRAIL ({auditLogs.length} EVENTS)
              </h2>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Cryptographically tracked lifecycle: discovery, risk score, human approval, trigger, and exit execution.
              </p>
            </div>
          </div>

          {/* Search & Actor Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950/80 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {(['all', 'HUMAN_USER', 'BOT_AUTONOMOUS'] as const).map((act) => (
                <button
                  key={act}
                  onClick={() => setFilterActor(act)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    filterActor === act
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {act === 'all' ? 'ALL' : act === 'HUMAN_USER' ? 'HUMAN' : 'BOT'}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition flex items-center gap-1.5 font-medium shadow-sm"
              title="Export all audit logs to JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="terminal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider bg-zinc-950/70">
                  <th className="py-2.5 px-3 font-medium">TIMESTAMP</th>
                  <th className="py-2.5 px-3 font-medium">ACTOR</th>
                  <th className="py-2.5 px-3 font-medium">ACTION TYPE</th>
                  <th className="py-2.5 px-3 font-medium">TOKEN</th>
                  <th className="py-2.5 px-3 font-medium">SUMMARY &amp; DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-3 text-zinc-500 text-[11px] whitespace-nowrap">
                      {formatTimeAgo(entry.timestamp)}
                    </td>
                    <td className="py-3 px-3">
                      {entry.actor === 'HUMAN_USER' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <User className="w-3 h-3" />
                          HUMAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          <Bot className="w-3 h-3" />
                          BOT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-zinc-300 text-[11px] whitespace-nowrap">
                      {entry.action}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {entry.tokenSymbol ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-100">${entry.tokenSymbol}</span>
                          {entry.chain && <ChainBadge chain={entry.chain} />}
                        </div>
                      ) : (
                        <span className="text-zinc-500">SYSTEM</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-100 text-xs">{entry.summary}</div>
                      <div className="text-zinc-400 text-[11px] mt-0.5">{entry.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
