import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldAlert, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Token } from '../../types/token';
import { ChainBadge, OpportunityBadge, RiskBadge } from '../common/Badge';
import { formatUsd, formatPercent, truncateAddress, getExplorerUrl } from '../../utils/formatters';
import { useTradingStore } from '../../store/useTradingStore';

export const TokenCard: React.FC<{ token: Token }> = ({ token }) => {
  const { setSelectedToken, setActiveNav, openOpportunityReport } = useTradingStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInspect = () => {
    setSelectedToken(token);
    setActiveNav('TOKEN_DETAIL');
  };

  const riskLevel =
    token.riskScore >= 75
      ? 'CRITICAL RISK'
      : token.riskScore >= 50
      ? 'HIGH RISK'
      : token.riskScore >= 30
      ? 'WATCH'
      : 'LOW CONCERN';

  return (
    <div
      onClick={handleInspect}
      className="terminal-card terminal-card-hover p-3.5 sm:p-4 cursor-pointer relative group flex flex-col justify-between"
    >
      <div>
        {/* Top Row: Token Name, Symbol, Chain, Age */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center font-mono font-semibold text-slate-800 dark:text-zinc-200 text-xs shrink-0">
              {token.symbol.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm font-mono truncate max-w-[130px] sm:max-w-[160px]" title={token.name}>
                  {token.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono shrink-0">${token.symbol}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <ChainBadge chain={token.chain} />
                <span className="text-[11px] text-slate-400 dark:text-zinc-400 font-mono">
                  {token.ageHours < 24 ? `${token.ageHours}h` : `${(token.ageHours / 24).toFixed(1)}d`}
                </span>
              </div>
            </div>
          </div>

          {/* Badges: Risk & Opportunity */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <OpportunityBadge score={token.opportunityScore} />
            <RiskBadge level={riskLevel} />
          </div>
        </div>

        {/* Contract & Creator Addresses */}
        <div className="bg-slate-50 dark:bg-zinc-950/70 rounded-md p-2 border border-slate-200 dark:border-zinc-900/90 mb-3 space-y-1 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-400 dark:text-zinc-500">CA:</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-700 dark:text-zinc-300">{truncateAddress(token.address, 5)}</span>
              <button
                onClick={handleCopy}
                className="p-0.5 hover:text-sky-600 dark:hover:text-sky-400 text-slate-400 dark:text-zinc-400 transition"
                title="Copy address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <a
                href={getExplorerUrl(token.address, token.chain, 'token')}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 hover:text-sky-600 dark:hover:text-sky-400 text-slate-400 dark:text-zinc-400 transition"
                title="Explorer"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-400 dark:text-zinc-500">Creator:</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-700 dark:text-zinc-300">{truncateAddress(token.creatorAddress, 4)}</span>
              {token.tags.includes('dev_alert') && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800/30">
                  <ShieldAlert className="w-2.5 h-2.5" /> Dev Alert
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price & Primary Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-md border border-slate-200 dark:border-zinc-800/60">
            <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">Price</div>
            <div className="font-semibold text-slate-900 dark:text-zinc-100">{formatUsd(token.priceUsd, 6)}</div>
            <div className={`text-[10px] flex items-center gap-0.5 ${token.priceChange24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {token.priceChange24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {formatPercent(token.priceChange24h)}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-md border border-slate-200 dark:border-zinc-800/60">
            <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">Market Cap</div>
            <div className="font-semibold text-slate-900 dark:text-zinc-100">{formatUsd(token.marketCap)}</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-400">{token.holdersCount.toLocaleString()} holders</div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-md border border-slate-200 dark:border-zinc-800/60">
            <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">Liquidity</div>
            <div className="font-semibold text-slate-900 dark:text-zinc-100">{formatUsd(token.liquidity)}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {token.liquidityChange24h >= 0 ? '+' : ''}{token.liquidityChange24h}% 24h
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-md border border-slate-200 dark:border-zinc-800/60">
            <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-medium">24h Vol</div>
            <div className="font-semibold text-slate-900 dark:text-zinc-100">{formatUsd(token.volume24h)}</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400">
              <span className="text-emerald-600 dark:text-emerald-400">{formatUsd(token.volumeBuy24h, 0)} B</span> /{' '}
              <span className="text-rose-600 dark:text-rose-400">{formatUsd(token.volumeSell24h, 0)} S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 text-xs font-mono mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openOpportunityReport(token);
          }}
          className="flex-1 py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-semibold flex items-center justify-center gap-1.5 transition shadow-sm text-xs min-h-[38px]"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Opportunity Report</span>
        </button>

        <button
          onClick={handleInspect}
          className="py-2 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700/60 font-medium transition min-h-[38px]"
        >
          Inspect
        </button>
      </div>
    </div>
  );
};
