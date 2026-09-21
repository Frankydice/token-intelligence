import React from 'react';
import { FilterToolbar } from '../components/discover/FilterToolbar';
import { TokenCard } from '../components/discover/TokenCard';
import { useTradingStore } from '../store/useTradingStore';
import { Sparkles } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const { filteredTokens, isScanning, refreshTokens } = useTradingStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
      {/* Filters Toolbar */}
      <FilterToolbar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider">
                DISCOVERED TOKENS ({filteredTokens.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Tokens created within last 30 days • Continuously audited
            </span>
          </div>

          {/* Tokens Grid */}
          {filteredTokens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          ) : (
            <div className="terminal-card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-mono font-bold text-slate-200">No Tokens Match Active Filters</h3>
              <p className="font-mono text-xs text-slate-400 max-w-md mx-auto">
                Try loosening your filter parameters or resetting your search query to inspect newly created DEX pairs.
              </p>
              <button
                onClick={() => refreshTokens()}
                disabled={isScanning}
                className="px-4 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold hover:bg-cyan-500/30 transition"
              >
                {isScanning ? 'Scanning DEX Pools...' : 'Refresh Token Discovery Feed'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
