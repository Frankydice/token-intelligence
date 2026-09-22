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
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                IMMUTABLE AUDIT TRAIL ({auditLogs.length} EVENTS)
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Cryptographically tracked lifecycle: discovery, risk score, human approval, trigger, and exit execution.
              </p>
            </div>
          </div>

          {/* Search & Actor Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md pl-8 pr-3 py-1.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="flex items-center bg-black/5 dark:bg-zinc-900 border border-[var(--card-border)] rounded-lg p-0.5">
              {(['all', 'HUMAN_USER', 'BOT_AUTONOMOUS'] as const).map((act) => (
                <button
                  key={act}
                  onClick={() => setFilterActor(act)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    filterActor === act
                      ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {act === 'all' ? 'ALL' : act === 'HUMAN_USER' ? 'HUMAN' : 'BOT'}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] transition flex items-center gap-1.5 font-medium shadow-sm"
              title="Export all audit logs to JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
          </div>
        </div>

        {/* Logs Container: Mobile Cards (< 640px) and Desktop Table (>= 640px) */}
        <div>
          {/* Mobile Card List */}
          <div className="block sm:hidden space-y-2.5">
            {filteredLogs.map((entry) => (
              <div key={entry.id} className="terminal-card p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--text-muted)]">{formatTimeAgo(entry.timestamp)}</span>
                  {entry.actor === 'HUMAN_USER' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <User className="w-3 h-3" />
                      HUMAN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      <Bot className="w-3 h-3" />
                      BOT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[var(--text-primary)]">{entry.action}</span>
                  {entry.tokenSymbol && (
                    <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">${entry.tokenSymbol}</span>
                  )}
                </div>

                <div className="text-[11px] text-[var(--text-primary)] font-medium">{entry.summary}</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-relaxed">{entry.details}</div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block terminal-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider bg-black/5 dark:bg-zinc-950/70">
                    <th className="py-2.5 px-3 font-medium">TIMESTAMP</th>
                    <th className="py-2.5 px-3 font-medium">ACTOR</th>
                    <th className="py-2.5 px-3 font-medium">ACTION TYPE</th>
                    <th className="py-2.5 px-3 font-medium">TOKEN</th>
                    <th className="py-2.5 px-3 font-medium">SUMMARY &amp; DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-[var(--text-primary)]">
                  {filteredLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-black/5 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-3 text-[var(--text-muted)] text-[11px] whitespace-nowrap">
                        {formatTimeAgo(entry.timestamp)}
                      </td>
                      <td className="py-3 px-3">
                        {entry.actor === 'HUMAN_USER' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <User className="w-3 h-3" />
                            HUMAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                            <Bot className="w-3 h-3" />
                            BOT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-[var(--text-primary)] text-[11px] whitespace-nowrap">
                        {entry.action}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {entry.tokenSymbol ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[var(--text-primary)]">${entry.tokenSymbol}</span>
                            {entry.chain && <ChainBadge chain={entry.chain} />}
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">SYSTEM</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--text-primary)] text-xs">{entry.summary}</div>
                        <div className="text-[var(--text-muted)] text-[11px] mt-0.5">{entry.details}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
