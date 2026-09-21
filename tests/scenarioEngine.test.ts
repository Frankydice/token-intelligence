import { describe, it, expect } from 'vitest';
import { scenarioEngine } from '../src/engines/scenarioEngine';
import { DEMO_TOKENS } from '../src/providers/demoDataProvider';

describe('2x to 100x Scenario Analysis Tests', () => {
  it('should calculate required market cap and liquidity for 5x and 10x without presenting them as guaranteed', () => {
    const token = DEMO_TOKENS[1]; // CYBERDOGE ($450K mcap, $0.00045 price)
    const analysis = scenarioEngine.generateScenarios(token);

    expect(analysis.upsideScenarios.length).toBe(6); // 2X, 5X, 10X, 20X, 50X, 100X

    const sc5x = analysis.upsideScenarios.find((s) => s.multiple === '5X');
    const sc10x = analysis.upsideScenarios.find((s) => s.multiple === '10X');

    expect(sc5x).toBeDefined();
    expect(sc10x).toBeDefined();

    expect(sc5x?.targetMcap).toBe(token.marketCap * 5);
    expect(sc10x?.targetMcap).toBe(token.marketCap * 10);
    expect(sc5x?.targetPrice).toBeCloseTo(token.priceUsd * 5, 5);
    expect(sc10x?.targetPrice).toBeCloseTo(token.priceUsd * 10, 5);

    // Required liquidity and capital inflow must be positive
    expect(sc5x?.requiredLiquidity).toBeGreaterThan(0);
    expect(sc5x?.requiredCapitalInflowUsd).toBeGreaterThan(0);

    // Explicit disclaimer must be present
    expect(analysis.disclaimer).toContain('DISCLAIMER');
    expect(analysis.disclaimer).toContain('NOT guarantees');
  });

  it('should calculate downside scenarios (-50%, -80%, -99%)', () => {
    const token = DEMO_TOKENS[0];
    const analysis = scenarioEngine.generateScenarios(token);

    expect(analysis.downsideScenarios.length).toBe(3);
    const pullScenario = analysis.downsideScenarios.find((d) => d.dropPercent === -99);
    expect(pullScenario).toBeDefined();
    expect(pullScenario?.targetMcap).toBeCloseTo(token.marketCap * 0.01, 1);
  });
});
