import React from 'react';
import {
  X,
  Users,
  Network,
  History,
  FileText,
  Settings,
  Sun,
  Moon,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import { useTheme } from '../../context/ThemeContext';
import { formatUsd } from '../../utils/formatters';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeNav,
    setActiveNav,
    auditLogs,
    openPositions,
    pendingSetups,
    isKillSwitchActive,
    toggleKillSwitch,
    solanaWsStatus,
    toggleSolanaWs,
  } = useTradingStore();

  const { resolvedTheme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const totalUnrealizedPnl = openPositions.reduce((acc, p) => acc + p.unrealizedPnlUsd, 0);

  const secondaryNavItems = [
    { id: 'DEVELOPERS', label: 'Deployer Intelligence Hub', icon: Users, desc: 'Creator wallet histories & LP pulls' },
    { id: 'WALLETS', label: 'Wallet Cluster Tracker', icon: Network, desc: 'Sniper rings & co-entry blocks' },
    { id: 'HISTORY', label: 'Trade History', icon: History, desc: 'Completed executions & audit PnL' },
    { id: 'AUDIT', label: 'On-Chain Audit Log', icon: FileText, badge: auditLogs.length, desc: 'Immutable timeline of actions' },
    { id: 'SETTINGS', label: 'Settings & Guardrails', icon: Settings, desc: 'Risk limits, Telegram & endpoints' },
  ];

  const handleSelectNav = (navId: string) => {
    setActiveNav(navId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="bg-white dark:bg-[#12141c] border-t border-slate-200 dark:border-zinc-800 rounded-t-2xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl p-4 space-y-4">
        {/* Drawer Grabber & Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sky-500 dark:text-sky-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-mono font-semibold text-sm text-slate-900 dark:text-zinc-100">
                TERMINAL MENU
              </h3>
              <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                Quick tools, controls &amp; system status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Row: Theme Toggle + Solana WSS */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between text-left hover:border-slate-300 dark:hover:border-zinc-700 transition"
          >
            <div className="flex items-center gap-2">
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
              <div>
                <span className="block font-medium text-slate-900 dark:text-zinc-100 text-[11px]">
                  {resolvedTheme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500">
                  Currently {resolvedTheme.toUpperCase()}
                </span>
              </div>
            </div>
          </button>

          {/* Solana WSS Toggle */}
          <button
            onClick={() => toggleSolanaWs(solanaWsStatus !== 'CONNECTED')}
            className={`p-3 rounded-lg border text-left flex items-center justify-between transition ${
              solanaWsStatus === 'CONNECTED'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-medium text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${solanaWsStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>SOL WSS</span>
              </div>
              <span className="text-[9px] block text-slate-400 dark:text-zinc-500 mt-0.5">
                {solanaWsStatus}
              </span>
            </div>
          </button>
        </div>

        {/* Live Metrics Summary Pill */}
        <div className="bg-slate-50 dark:bg-zinc-950/70 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center font-mono">
          <div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block uppercase">Monitors</span>
            <span className="font-semibold text-xs text-amber-500 dark:text-amber-400">{pendingSetups.length} wait</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block uppercase">Positions</span>
            <span className="font-semibold text-xs text-sky-500 dark:text-sky-400">{openPositions.length} active</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block uppercase">PnL</span>
            <span className={`font-semibold text-xs ${totalUnrealizedPnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{formatUsd(totalUnrealizedPnl)}
            </span>
          </div>
        </div>

        {/* Secondary Navigation List */}
        <div className="space-y-1 font-mono text-xs">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold px-1">
            Navigation Hub
          </span>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition ${
                  isActive
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${isActive ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">{item.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">{item.desc}</span>
                  </div>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Emergency Kill Switch on Mobile */}
        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => {
              toggleKillSwitch(!isKillSwitchActive);
              onClose();
            }}
            className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition ${
              isKillSwitchActive
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isKillSwitchActive ? 'HALTED (DISARM KILL SWITCH)' : 'EMERGENCY KILL SWITCH'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
