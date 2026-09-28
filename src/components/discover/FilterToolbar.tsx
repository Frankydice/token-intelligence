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
      {/* Network Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 border-b border-slate-100 dark:border-zinc-800/60 pb-2">
        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono uppercase tracking-wider font-semibold mr-1 shrink-0">
          NETWORK:
        </span>
        {(['all', 'solana', 'bsc', 'robinhood'] as const).map((ch) => {
          const isSelected = (filter.chain || 'all') === ch;
          return (
            <button
              key={ch}
              onClick={() => setFilter({ chain: ch })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition whitespace-nowrap shrink-0 ${
                isSelected
                  ? ch === 'robinhood'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 font-semibold shadow-sm'
                    : 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-sm border border-slate-900 dark:border-zinc-700'
                  : 'bg-slate-100 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  ch === 'solana'
                    ? 'bg-[#14f195]'
                    : ch === 'bsc'
                    ? 'bg-[#f59e0b]'
                    : ch === 'robinhood'
                    ? 'bg-[#00c805] animate-pulse'
                    : 'bg-sky-400'
                }`}
              />
              <span>
                {ch === 'all'
                  ? 'ALL NETWORKS'
                  : ch === 'solana'
                  ? 'SOLANA'
                  : ch === 'bsc'
                  ? 'BNB CHAIN'
                  : 'ROBINHOOD L2'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Memecoin Playbook 3-Tier Lifecycle Tabs (Chapters 5, 8, 11, 13) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 border-b border-slate-100 dark:border-zinc-800/60 pb-2">
        <span className="text-[10px] text-amber-500 dark:text-amber-400 font-mono uppercase tracking-wider font-semibold mr-1 shrink-0">
          LIFECYCLE:
        </span>
        {([
          { id: 'all', label: 'ALL STAGES', desc: 'All token lifecycle stages' },
          { id: 'new_pairs', label: '🌱 SUB-BONDING (<$60K)', desc: 'Tier 1: Early bonding curve, min 0.1 SOL fees' },
          { id: 'about_to_graduate', label: '⚡ ABOUT TO GRADUATE (75-99%)', desc: 'Tier 2: $60K-$90K graduation push corridor, min 2 SOL fees' },
          { id: 'graduated', label: '🎓 GRADUATED DEX', desc: 'Tier 3: Post-graduation AMM (Raydium / DEX), min 5 SOL fees' },
          { id: 'og_revivals', label: '🏛️ OG REVIVALS (>14D)', desc: 'Tier 4: Dead coins coming back to life, clean holder base' },
        ] as const).map((stage) => {
          const isSelected = (filter.lifecycleStage || 'all') === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setFilter({ lifecycleStage: stage.id })}
              title={stage.desc}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition whitespace-nowrap shrink-0 ${
                isSelected
                  ? stage.id === 'about_to_graduate'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : stage.id === 'og_revivals'
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-zinc-950 font-bold shadow-sm'
                    : stage.id === 'graduated'
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-zinc-950 font-bold shadow-sm'
                    : stage.id === 'new_pairs'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-sm border border-slate-900 dark:border-zinc-700'
                  : 'bg-slate-100 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-900'
              }`}
            >
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>
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
