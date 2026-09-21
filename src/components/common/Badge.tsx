import React from 'react';
import { RiskLevel } from '../../types/developer';
import { Chain } from '../../types/token';

export const RiskBadge: React.FC<{ level: RiskLevel; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  const styles: Record<RiskLevel, string> = {
    'LOW CONCERN': 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    'WATCH': 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    'HIGH RISK': 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    'CRITICAL RISK': 'bg-red-950 text-red-400 border-red-600 animate-pulse font-bold',
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded border ${pad} ${styles[level] || styles['WATCH']}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {level}
    </span>
  );
};

export const OpportunityBadge: React.FC<{ score: number; size?: 'sm' | 'md' }> = ({ score, size = 'sm' }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  if (score >= 80) color = 'bg-cyan-950/80 text-cyan-300 border-cyan-700';
  else if (score >= 65) color = 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
  else if (score >= 45) color = 'bg-blue-950/80 text-blue-300 border-blue-700';

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 font-mono rounded border ${pad} ${color}`}>
      <span className="text-[10px] text-slate-400">OPP:</span>
      <span className="font-bold">{score}/100</span>
    </span>
  );
};

export const ChainBadge: React.FC<{ chain: Chain }> = ({ chain }) => {
  if (chain === 'solana') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14f195]"></span>
        SOLANA
      </span>
    );
  }
  if (chain === 'bsc') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f3ba2f]"></span>
        BNB CHAIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      {chain.toUpperCase()}
    </span>
  );
};
