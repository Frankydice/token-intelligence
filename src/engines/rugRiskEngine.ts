import { RugRiskAudit, SolanaSecurity, EvmSecurity } from '../types/risk';
import { EvidenceItem } from '../types/developer';
import { Chain } from '../types/token';

export class RugRiskEngine {
  public auditSolanaToken(
    tokenAddress: string,
    security: SolanaSecurity,
    creatorSoldPercent: number = 0,
    hasPriorRugHistory: boolean = false
  ): RugRiskAudit {
    const facts: EvidenceItem[] = [];
    const indicators: EvidenceItem[] = [];
    const inferences: EvidenceItem[] = [];

    let riskScore = 15; // baseline

    // Mint Authority
    if (security.mintAuthority === 'active') {
      riskScore += 35;
      facts.push({
        id: 'sol-f-mint',
        type: 'FACT',
        description: 'Solana Mint Authority is ACTIVE (not revoked).',
        tokenAddress,
        timestamp: Date.now(),
      });
      indicators.push({
        id: 'sol-i-mint',
        type: 'INDICATOR',
        description: 'Deployer can mint infinite new tokens at any time to dilute holders.',
        timestamp: Date.now(),
      });
    } else if (security.mintAuthority === 'revoked') {
      facts.push({
        id: 'sol-f-mint-rev',
        type: 'FACT',
        description: 'Solana Mint Authority is REVOKED (null address). Supply is fixed.',
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    // Freeze Authority
    if (security.freezeAuthority === 'active') {
      riskScore += 30;
      facts.push({
        id: 'sol-f-freeze',
        type: 'FACT',
        description: 'Solana Freeze Authority is ACTIVE.',
        tokenAddress,
        timestamp: Date.now(),
      });
      indicators.push({
        id: 'sol-i-freeze',
        type: 'INDICATOR',
        description: 'Deployer has technical capability to freeze user token accounts.',
        timestamp: Date.now(),
      });
    } else if (security.freezeAuthority === 'revoked') {
      facts.push({
        id: 'sol-f-freeze-rev',
        type: 'FACT',
        description: 'Solana Freeze Authority is REVOKED (null address). No accounts can be frozen.',
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    // LP Burned
    if (security.lpBurnedPercent < 90) {
      riskScore += 20;
      facts.push({
        id: 'sol-f-lp',
        type: 'FACT',
        description: `Only ${security.lpBurnedPercent.toFixed(1)}% of LP tokens burned or locked.`,
        tokenAddress,
        timestamp: Date.now(),
      });
    } else {
      facts.push({
        id: 'sol-f-lp-burned',
        type: 'FACT',
        description: `${security.lpBurnedPercent.toFixed(1)}% of LP tokens permanently burned.`,
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    // Top 10 Holder Concentration
    if (security.top10HoldersPercent > 40) {
      riskScore += 20;
      indicators.push({
        id: 'sol-i-conc',
        type: 'INDICATOR',
        description: `Top 10 holders control ${security.top10HoldersPercent.toFixed(1)}% of total supply.`,
        timestamp: Date.now(),
      });
    }

    if (hasPriorRugHistory) {
      riskScore += 25;
      indicators.push({
        id: 'sol-i-hist',
        type: 'INDICATOR',
        description: 'Deployer has documented history of past liquidity extraction.',
        timestamp: Date.now(),
      });
    }

    inferences.push({
      id: 'sol-inf-01',
      type: 'INFERENCE',
      description:
        riskScore > 60
          ? 'Elevated risk profile. Caution warranted regarding sudden liquidity collapse or supply dumping.'
          : 'Standard SPL token deployment parameters verified without structural traps.',
      timestamp: Date.now(),
    });

    const finalScore = Math.min(100, Math.max(0, riskScore));
    const riskCategory =
      finalScore >= 75 ? 'CRITICAL RISK' : finalScore >= 50 ? 'HIGH RISK' : finalScore >= 30 ? 'WATCH' : 'LOW CONCERN';

    return {
      tokenAddress,
      chain: 'solana',
      overallRiskScore: finalScore,
      riskCategory,
      solana: security,
      facts,
      indicators,
      inferences,
      summary: `Solana Token Audit: Mint ${security.mintAuthority}, Freeze ${security.freezeAuthority}, LP Burned ${security.lpBurnedPercent}%.`,
      creatorSellRisk: creatorSoldPercent > 10 ? 'HIGH' : 'LOW',
      liquidityRemovalRisk: security.lpBurnedPercent < 90 ? 'HIGH' : 'LOW',
      holderConcentrationRisk: security.top10HoldersPercent > 40 ? 'SEVERE' : 'HEALTHY',
    };
  }

  public auditEvmToken(
    tokenAddress: string,
    chain: Chain,
    security: EvmSecurity,
    creatorSoldPercent: number = 0,
    hasPriorRugHistory: boolean = false
  ): RugRiskAudit {
    const facts: EvidenceItem[] = [];
    const indicators: EvidenceItem[] = [];
    const inferences: EvidenceItem[] = [];

    let riskScore = 20;

    if (security.isHoneypot) {
      riskScore = 100;
      facts.push({
        id: 'evm-f-honey',
        type: 'FACT',
        description: 'Simulated sell transaction reverted. Token is a Honeypot.',
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    if (security.sellTaxPercent > 10) {
      riskScore += 25;
      facts.push({
        id: 'evm-f-tax',
        type: 'FACT',
        description: `Excessive sell tax detected: ${security.sellTaxPercent}%.`,
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    if (security.isUpgradeableProxy) {
      riskScore += 20;
      facts.push({
        id: 'evm-f-proxy',
        type: 'FACT',
        description: 'Contract is deployed behind an upgradeable proxy pattern.',
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    if (security.lpLockedPercent < 80) {
      riskScore += 25;
      facts.push({
        id: 'evm-f-lplock',
        type: 'FACT',
        description: `Only ${security.lpLockedPercent}% of liquidity pool tokens are locked.`,
        tokenAddress,
        timestamp: Date.now(),
      });
    }

    if (hasPriorRugHistory) {
      riskScore += 25;
      indicators.push({
        id: 'evm-i-prior',
        type: 'INDICATOR',
        description: 'Deployer address has confirmed historical liquidity removal events.',
        timestamp: Date.now(),
      });
    }

    inferences.push({
      id: 'evm-inf-summary',
      type: 'INFERENCE',
      description:
        riskScore >= 50
          ? 'Substantial risk factors detected on-chain. Capital loss probability is elevated.'
          : 'Low structural vulnerability identified in EVM contract bytecode.',
      timestamp: Date.now(),
    });

    const finalScore = Math.min(100, Math.max(0, riskScore));
    const riskCategory =
      finalScore >= 75 ? 'CRITICAL RISK' : finalScore >= 50 ? 'HIGH RISK' : finalScore >= 30 ? 'WATCH' : 'LOW CONCERN';

    return {
      tokenAddress,
      chain,
      overallRiskScore: finalScore,
      riskCategory,
      evm: security,
      facts,
      indicators,
      inferences,
      summary: `EVM Contract Audit: Buy Tax ${security.buyTaxPercent}%, Sell Tax ${security.sellTaxPercent}%, LP Locked ${security.lpLockedPercent}%.`,
      creatorSellRisk: creatorSoldPercent > 10 ? 'HIGH' : 'LOW',
      liquidityRemovalRisk: security.lpLockedPercent < 80 ? 'HIGH' : 'LOW',
      holderConcentrationRisk: security.top10HoldersPercent > 40 ? 'SEVERE' : 'HEALTHY',
    };
  }
}

export const rugRiskEngine = new RugRiskEngine();
