import { IExecutionProvider } from '../types/provider';
import { TradeSetup, Position } from '../types/trade';

export class SimulatedExecutionProvider implements IExecutionProvider {
  readonly name = 'Simulated Execution Engine (DEMO)';
  readonly isDemo = true;

  async executeEntry(
    setup: TradeSetup,
    currentPrice: number
  ): Promise<{
    success: boolean;
    txHash: string;
    executedPrice: number;
    executedSizeUsd: number;
    tokenAmount: number;
    slippagePercent: number;
    error?: string;
  }> {
    // Realistic simulation delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Simulate minor market impact and slippage up to half of max slippage
    const maxSlippage = setup.maxSlippagePercent / 100;
    const slippageFactor = 1 + (Math.random() * maxSlippage * 0.5);
    const executedPrice = currentPrice * slippageFactor;
    const slippagePercent = ((executedPrice - currentPrice) / currentPrice) * 100;

    // Check if slippage breached user limit
    if (slippagePercent > setup.maxSlippagePercent) {
      return {
        success: false,
        txHash: '',
        executedPrice: currentPrice,
        executedSizeUsd: 0,
        tokenAmount: 0,
        slippagePercent,
        error: `Simulated price slippage (${slippagePercent.toFixed(2)}%) exceeded user limit of ${setup.maxSlippagePercent}%`,
      };
    }

    const tokenAmount = setup.positionSizeUsd / executedPrice;
    const prefix = setup.chain === 'solana' ? 'sim_sol_' : '0xsim_';
    const txHash = `${prefix}${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

    return {
      success: true,
      txHash,
      executedPrice,
      executedSizeUsd: setup.positionSizeUsd,
      tokenAmount,
      slippagePercent,
    };
  }

  async executeExit(
    position: Position,
    exitPrice: number,
    _reason: string
  ): Promise<{
    success: boolean;
    txHash: string;
    executedPrice: number;
    realizedPnlUsd: number;
    realizedPnlPercent: number;
    error?: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const exitValueUsd = position.tokenAmount * exitPrice;
    const realizedPnlUsd = exitValueUsd - position.positionSizeUsd;
    const realizedPnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;

    const prefix = position.chain === 'solana' ? 'sim_sol_exit_' : '0xsim_exit_';
    const txHash = `${prefix}${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

    return {
      success: true,
      txHash,
      executedPrice: exitPrice,
      realizedPnlUsd,
      realizedPnlPercent,
    };
  }
}

export class LiveExecutionProvider implements IExecutionProvider {
  readonly name = 'Live On-Chain Signer';
  readonly isDemo = false;

  async executeEntry(): Promise<{
    success: boolean;
    txHash: string;
    executedPrice: number;
    executedSizeUsd: number;
    tokenAmount: number;
    slippagePercent: number;
    error?: string;
  }> {
    // Explicit guardrail: Never fabricate or execute live funds without explicit key setup
    return {
      success: false,
      txHash: '',
      executedPrice: 0,
      executedSizeUsd: 0,
      tokenAmount: 0,
      slippagePercent: 0,
      error: 'LIVE EXECUTION GUARD: No unlocked non-custodial signer configured in backend environment. Please verify RPC & Key isolation in .env before enabling live trading.',
    };
  }

  async executeExit(): Promise<{
    success: boolean;
    txHash: string;
    executedPrice: number;
    realizedPnlUsd: number;
    realizedPnlPercent: number;
    error?: string;
  }> {
    return {
      success: false,
      txHash: '',
      executedPrice: 0,
      realizedPnlUsd: 0,
      realizedPnlPercent: 0,
      error: 'LIVE EXECUTION GUARD: Live execution signer disabled.',
    };
  }
}
