import { TradeSetupDraft } from '../types/trade';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const MAX_SAFE_POSITION_SIZE_USD = 5000;
export const MIN_POSITION_SIZE_USD = 1;
export const MAX_SAFE_SLIPPAGE_PERCENT = 15;
export const MIN_SLIPPAGE_PERCENT = 0.1;

export function validateTradeSetupDraft(
  draft: TradeSetupDraft,
  maxPositionSizeUsd: number = MAX_SAFE_POSITION_SIZE_USD
): ValidationResult {
  const errors: string[] = [];

  if (!draft.tokenAddress || draft.tokenAddress.trim().length < 5) {
    errors.push('Invalid token contract address.');
  }

  if (draft.entryTriggerPrice <= 0 || isNaN(draft.entryTriggerPrice)) {
    errors.push('Entry trigger price must be greater than 0.');
  }

  if (draft.positionSizeUsd < MIN_POSITION_SIZE_USD) {
    errors.push(`Position size must be at least $${MIN_POSITION_SIZE_USD}.`);
  }

  if (draft.positionSizeUsd > maxPositionSizeUsd) {
    errors.push(`Position size exceeds safety limit of $${maxPositionSizeUsd.toLocaleString()}.`);
  }

  if (draft.takeProfitPrice <= draft.entryTriggerPrice) {
    errors.push('Take profit price must be strictly higher than the entry trigger price.');
  }

  if (draft.stopLossPrice >= draft.entryTriggerPrice) {
    errors.push('Stop loss price must be strictly lower than the entry trigger price.');
  }

  if (draft.stopLossPrice <= 0) {
    errors.push('Stop loss price must be greater than 0.');
  }

  if (draft.maxSlippagePercent < MIN_SLIPPAGE_PERCENT || draft.maxSlippagePercent > MAX_SAFE_SLIPPAGE_PERCENT) {
    errors.push(`Max slippage must be between ${MIN_SLIPPAGE_PERCENT}% and ${MAX_SAFE_SLIPPAGE_PERCENT}%.`);
  }

  if (draft.expiryHours <= 0 || draft.expiryHours > 168) {
    errors.push('Trade order expiry must be between 1 hour and 7 days (168 hours).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
