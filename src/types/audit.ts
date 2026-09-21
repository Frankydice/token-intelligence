import { Chain } from './token';

export type AuditActionType =
  | 'TOKEN_DISCOVERED'
  | 'ANALYSIS_GENERATED'
  | 'RUG_RISK_EVALUATED'
  | 'WALLET_CLUSTER_DETECTED'
  | 'OPPORTUNITY_REPORTED'
  | 'USER_REPORT_NOTIFIED'
  | 'USER_APPROVED_TRADE'
  | 'USER_REJECTED_TRADE'
  | 'USER_CANCELLED_SETUP'
  | 'ENTRY_CONDITION_MET'
  | 'ORDER_SUBMITTED'
  | 'ORDER_EXECUTED'
  | 'POSITION_OPENED'
  | 'RISK_ALERT_TRIGGERED'
  | 'EXIT_CONDITION_MET'
  | 'EXIT_ORDER_EXECUTED'
  | 'POSITION_CLOSED'
  | 'KILL_SWITCH_ACTIVATED';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditActionType;
  tokenAddress?: string;
  tokenSymbol?: string;
  chain?: Chain;
  summary: string;
  details: string;
  actor: 'BOT_AUTONOMOUS' | 'HUMAN_USER';
  isDemo: boolean;
  metadata?: Record<string, unknown>;
}
