import { describe, it, expect } from 'vitest';
import { RobinhoodChainListener, RobinhoodNewLaunchEvent } from '../src/providers/robinhoodChainListener';

describe('Robinhood Chain Real-Time Launch Listener Tests', () => {
  it('should parse Robinhood L2 PairCreated logs notification', () => {
    const listener = new RobinhoodChainListener();
    let capturedLaunch: RobinhoodNewLaunchEvent | null = null;

    listener.onNewLaunch((event) => {
      capturedLaunch = event;
    });

    const mockRobinhoodMsg = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_subscription',
      params: {
        subscription: '0x1776sub',
        result: {
          address: '0x1776000000000000000000000000000000001776',
          blockNumber: '0x123456',
          transactionHash: '0xrh_test_tx_hash_1234567890abcdef',
          data: '0x000000000000000000000000',
          topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
        },
      },
    });

    listener.handleMessage(mockRobinhoodMsg);

    expect(capturedLaunch).not.toBeNull();
    const launch = capturedLaunch as unknown as RobinhoodNewLaunchEvent;
    expect(launch.platform).toBe('orbit_factory');
    expect(launch.signature).toBe('0xrh_test_tx_hash_1234567890abcdef');
    expect(launch.contractAddress).toContain('0x');
    expect(launch.logSnippet).toContain('Robinhood L2 PairCreated');
  });

  it('should transform a Robinhood launch event into a valid Token object', () => {
    const listener = new RobinhoodChainListener();
    const event: RobinhoodNewLaunchEvent = {
      platform: 'robinhood_rwa',
      contractAddress: '0x1776992817291827391827391827391827391827',
      pairAddress: '0x112817291827391827391827391827391827393f',
      signature: '0xrh_sig_rtsla_123',
      timestamp: Date.now(),
      initialLiquidityEth: 150.0,
      logSnippet: 'Tokenized Stock RWA Deployed',
      metadata: {
        name: 'Tokenized Tesla Stock',
        symbol: 'rTSLA',
        assetType: 'RWA_TOKENIZED_STOCK',
      },
    };

    const token = listener.createTokenFromLaunch(event);

    expect(token.chain).toBe('robinhood');
    expect(token.address).toBe('0x1776992817291827391827391827391827391827');
    expect(token.symbol).toBe('rTSLA');
    expect(token.name).toBe('Tokenized Tesla Stock');
    expect(token.dexId).toBe('robinhood_rwa');
    expect(token.liquidity).toBeGreaterThan(100_000);
    expect(token.tags).toContain('new');
  });

  it('should remain DISCONNECTED when offline and never emit mocked launches', () => {
    const listener = new RobinhoodChainListener();
    expect(listener.getStatus()).toBe('DISCONNECTED');

    let capturedLaunch: RobinhoodNewLaunchEvent | null = null;
    listener.onNewLaunch((evt) => {
      capturedLaunch = evt;
    });

    // Zero simulated emissions occur when disconnected
    expect(capturedLaunch).toBeNull();
    expect(listener.getStatus()).toBe('DISCONNECTED');
  });

  it('should transition status on connect and manual disconnect', () => {
    const listener = new RobinhoodChainListener();
    expect(listener.getStatus()).toBe('DISCONNECTED');

    listener.connect();
    expect(['CONNECTING', 'CONNECTED']).toContain(listener.getStatus());

    listener.disconnect();
    expect(listener.getStatus()).toBe('DISCONNECTED');
  });
});
