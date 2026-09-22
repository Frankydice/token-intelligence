import React from 'react';
import { FilterToolbar } from '../components/discover/FilterToolbar';
import { TokenCard } from '../components/discover/TokenCard';
import { useTradingStore } from '../store/useTradingStore';
import { Sparkles } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const { filteredTokens, isScanning, refreshTokens } = useTradingStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Filters Toolbar */}
      <FilterToolbar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h2 className="font-mono font-semibold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                DISCOVERED TOKENS ({filteredTokens.length})
              </h2>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-zinc-400 font-mono hidden sm:inline">
              Tokens created within last 30 days • Continuously audited
            </span>
          </div>

          {/* Tokens Grid */}
          {filteredTokens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredTokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          ) : isScanning ? (
            <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-sm sm:text-base">
                Scanning Multi-DEX Liquidity Pools...
              </h3>
              <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Querying live liquidity pairs across Solana (pump.fun, Raydium) and BNB Chain (PancakeSwap). Discovered tokens will appear automatically.
              </p>
            </div>
          ) : (
            <div className="terminal-card p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-sm sm:text-base">
                No Tokens Match Active Filters
              </h3>
              <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Try loosening your filter parameters or resetting your search query to inspect newly created DEX pairs.
              </p>
              <button
                onClick={() => refreshTokens()}
                disabled={isScanning}
                className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 border border-slate-900 dark:border-zinc-700 text-xs font-mono font-semibold transition shadow-sm"
              >
                Scan DEX Pools Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
