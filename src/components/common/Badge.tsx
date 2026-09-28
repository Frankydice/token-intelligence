import React from 'react';
import { RiskLevel } from '../../types/developer';
import { Chain, LifecycleStage } from '../../types/token';

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
  if (chain === 'robinhood') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00c805] shrink-0 animate-pulse"></span>
        <span>ROBINHOOD</span>
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

export const VolumeAuthenticityBadge: React.FC<{
  authenticity?: 'ORGANIC' | 'SUSPICIOUS' | 'WASH_TRADING';
  ratioDisplay?: string;
  size?: 'sm' | 'md';
}> = ({ authenticity = 'ORGANIC', ratioDisplay, size = 'sm' }) => {
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[11px]';

  if (authenticity === 'WASH_TRADING') {
    return (
      <span
        title="Playbook Alert: 24h fees are less than 1/30th of volume or volume disconnected from liquidity. Wash trading detected."
        className={`inline-flex items-center gap-1 font-mono font-bold rounded border ${pad} bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
        <span>FAKE VOL (&lt;1/30)</span>
      </span>
    );
  }

  if (authenticity === 'SUSPICIOUS') {
    return (
      <span
        title="Playbook Warning: Borderline fee yield or abnormal volume-to-liquidity ratio."
        className={`inline-flex items-center gap-1 font-mono font-semibold rounded border ${pad} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
        <span>SUSPICIOUS VOL</span>
      </span>
    );
  }

  return (
    <span
      title={`Playbook Verified: Clean volume generating legitimate protocol LP fees (${ratioDisplay || 'normal tier'}).`}
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${pad} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
      <span>ORGANIC VOL{ratioDisplay ? ` (${ratioDisplay})` : ''}</span>
    </span>
  );
};

export const LifecycleBadge: React.FC<{
  stage?: LifecycleStage;
  bondingProgress?: number;
  ageHours?: number;
  size?: 'sm' | 'md';
}> = ({ stage = 'new_pairs', bondingProgress, ageHours, size = 'sm' }) => {
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[11px]';

  if (stage === 'about_to_graduate') {
    return (
      <span
        title={`Playbook Tier 2: About to Graduate (${bondingProgress || 85}% curve progress). High-momentum graduation corridor.`}
        className={`inline-flex items-center gap-1 font-mono font-bold rounded border ${pad} bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping"></span>
        <span>⚡ PRE-GRAD {bondingProgress ? `${bondingProgress}%` : ''}</span>
      </span>
    );
  }

  if (stage === 'graduated') {
    return (
      <span
        title="Playbook Tier 3: Graduated AMM Pool (Raydium / DEX). Established liquidity with locked LP."
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${pad} bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
        <span>🎓 GRADUATED</span>
      </span>
    );
  }

  if (stage === 'og_revivals') {
    const days = ageHours ? Math.round(ageHours / 24) : 14;
    return (
      <span
        title={`Playbook Chapter 13 & 15: OG Revival (${days}d old). Community takeover with organic holder distribution.`}
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${pad} bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
        <span>🏛️ OG REVIVAL ({days}d)</span>
      </span>
    );
  }

  return (
    <span
      title={`Playbook Tier 1: Sub-Bonding Curve (${bondingProgress || 10}% progress). Early discovery.`}
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${pad} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
      <span>🌱 SUB-BONDING{bondingProgress ? ` (${bondingProgress}%)` : ''}</span>
    </span>
  );
};

