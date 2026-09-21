import { DeveloperProfile, PreviousLaunch, EvidenceItem, RiskLevel } from '../types/developer';
import { Chain } from '../types/token';

export class DeveloperAnalysisEngine {
  /**
   * Classify risk level strictly based on verifiable evidence.
   */
  public evaluateRisk(
    profile: Pick<DeveloperProfile, 'totalLaunches' | 'liquidityRemovalEvents' | 'largeCreatorSells' | 'abandonedLaunches' | 'suspiciousLaunches' | 'walletAgeDays'>
  ): { riskLevel: RiskLevel; reasons: string[] } {
    const reasons: string[] = [];

    if (profile.liquidityRemovalEvents >= 2 || profile.suspiciousLaunches >= 2) {
      reasons.push(`Deployer has ${profile.liquidityRemovalEvents} recorded liquidity removal events on previous launches.`);
      return { riskLevel: 'CRITICAL RISK', reasons };
    }

    if (profile.liquidityRemovalEvents === 1) {
      reasons.push('Deployer wallet previously removed liquidity from at least one historical launch.');
    }

    if (profile.largeCreatorSells >= 3) {
      reasons.push(`Deployer has a pattern of repeated large token dumps (${profile.largeCreatorSells} events observed).`);
    }

    if (profile.abandonedLaunches >= 2) {
      reasons.push(`Deployer has abandoned ${profile.abandonedLaunches} previous token projects within 48h of launch.`);
    }

    if (reasons.length > 0) {
      return { riskLevel: 'HIGH RISK', reasons };
    }

    if (profile.walletAgeDays < 7 || profile.totalLaunches <= 1) {
      reasons.push('New deployer wallet with little or no verifiable launch track record.');
      return { riskLevel: 'WATCH', reasons };
    }

    reasons.push('Historical launches maintained liquidity with no observable rug indicators.');
    return { riskLevel: 'LOW CONCERN', reasons };
  }

  /**
   * Builds an auditable evidence chain separating Fact, Indicator, and Inference
   */
  public buildEvidenceChain(
    launches: PreviousLaunch[],
    creatorAddress: string,
    chain: Chain
  ): EvidenceItem[] {
    const items: EvidenceItem[] = [];

    launches.forEach((launch, idx) => {
      if (launch.liquidityRemoved) {
        items.push({
          id: `ev-fact-liq-${idx}`,
          type: 'FACT',
          description: `Deployer removed liquidity (${launch.liquidityRemovedAmountUsd ? `$${launch.liquidityRemovedAmountUsd.toLocaleString()}` : 'majority'}) from ${launch.tokenSymbol} (${launch.tokenAddress}).`,
          walletAddress: creatorAddress,
          tokenAddress: launch.tokenAddress,
          timestamp: launch.launchTimestamp,
        });

        items.push({
          id: `ev-ind-liq-${idx}`,
          type: 'INDICATOR',
          description: `Historical pattern of liquidity extraction on ${chain.toUpperCase()} chain.`,
          timestamp: launch.launchTimestamp,
        });
      }

      if (launch.creatorDumped) {
        items.push({
          id: `ev-fact-dump-${idx}`,
          type: 'FACT',
          description: `Creator wallet sold ${launch.creatorSoldPercent || 'substantial'}% of token supply on ${launch.tokenSymbol}.`,
          walletAddress: creatorAddress,
          tokenAddress: launch.tokenAddress,
          timestamp: launch.launchTimestamp,
        });
      }
    });

    return items;
  }
}

export const developerAnalysisEngine = new DeveloperAnalysisEngine();
