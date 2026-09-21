import React from 'react';
import { Compass, FileSearch, Users, Network, Clock, DollarSign, History, FileText, Settings } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';

export const Navigation: React.FC = () => {
  const { activeNav, setActiveNav, pendingSetups, openPositions, auditLogs } = useTradingStore();

  const navItems = [
    { id: 'DISCOVER', label: 'DISCOVER', icon: Compass },
    { id: 'TOKEN_DETAIL', label: 'TOKEN DETAIL', icon: FileSearch },
    { id: 'DEVELOPERS', label: 'DEVELOPERS', icon: Users },
    { id: 'WALLETS', label: 'WALLETS', icon: Network },
    {
      id: 'SETUPS',
      label: 'TRADE SETUPS',
      icon: Clock,
      badge: pendingSetups.length > 0 ? pendingSetups.length : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'POSITIONS',
      label: 'OPEN POSITIONS',
      icon: DollarSign,
      badge: openPositions.length > 0 ? openPositions.length : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    { id: 'HISTORY', label: 'TRADE HISTORY', icon: History },
    {
      id: 'AUDIT',
      label: 'AUDIT LOG',
      icon: FileText,
      badge: auditLogs.length,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    { id: 'SETTINGS', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <nav className="bg-[#090d16] border-b border-slate-800/80 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded transition-all whitespace-nowrap ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
