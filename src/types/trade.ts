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
  | 'KILL_SWITCH'
  | 'CONTROLLED_JEET_STAGNATION'
  | 'CONTROLLED_JEET_DEV_DUMP'
  | 'CONTROLLED_JEET_WASH_SPIKE';

export type SniperPresetType =
  | 'MARTINGALE_3_STEP'
  | 'CONTROLLED_JEET_SCALP'
  | 'MOONBAG_CONVICTION'
  | 'CUSTOM';

export interface TrancheConfig {
  step: number; // 1, 2, 3
  name: string; // 'Scout Entry', 'Dip Absorption', 'Breakout Confirmation'
  allocationPercent: number; // e.g. 25, 35, 40
  priceOffsetPercent: number; // e.g. 0, -25, +15 relative to trigger price
  triggerPrice: number; // calculated dollar price
  status: 'PENDING' | 'TRIGGERED' | 'EXECUTED' | 'CANCELLED';
}

export interface ControlledJeetRules {
  hardStopLossPercent: number; // e.g. 30% max drawdown
  stagnationCutMinutes: number; // e.g. 20 (cut 100% if flat/stagnant after 20m)
  emergencyDevDumpCut: boolean; // instant cut if dev/tied wallet dumps >5%
  emergencyWashSpikeCut: boolean; // cancel tranches & cut if wash score >60%
}

export interface SniperPresetConfig {
  presetType: SniperPresetType;
  name: string;
  badge: string;
  description: string;
  tranches: TrancheConfig[];
  controlledJeet: ControlledJeetRules;
  takeProfit1Percent: number; // e.g. 100% (+100% = 2x)
  takeProfit1SellPercent: number; // e.g. 50% (take capital off the table)
  takeProfit2Percent: number; // e.g. 400% (+400% = 5x)
  takeProfit2SellPercent: number; // e.g. 25%
  moonbagPercent: number; // e.g. 25% (runner)
}

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
  sniperPreset?: SniperPresetConfig;
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
  sniperPreset?: SniperPresetConfig;
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
  sniperPreset?: SniperPresetConfig;
}
