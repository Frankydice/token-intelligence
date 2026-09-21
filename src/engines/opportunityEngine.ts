import { Token } from '../types/token';
import { RugRiskAudit } from '../types/risk';
import { WalletCluster } from '../types/wallet';
import { OpportunityScore, FactorImpact } from '../types/opportunity';

export class OpportunityEngine {
  public evaluate(
    token: Token,
    risk: RugRiskAudit,
    cluster?: WalletCluster | null
  ): OpportunityScore {
    const positiveFactors: FactorImpact[] = [];
    const negativeFactors: FactorImpact[] = [];

    let score = 50; // Neutral midpoint

    // 1. Holder Growth & Base
    if (token.holdersCount > 1000) {
      score += 12;
      positiveFactors.push({
        factor: 'Robust Holder Distribution',
        points: 12,
        evidence: `Token has acquired ${token.holdersCount.toLocaleString()} distinct holder wallets.`,
      });
    } else if (token.holdersCount < 100) {
      score -= 10;
      negativeFactors.push({
        factor: 'Low Holder Adoption',
        points: -10,
        evidence: `Only ${token.holdersCount} holders currently active.`,
      });
    }

    // 2. Liquidity Depth
    if (token.liquidity >= 50_000) {
      score += 15;
      positiveFactors.push({
        factor: 'Deep Liquidity Pool',
        points: 15,
        evidence: `Liquidity pool depth is $${Math.round(token.liquidity).toLocaleString()}, absorbing reasonable order flow.`,
      });
    } else if (token.liquidity < 15_000) {
      score -= 15;
      negativeFactors.push({
        factor: 'Thin Liquidity Pool',
        points: -15,
        evidence: `Pool liquidity is only $${Math.round(token.liquidity).toLocaleString()}, vulnerable to high price slippage.`,
      });
    }

    // 3. Buy/Sell Ratio & Volume Momentum
    const buySellRatio = token.txns24hBuy / Math.max(1, token.txns24hSell);
    if (buySellRatio >= 1.5) {
      score += 14;
      positiveFactors.push({
        factor: 'Strong Buy Pressure Imbalance',
        points: 14,
        evidence: `Buy transactions (${token.txns24hBuy}) outnumber sells (${token.txns24hSell}) by ${buySellRatio.toFixed(1)}x.`,
      });
    } else if (buySellRatio < 0.7) {
      score -= 12;
      negativeFactors.push({
        factor: 'Sell Pressure Dominance',
        points: -12,
        evidence: `Sell transactions dominate order flow (${token.txns24hSell} sells vs ${token.txns24hBuy} buys).`,
      });
    }

    // 4. Wallet Cluster Activity
    if (cluster && cluster.confidence !== 'Low') {
      score += 10;
      positiveFactors.push({
        factor: 'Early Wallet Cluster Accumulation',
        points: 10,
        evidence: `${cluster.walletCount} coordinated wallets accumulated $${Math.round(cluster.combinedPositionUsd).toLocaleString()} early.`,
      });
    }

    // 5. Deduct Risk Penalties
    if (risk.overallRiskScore > 50) {
      const riskPenalty = Math.round((risk.overallRiskScore - 50) * 0.7);
      score -= riskPenalty;
      negativeFactors.push({
        factor: 'High Structural / Deployer Risk',
        points: -riskPenalty,
        evidence: `Rug risk audit returned a risk score of ${risk.overallRiskScore}/100 (${risk.riskCategory}).`,
      });
    }

    // 6. Solana Specific Mint/Freeze Bonus
    if (token.chain === 'solana' && risk.solana) {
      if (risk.solana.mintAuthority === 'revoked' && risk.solana.freezeAuthority === 'revoked') {
        score += 8;
        positiveFactors.push({
          factor: 'Immutable Solana Authorities',
          points: 8,
          evidence: 'Both Mint and Freeze authorities are permanently revoked.',
        });
      }
    }

    const finalScore = Math.min(98, Math.max(5, score));
    const rating =
      finalScore >= 80 ? 'EXCEPTIONAL' : finalScore >= 65 ? 'HIGH' : finalScore >= 45 ? 'MODERATE' : 'LOW';

    const summary = `${rating} opportunity rating (${finalScore}/100) based on ${positiveFactors.length} positive signals and ${negativeFactors.length} risk friction points.`;

    return {
      score: finalScore,
      rating,
      positiveFactors,
      negativeFactors,
      summary,
    };
  }
}

export const opportunityEngine = new OpportunityEngine();
