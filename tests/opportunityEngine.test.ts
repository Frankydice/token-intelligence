import { describe, it, expect } from 'vitest';
import { opportunityEngine } from '../src/engines/opportunityEngine';
import { DEMO_TOKENS, DEMO_RUG_RISKS, DEMO_WALLET_CLUSTERS } from '../src/providers/demoDataProvider';

describe('Opportunity Scoring Engine Tests', () => {
  it('should score high-growth token with strong buy pressure highly', () => {
    const token = DEMO_TOKENS[0]; // SOLPUMP
    const risk = DEMO_RUG_RISKS[token.address] || {
      tokenAddress: token.address,
      chain: token.chain,
      overallRiskScore: 20,
      riskCategory: 'LOW CONCERN',
      facts: [],
      indicators: [],
      inferences: [],
      summary: '',
      creatorSellRisk: 'LOW',
      liquidityRemovalRisk: 'LOW',
      holderConcentrationRisk: 'HEALTHY',
    };
    const cluster = DEMO_WALLET_CLUSTERS[token.address]?.[0];

    const opp = opportunityEngine.evaluate(token, risk, cluster);

    expect(opp.score).toBeGreaterThanOrEqual(70);
    expect(opp.positiveFactors.length).toBeGreaterThan(0);
    expect(opp.positiveFactors.some((p) => p.factor.includes('Holder'))).toBe(true);
  });

  it('should penalize tokens with critical risk and heavy sell pressure', () => {
    const token = DEMO_TOKENS[3]; // SMYIELD (Critical Risk)
    const risk = {
      tokenAddress: token.address,
      chain: token.chain,
      overallRiskScore: 92,
      riskCategory: 'CRITICAL RISK' as const,
      facts: [],
      indicators: [],
      inferences: [],
      summary: '',
      creatorSellRisk: 'HIGH' as const,
      liquidityRemovalRisk: 'HIGH' as const,
      holderConcentrationRisk: 'SEVERE' as const,
    };

    const opp = opportunityEngine.evaluate(token, risk, null);

    expect(opp.score).toBeLessThanOrEqual(40);
    expect(opp.negativeFactors.length).toBeGreaterThan(0);
  });
});
