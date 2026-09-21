import { describe, it, expect } from 'vitest';
import { developerAnalysisEngine } from '../src/engines/developerAnalysisEngine';

describe('Developer Intelligence & Risk Engine Tests', () => {
  it('should categorize a deployer with 2+ liquidity pulls as CRITICAL RISK', () => {
    const result = developerAnalysisEngine.evaluateRisk({
      totalLaunches: 5,
      liquidityRemovalEvents: 2,
      largeCreatorSells: 1,
      abandonedLaunches: 1,
      suspiciousLaunches: 1,
      walletAgeDays: 60,
    });

    expect(result.riskLevel).toBe('CRITICAL RISK');
    expect(result.reasons[0]).toContain('liquidity removal events');
  });

  it('should categorize a deployer with 1 liquidity pull or 2 abandoned launches as HIGH RISK', () => {
    const result = developerAnalysisEngine.evaluateRisk({
      totalLaunches: 4,
      liquidityRemovalEvents: 1,
      largeCreatorSells: 3,
      abandonedLaunches: 2,
      suspiciousLaunches: 0,
      walletAgeDays: 48,
    });

    expect(result.riskLevel).toBe('HIGH RISK');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should categorize a clean, seasoned deployer as LOW CONCERN', () => {
    const result = developerAnalysisEngine.evaluateRisk({
      totalLaunches: 3,
      liquidityRemovalEvents: 0,
      largeCreatorSells: 0,
      abandonedLaunches: 0,
      suspiciousLaunches: 0,
      walletAgeDays: 140,
    });

    expect(result.riskLevel).toBe('LOW CONCERN');
  });

  it('should generate verifiable evidence separating FACT and INDICATOR', () => {
    const evidence = developerAnalysisEngine.buildEvidenceChain(
      [
        {
          tokenAddress: '0x4492...8f',
          tokenName: 'DogeMax Yield',
          tokenSymbol: 'DOGEMAX',
          chain: 'bsc',
          launchTimestamp: Date.now() - 20 * 86400 * 1000,
          peakMcap: 280_000,
          currentMcap: 1_200,
          status: 'rug_pulled',
          liquidityRemoved: true,
          liquidityRemovedAmountUsd: 28400,
          creatorDumped: true,
          creatorSoldPercent: 82,
        },
      ],
      '0x123f...c83b',
      'bsc'
    );

    const facts = evidence.filter((e) => e.type === 'FACT');
    const indicators = evidence.filter((e) => e.type === 'INDICATOR');

    expect(facts.length).toBeGreaterThan(0);
    expect(indicators.length).toBeGreaterThan(0);
    expect(facts[0].description).toContain('28,400');
  });
});
