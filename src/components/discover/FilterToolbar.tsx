import React from 'react';
import { Search, Flame, Sparkles, AlertTriangle, Users, Eye, SlidersHorizontal } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { TokenTag } from '../../types/token';

export const FilterToolbar: React.FC = () => {
  const { filter, setFilter } = useTradingStore();

  const categories: { id: TokenTag | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'ALL TOKENS', icon: Sparkles },
    { id: 'new', label: 'NEW LAUNCHES', icon: Sparkles },
    { id: 'hot', label: 'HIGH MOMENTUM', icon: Flame },
    { id: 'cluster_buying', label: '🐳 CLUSTER BUYING', icon: Users },
    { id: 'urgent_dump', label: '🚨 URGENT DUMPS', icon: AlertTriangle },
    { id: 'smart_money', label: 'SMART MONEY', icon: Users },
    { id: 'dev_alert', label: 'DEV ALERTS', icon: AlertTriangle },
    { id: 'high_risk', label: 'HIGH RISK', icon: AlertTriangle },
    { id: 'watchlist', label: 'WATCHLIST', icon: Eye },
  ];

  return (
    <div className="bg-white dark:bg-[#0c0e14] border-b border-slate-200 dark:border-zinc-800/80 p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 transition-colors">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = (filter.tag || 'all') === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter({ tag: cat.id })}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-sm border border-slate-900 dark:border-zinc-700'
                  : 'bg-slate-100 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Sliders Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs font-mono">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, symbol, or address..."
            value={filter.searchQuery || ''}
            onChange={(e) => setFilter({ searchQuery: e.target.value })}
            className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 transition"
          />
        </div>

        {/* Filters: Liquidity & Age */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span className="hidden sm:inline">Min Liq:</span>
            <select
              value={filter.minLiquidity}
              onChange={(e) => setFilter({ minLiquidity: Number(e.target.value) })}
              className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="0">Any Liq</option>
              <option value="10000">$10K+</option>
              <option value="50000">$50K+</option>
              <option value="100000">$100K+</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Max Age:</span>
            <select
              value={filter.maxAgeHours}
              onChange={(e) => setFilter({ maxAgeHours: Number(e.target.value) })}
              className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="24">&lt; 24h</option>
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
