import { Chain } from './token';

export type OrderType = 'TRIGGER_LIMIT' | 'TRIGGER_MARKET';

export type OrderStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED_WAITING_ENTRY'
  | 'ENTRY_TRIGGERED'
  | 'EXECUTING'
  | 'OPEN'
  | 'CLOSING'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REJECTED';

export type ExitReason =
  | 'TAKE_PROFIT'
  | 'STOP_LOSS'
  | 'TRAILING_STOP'
  | 'TIME_EXPIRY'
  | 'MANUAL_USER_EXIT'
  | 'KILL_SWITCH';

export interface TradeSetup {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: Chain;
  currentPriceAtSetup: number;
  entryTriggerPrice: number;
  positionSizeUsd: number;
  takeProfitPrice: number;
  takeProfitPercent: number;
  stopLossPrice: number;
  stopLossPercent: number;
  trailingStopPercent?: number;
  maxSlippagePercent: number;
  orderType: OrderType;
  expiryHours: number;
  createdAt: number;
  expiryTimestamp: number;
  approvedAt?: number;
  status: OrderStatus;
  userApprovalToken: string; // Non-empty string proves explicit human signature/approval
  notes?: string;
  isDemo: boolean;
}

export interface Position {
  id: string;
  setupId: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: Chain;
  entryPrice: number;
  entryTimestamp: number;
  entryTxHash: string;
  currentPrice: number;
  positionSizeUsd: number;
  tokenAmount: number;
  currentValueUsd: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPercent: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  trailingStopPrice?: number;
  maxPriceObserved: number;
  status: 'OPEN' | 'CLOSED';
  exitTimestamp?: number;
  exitPrice?: number;
  exitTxHash?: string;
  exitReason?: ExitReason;
  realizedPnlUsd?: number;
  realizedPnlPercent?: number;
  isDemo: boolean;
}

export interface TradeSetupDraft {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: Chain;
  currentPrice: number;
  entryTriggerPrice: number;
  positionSizeUsd: number;
  takeProfitPercent: number;
  takeProfitPrice: number;
  stopLossPercent: number;
  stopLossPrice: number;
  trailingStopPercent?: number;
  maxSlippagePercent: number;
  orderType: OrderType;
  expiryHours: number;
}
