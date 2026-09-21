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
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      id: 'POSITIONS',
      label: 'OPEN POSITIONS',
      icon: DollarSign,
      badge: openPositions.length > 0 ? openPositions.length : undefined,
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    },
    { id: 'HISTORY', label: 'TRADE HISTORY', icon: History },
    {
      id: 'AUDIT',
      label: 'AUDIT LOG',
      icon: FileText,
      badge: auditLogs.length,
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700/60',
    },
    { id: 'SETTINGS', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <nav className="bg-[#090a0f] border-b border-zinc-800/80 px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md transition-all whitespace-nowrap font-medium ${
              isActive
                ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
