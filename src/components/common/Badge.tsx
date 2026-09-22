import React from 'react';
import { RiskLevel } from '../../types/developer';
import { Chain } from '../../types/token';

export const RiskBadge: React.FC<{ level: RiskLevel; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  const styles: Record<RiskLevel, { dot: string; text: string; badgeClass: string }> = {
    'LOW CONCERN': {
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      text: 'LOW CONCERN',
      badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60',
    },
    'WATCH': {
      dot: 'bg-amber-500 dark:bg-amber-400',
      text: 'WATCH',
      badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60',
    },
    'HIGH RISK': {
      dot: 'bg-rose-500 dark:bg-rose-400',
      text: 'HIGH RISK',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50',
    },
    'CRITICAL RISK': {
      dot: 'bg-rose-600 dark:bg-rose-500 animate-pulse',
      text: 'CRITICAL RISK',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800/60',
    },
  };

  const current = styles[level] || styles['WATCH'];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded border ${pad} ${current.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`}></span>
      <span>{current.text}</span>
    </span>
  );
};

export const OpportunityBadge: React.FC<{ score: number; size?: 'sm' | 'md' }> = ({ score, size = 'sm' }) => {
  let dot = 'bg-zinc-400 dark:bg-zinc-500';
  if (score >= 75) {
    dot = 'bg-emerald-500 dark:bg-emerald-400';
  } else if (score >= 50) {
    dot = 'bg-sky-500 dark:bg-sky-400';
  } else if (score >= 30) {
    dot = 'bg-amber-500 dark:bg-amber-400';
  } else {
    dot = 'bg-rose-500 dark:bg-rose-400';
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono rounded border ${pad} bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}></span>
      <span className="text-zinc-400 dark:text-zinc-500 font-medium">OPP</span>
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{score}/100</span>
    </span>
  );
};

export const ChainBadge: React.FC<{ chain: Chain }> = ({ chain }) => {
  if (chain === 'solana') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14f195] shrink-0"></span>
        <span>SOLANA</span>
      </span>
    );
  }
  if (chain === 'bsc') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0"></span>
        <span>BNB CHAIN</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0"></span>
      <span>{chain.toUpperCase()}</span>
    </span>
  );
};
