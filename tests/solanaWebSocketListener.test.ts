import { describe, it, expect } from 'vitest';
import { SolanaWebSocketListener, SolanaNewLaunchEvent } from '../src/providers/solanaWebSocketListener';

describe('Solana WebSocket Real-Time Launch Listener Tests', () => {
  it('should parse Pump.fun launch creation log lines', () => {
    const listener = new SolanaWebSocketListener();
    let capturedLaunch: SolanaNewLaunchEvent | null = null;

    listener.onNewLaunch((event) => {
      capturedLaunch = event;
    });

    const mockPumpMsg = JSON.stringify({
      jsonrpc: '2.0',
      method: 'logsNotification',
      params: {
        result: {
          context: { slot: 298412890 },
          value: {
            signature: '5xTestPumpSig1234567890abcdef',
            err: null,
            logs: [
              'Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P invoke [1]',
              'Program log: Instruction: Create',
              'Program log: create bonding curve',
              'Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P success',
            ],
          },
        },
        subscription: 1,
      },
    });

    listener.handleMessage(mockPumpMsg);

    expect(capturedLaunch).not.toBeNull();
    const launch1 = capturedLaunch as unknown as SolanaNewLaunchEvent;
    expect(launch1.platform).toBe('pumpfun');
    expect(launch1.signature).toBe('5xTestPumpSig1234567890abcdef');
    expect(launch1.mintAddress).toContain('sol_pump_');
  });

  it('should parse Raydium AMM pool initialization log lines', () => {
    const listener = new SolanaWebSocketListener();
    let capturedLaunch: SolanaNewLaunchEvent | null = null;

    listener.onNewLaunch((event) => {
      capturedLaunch = event;
    });

    const mockRaydiumMsg = JSON.stringify({
      jsonrpc: '2.0',
      method: 'logsNotification',
      params: {
        result: {
          context: { slot: 298412900 },
          value: {
            signature: '4yTestRaydiumSig987654321',
            err: null,
            logs: [
              'Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 invoke [1]',
              'Program log: initialize2: InitializeInstruction2',
              'Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 success',
            ],
          },
        },
        subscription: 2,
      },
    });

    listener.handleMessage(mockRaydiumMsg);

    expect(capturedLaunch).not.toBeNull();
    const launch2 = capturedLaunch as unknown as SolanaNewLaunchEvent;
    expect(launch2.platform).toBe('raydium');
    expect(launch2.signature).toBe('4yTestRaydiumSig987654321');
  });

  it('should transform a real-time launch event into a Token object', () => {
    const listener = new SolanaWebSocketListener();
    const event: SolanaNewLaunchEvent = {
      platform: 'pumpfun',
      mintAddress: 'sol_pump_7xKXtg2C',
      signature: '5xSignature123',
      timestamp: Date.now(),
      initialLiquiditySol: 30.0,
      logSnippet: 'Instruction: Create',
    };

    const token = listener.createTokenFromLaunch(event);

    expect(token.chain).toBe('solana');
    expect(token.address).toBe('sol_pump_7xKXtg2C');
    expect(token.dexId).toBe('pumpfun');
    expect(token.liquidity).toBeGreaterThan(0);
  });
});
