import { describe, it, expect } from 'vitest';
import { DEMO_TOKENS } from '../src/providers/demoDataProvider';

describe('Token Discovery & Filtering Tests', () => {
  it('should correctly calculate token age within last 30 days', () => {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 3600 * 1000;

    DEMO_TOKENS.forEach((token) => {
      const ageMs = now - token.createdAt;
      expect(ageMs).toBeGreaterThan(0);
      expect(ageMs).toBeLessThanOrEqual(thirtyDaysMs);
      expect(token.ageHours).toBeGreaterThan(0);
      expect(token.ageHours).toBeLessThanOrEqual(720);
    });
  });

  it('should support Solana and BNB Chain tokens', () => {
    const solTokens = DEMO_TOKENS.filter((t) => t.chain === 'solana');
    const bscTokens = DEMO_TOKENS.filter((t) => t.chain === 'bsc');

    expect(solTokens.length).toBeGreaterThan(0);
    expect(bscTokens.length).toBeGreaterThan(0);

    // Verify token identity attributes
    expect(solTokens[0].symbol).toBe('SOLPUMP');
    expect(bscTokens[0].symbol).toBe('CYBERDOGE');
  });

  it('should calculate valid buy/sell transaction ratios', () => {
    DEMO_TOKENS.forEach((token) => {
      expect(token.txns24hBuy).toBeGreaterThanOrEqual(0);
      expect(token.txns24hSell).toBeGreaterThanOrEqual(0);
      expect(token.volumeBuy24h + token.volumeSell24h).toBeGreaterThan(0);
    });
  });
});
