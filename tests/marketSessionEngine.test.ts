import { describe, it, expect } from 'vitest';
import { marketSessionEngine } from '../src/engines/marketSessionEngine';

describe('MarketSessionEngine - Timing and Market Sessions (Playbook Ch. 16)', () => {
  it('correctly classifies Asia Session at 04:00 UTC', () => {
    const date = new Date('2026-09-28T04:00:00Z');
    const info = marketSessionEngine.getSessionInfo(date);

    expect(info.primarySession).toBe('ASIA');
    expect(info.activeSessions).toContain('ASIA');
    expect(info.isDeadZone).toBe(false);
    expect(info.sessionBadge).toContain('ASIA');
    expect(info.optimalAction).toContain('Chinese narrative');
  });

  it('correctly classifies Europe Session at 10:00 UTC', () => {
    const date = new Date('2026-09-28T10:00:00Z');
    const info = marketSessionEngine.getSessionInfo(date);

    expect(info.primarySession).toBe('EUROPE');
    expect(info.activeSessions).toContain('EUROPE');
    expect(info.liquidityTier).toBe('HIGH');
    expect(info.sessionBadge).toContain('EUROPE');
  });

  it('correctly classifies the Apex Overlap (EU + US) at 14:00 UTC', () => {
    const date = new Date('2026-09-28T14:00:00Z');
    const info = marketSessionEngine.getSessionInfo(date);

    expect(info.isApexOverlap).toBe(true);
    expect(info.isGoldenWindow).toBe(true);
    expect(info.liquidityTier).toBe('MAXIMUM');
    expect(info.sessionBadge).toContain('APEX');
    expect(info.volumeMultiplier).toBe('3.5x');
    expect(info.optimalAction).toContain('Highest win-rate');
  });

  it('correctly classifies US Golden Window at 16:30 UTC', () => {
    const date = new Date('2026-09-28T16:30:00Z');
    const info = marketSessionEngine.getSessionInfo(date);

    expect(info.isGoldenWindow).toBe(true);
    expect(info.isApexOverlap).toBe(false);
    expect(info.primarySession).toBe('US');
    expect(info.sessionBadge).toContain('US GOLDEN');
  });

  it('correctly classifies the Dead Zone (Touch Grass window) at 22:30 UTC', () => {
    const date = new Date('2026-09-28T22:30:00Z');
    const info = marketSessionEngine.getSessionInfo(date);

    expect(info.isDeadZone).toBe(true);
    expect(info.primarySession).toBe('DEAD_ZONE');
    expect(info.liquidityTier).toBe('LOW');
    expect(info.sessionBadge).toContain('TOUCH GRASS');
    expect(info.volumeMultiplier).toBe('0.3x');
    expect(info.optimalAction).toContain('Step away');
  });
});
