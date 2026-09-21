import { describe, it, expect } from 'vitest';
import { rugRiskEngine } from '../src/engines/rugRiskEngine';

describe('Rug Risk Engine Tests', () => {
  it('should detect active Solana Mint and Freeze authorities as HIGH RISK', () => {
    const audit = rugRiskEngine.auditSolanaToken(
      'sol_token_active_auth',
      {
        mintAuthority: 'active',
        freezeAuthority: 'active',
        lpBurnedPercent: 50,
        top10HoldersPercent: 45,
        metadataMutable: true,
      },
      0,
      false
    );

    expect(audit.overallRiskScore).toBeGreaterThanOrEqual(75);
    expect(audit.riskCategory).toBe('CRITICAL RISK');

    const mintFact = audit.facts.find((f) => f.id === 'sol-f-mint');
    expect(mintFact).toBeDefined();
    expect(mintFact?.description).toContain('ACTIVE');
  });

  it('should evaluate revoked Solana authorities with burned LP as LOW CONCERN', () => {
    const audit = rugRiskEngine.auditSolanaToken(
      'sol_token_revoked',
      {
        mintAuthority: 'revoked',
        freezeAuthority: 'revoked',
        lpBurnedPercent: 100,
        top10HoldersPercent: 12,
        metadataMutable: false,
      },
      0,
      false
    );

    expect(audit.overallRiskScore).toBeLessThan(35);
    expect(audit.riskCategory).toBe('LOW CONCERN');
  });

  it('should flag EVM Honeypot as 100 Risk Score', () => {
    const audit = rugRiskEngine.auditEvmToken('evm_honey', 'bsc', {
      ownershipRenounced: false,
      isHoneypot: true,
      buyTaxPercent: 5,
      sellTaxPercent: 99,
      lpLockedPercent: 0,
      top10HoldersPercent: 80,
      isUpgradeableProxy: true,
      hasBlacklist: true,
    });

    expect(audit.overallRiskScore).toBe(100);
    expect(audit.riskCategory).toBe('CRITICAL RISK');
  });
});
