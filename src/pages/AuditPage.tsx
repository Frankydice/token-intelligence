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
    <div className="flex-1 overflow-y-auto p-4 bg-[#090d16] font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                IMMUTABLE AUDIT TRAIL ({auditLogs.length} EVENTS)
              </h2>
              <p className="text-slate-400 text-[11px]">
                Cryptographically tracked lifecycle: discovery, risk score, human approval, trigger, and exit execution.
              </p>
            </div>
          </div>

          {/* Search & Actor Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              {(['all', 'HUMAN_USER', 'BOT_AUTONOMOUS'] as const).map((act) => (
                <button
                  key={act}
                  onClick={() => setFilterActor(act)}
                  className={`px-2.5 py-1 rounded text-[11px] transition ${
                    filterActor === act
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {act === 'all' ? 'ALL' : act === 'HUMAN_USER' ? 'HUMAN' : 'BOT'}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              title="Export all audit logs to JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="terminal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] bg-slate-950/60">
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">ACTOR</th>
                  <th className="py-2.5 px-3">ACTION TYPE</th>
                  <th className="py-2.5 px-3">TOKEN</th>
                  <th className="py-2.5 px-3">SUMMARY &amp; DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatTimeAgo(entry.timestamp)}
                    </td>
                    <td className="py-3 px-3">
                      {entry.actor === 'HUMAN_USER' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <User className="w-3 h-3" />
                          HUMAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <Bot className="w-3 h-3" />
                          BOT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-300 text-[11px] whitespace-nowrap">
                      {entry.action}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {entry.tokenSymbol ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">${entry.tokenSymbol}</span>
                          {entry.chain && <ChainBadge chain={entry.chain} />}
                        </div>
                      ) : (
                        <span className="text-slate-500">SYSTEM</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs">{entry.summary}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{entry.details}</div>
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
