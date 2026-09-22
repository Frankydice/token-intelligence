import React from 'react';
import { Compass, FileSearch, Clock, DollarSign, Menu } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';

interface MobileNavigationProps {
  onOpenDrawer: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onOpenDrawer }) => {
  const { activeNav, setActiveNav, pendingSetups, openPositions } = useTradingStore();

  const mainTabs = [
    { id: 'DISCOVER', label: 'Discover', icon: Compass },
    { id: 'TOKEN_DETAIL', label: 'Detail', icon: FileSearch },
    {
      id: 'SETUPS',
      label: 'Setups',
      icon: Clock,
      badge: pendingSetups.length > 0 ? pendingSetups.length : undefined,
    },
    {
      id: 'POSITIONS',
      label: 'Positions',
      icon: DollarSign,
      badge: openPositions.length > 0 ? openPositions.length : undefined,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeNav === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveNav(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all relative font-mono text-[10px] ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] font-bold text-center rounded-full bg-sky-500 text-white leading-tight">
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenDrawer}
        className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all font-mono text-[10px] text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <Menu className="w-5 h-5 mb-0.5 stroke-[1.7]" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
