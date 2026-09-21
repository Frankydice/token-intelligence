import { AuditLogEntry, AuditActionType } from '../types/audit';
import { Chain } from '../types/token';

export class AuditLogEngine {
  private logs: AuditLogEntry[] = [];

  constructor() {
    // Initial system boot log
    this.recordEntry({
      action: 'ANALYSIS_GENERATED',
      summary: 'Token Intelligence & Sniper System Initialized',
      details: 'Audit logging engine started. Multi-chain scanner ready for Solana and BNB Chain.',
      actor: 'BOT_AUTONOMOUS',
      isDemo: true,
    });
  }

  public recordEntry(params: {
    action: AuditActionType;
    summary: string;
    details: string;
    actor: 'BOT_AUTONOMOUS' | 'HUMAN_USER';
    isDemo: boolean;
    tokenAddress?: string;
    tokenSymbol?: string;
    chain?: Chain;
    metadata?: Record<string, unknown>;
  }): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      action: params.action,
      tokenAddress: params.tokenAddress,
      tokenSymbol: params.tokenSymbol,
      chain: params.chain,
      summary: params.summary,
      details: params.details,
      actor: params.actor,
      isDemo: params.isDemo,
      metadata: params.metadata,
    };

    this.logs.unshift(entry); // newest first
    return entry;
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const auditLogEngine = new AuditLogEngine();
