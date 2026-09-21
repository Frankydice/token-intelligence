import React from 'react';
import { RiskLevel } from '../../types/developer';
import { Chain } from '../../types/token';

export const RiskBadge: React.FC<{ level: RiskLevel; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  const styles: Record<RiskLevel, { bg: string; dot: string; text: string }> = {
    'LOW CONCERN': {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      dot: 'bg-emerald-400',
      text: 'LOW CONCERN',
    },
    'WATCH': {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      dot: 'bg-amber-400',
      text: 'WATCH',
    },
    'HIGH RISK': {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      dot: 'bg-rose-400',
      text: 'HIGH RISK',
    },
    'CRITICAL RISK': {
      bg: 'bg-rose-950/50 border-rose-600/40 text-rose-300 font-semibold',
      dot: 'bg-rose-500 animate-pulse',
      text: 'CRITICAL RISK',
    },
  };

  const current = styles[level] || styles['WATCH'];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded border ${pad} ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.text}
    </span>
  );
};

export const OpportunityBadge: React.FC<{ score: number; size?: 'sm' | 'md' }> = ({ score, size = 'sm' }) => {
  let color = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50';
  let dot = 'bg-zinc-400';
  if (score >= 80) {
    color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dot = 'bg-emerald-400';
  } else if (score >= 65) {
    color = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    dot = 'bg-sky-400';
  } else if (score >= 40) {
    color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dot = 'bg-amber-400';
  } else {
    color = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dot = 'bg-rose-400';
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono rounded border ${pad} ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      <span className="text-zinc-500 font-medium">OPP</span>
      <span className="font-bold">{score}/100</span>
    </span>
  );
};

export const ChainBadge: React.FC<{ chain: Chain }> = ({ chain }) => {
  if (chain === 'solana') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14f195]"></span>
        SOLANA
      </span>
    );
  }
  if (chain === 'bsc') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
        BNB CHAIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
      {chain.toUpperCase()}
    </span>
  );
};
