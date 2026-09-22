import React, { useMemo } from 'react';
import { Compass, Activity, FileSearch, Users, Network, Globe, Clock, DollarSign, History, FileText, Settings } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { analyzeFlowRadar } from '../../engines/flowRadarEngine';

export const Navigation: React.FC = () => {
  const { tokens, activeNav, setActiveNav, pendingSetups, openPositions, auditLogs } = useTradingStore();

  const { dumps } = useMemo(() => analyzeFlowRadar(tokens), [tokens]);

  const navItems = [
    { id: 'DISCOVER', label: 'DISCOVER', icon: Compass },
    {
      id: 'FLOW_RADAR',
      label: 'FLOW RADAR',
      icon: Activity,
      badge: dumps.length > 0 ? dumps.length : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    },
    { id: 'TOKEN_DETAIL', label: 'TOKEN DETAIL', icon: FileSearch },
    { id: 'DEVELOPERS', label: 'DEVELOPERS', icon: Users },
    { id: 'WALLETS', label: 'CLUSTERS & WHALES', icon: Network },
    { id: 'CHINESE_ALPHA', label: 'CHINESE & CABALS', icon: Globe },
    {
      id: 'SETUPS',
      label: 'TRADE SETUPS',
      icon: Clock,
      badge: pendingSetups.length > 0 ? pendingSetups.length : undefined,
    },
    {
      id: 'POSITIONS',
      label: 'OPEN POSITIONS',
      icon: DollarSign,
      badge: openPositions.length > 0 ? openPositions.length : undefined,
    },
    { id: 'HISTORY', label: 'TRADE HISTORY', icon: History },
    {
      id: 'AUDIT',
      label: 'AUDIT LOG',
      icon: FileText,
      badge: auditLogs.length,
    },
    { id: 'SETTINGS', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <nav className="hidden md:flex bg-slate-50 dark:bg-[#090a0f] border-b border-slate-200 dark:border-zinc-800/80 px-4 items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 transition-colors">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md transition-all whitespace-nowrap font-medium ${
              isActive
                ? 'bg-white dark:bg-zinc-800/90 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700/60 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${item.badgeColor || 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60'}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
