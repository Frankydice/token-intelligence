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
      className="terminal-card hover:border-cyan-500/50 transition-all p-4 cursor-pointer hover:bg-slate-900/40 relative group"
    >
      {/* Top Row: Token Name, Symbol, Chain, Age */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-300 text-sm">
            {token.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm font-mono">{token.name}</span>
              <span className="text-xs text-slate-400 font-mono">${token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <ChainBadge chain={token.chain} />
              <span className="text-[11px] text-slate-400 font-mono">
                Age: {token.ageHours < 24 ? `${token.ageHours}h` : `${(token.ageHours / 24).toFixed(1)}d`}
              </span>
            </div>
          </div>
        </div>

        {/* Badges: Risk & Opportunity */}
        <div className="flex flex-col items-end gap-1">
          <OpportunityBadge score={token.opportunityScore} />
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      {/* Contract & Creator Addresses */}
      <div className="bg-slate-950/60 rounded p-2 border border-slate-900 mb-3 space-y-1 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>CA:</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-300">{truncateAddress(token.address, 5)}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-cyan-400 text-slate-500 transition"
              title="Copy address"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <a
              href={getExplorerUrl(token.address, token.chain, 'token')}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:text-cyan-400 text-slate-500 transition"
              title="Explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Creator:</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">{truncateAddress(token.creatorAddress, 4)}</span>
            {token.tags.includes('dev_alert') && (
              <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                <ShieldAlert className="w-2.5 h-2.5" /> Dev Alert
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price & Primary Financial Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono">
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Price</div>
          <div className="font-bold text-slate-100">{formatUsd(token.priceUsd, 6)}</div>
          <div className={`text-[10px] flex items-center gap-0.5 ${token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {token.priceChange24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {formatPercent(token.priceChange24h)}
          </div>
        </div>

        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Market Cap</div>
          <div className="font-bold text-slate-100">{formatUsd(token.marketCap)}</div>
          <div className="text-[10px] text-slate-400">{token.holdersCount.toLocaleString()} holders</div>
        </div>

        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Liquidity</div>
          <div className="font-bold text-cyan-300">{formatUsd(token.liquidity)}</div>
          <div className="text-[10px] text-emerald-400">
            {token.liquidityChange24h >= 0 ? '+' : ''}{token.liquidityChange24h}% 24h
          </div>
        </div>

        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-400">24h Vol</div>
          <div className="font-bold text-slate-100">{formatUsd(token.volume24h)}</div>
          <div className="text-[10px] text-slate-400">
            <span className="text-emerald-400">{formatUsd(token.volumeBuy24h, 0)} B</span> /{' '}
            <span className="text-rose-400">{formatUsd(token.volumeSell24h, 0)} S</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openOpportunityReport(token);
          }}
          className="flex-1 py-1.5 px-3 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Opportunity Report
        </button>

        <button
          onClick={handleInspect}
          className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          Inspect
        </button>
      </div>
    </div>
  );
};
