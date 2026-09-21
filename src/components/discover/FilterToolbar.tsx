import React from 'react';
import { Search, Flame, Sparkles, AlertTriangle, Users, Eye, SlidersHorizontal } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { TokenTag } from '../../types/token';

export const FilterToolbar: React.FC = () => {
  const { filter, setFilter } = useTradingStore();

  const categories: { id: TokenTag | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'ALL TOKENS', icon: Sparkles },
    { id: 'new', label: 'NEW TOKENS', icon: Sparkles },
    { id: 'hot', label: 'HOT TOKENS', icon: Flame },
    { id: 'smart_money', label: 'SMART MONEY', icon: Users },
    { id: 'dev_alert', label: 'DEVELOPER ALERTS', icon: AlertTriangle },
    { id: 'high_risk', label: 'HIGH RISK', icon: AlertTriangle },
    { id: 'watchlist', label: 'WATCHLIST', icon: Eye },
  ];

  return (
    <div className="bg-[#0d1322] border-b border-slate-800 p-3 space-y-3">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = (filter.tag || 'all') === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter({ tag: cat.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Sliders Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, symbol, or contract address..."
            value={filter.searchQuery || ''}
            onChange={(e) => setFilter({ searchQuery: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filters: Liquidity & Chain */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Min Liq:</span>
            <select
              value={filter.minLiquidity}
              onChange={(e) => setFilter({ minLiquidity: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="0">Any</option>
              <option value="10000">$10K+</option>
              <option value="50000">$50K+</option>
              <option value="100000">$100K+</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Max Age:</span>
            <select
              value={filter.maxAgeHours}
              onChange={(e) => setFilter({ maxAgeHours: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="24">&lt; 24 Hours</option>
              <option value="72">&lt; 3 Days</option>
              <option value="168">&lt; 7 Days</option>
              <option value="720">&lt; 30 Days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
