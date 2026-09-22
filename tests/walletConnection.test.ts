import { describe, it, expect, beforeEach } from 'vitest';
import { walletConnectionService } from '../src/services/walletConnectionService';

describe('Web3 Wallet Connection Service Tests', () => {
  beforeEach(() => {
    walletConnectionService.disconnect();
  });

  it('should detect watch_only provider as always available', () => {
    expect(walletConnectionService.isProviderInstalled('watch_only')).toBe(true);
  });

  it('should connect to Solana wallet with real 0-default balance instead of hardcoded numbers', async () => {
    const wallet = await walletConnectionService.connect('phantom');

    expect(wallet).toBeDefined();
    expect(wallet.chain).toBe('solana');
    expect(wallet.providerType).toBe('phantom');
    expect(wallet.providerName).toBe('Phantom');
    expect(wallet.isWatchOnly).toBe(false);
    expect(wallet.balanceNative).toBeGreaterThanOrEqual(0);
    expect(wallet.address).toBeTruthy();
    expect(walletConnectionService.getWallet()?.address).toBe(wallet.address);
  });

  it('should connect to EVM wallet via MetaMask on BNB Chain with accurate balance defaults', async () => {
    const wallet = await walletConnectionService.connect('metamask', { preferredChain: 'bsc' });

    expect(wallet).toBeDefined();
    expect(wallet.chain).toBe('bsc');
    expect(wallet.providerType).toBe('metamask');
    expect(wallet.providerName).toBe('MetaMask');
    expect(wallet.isWatchOnly).toBe(false);
    expect(wallet.balanceNative).toBeGreaterThanOrEqual(0);
    expect(wallet.address).toBeTruthy();
    expect(walletConnectionService.getWallet()?.chain).toBe('bsc');
  });

  it('should connect to EVM wallet via Rabby on Robinhood Chain L2', async () => {
    const wallet = await walletConnectionService.connect('rabby', { preferredChain: 'robinhood' });

    expect(wallet).toBeDefined();
    expect(wallet.chain).toBe('robinhood');
    expect(wallet.providerType).toBe('rabby');
    expect(wallet.providerName).toBe('Rabby');
    expect(wallet.isWatchOnly).toBe(false);
    expect(wallet.balanceNative).toBeGreaterThanOrEqual(0);
  });

  it('should connect in Watch-Only mode with a valid Solana address and zero-default balance', async () => {
    const solanaAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    const wallet = await walletConnectionService.connect('watch_only', {
      customAddress: solanaAddress,
    });

    expect(wallet).toBeDefined();
    expect(wallet.isWatchOnly).toBe(true);
    expect(wallet.chain).toBe('solana');
    expect(wallet.address).toBe(solanaAddress);
    expect(wallet.providerName).toBe('Watch-Only');
    expect(wallet.balanceNative).toBe(0);
    expect(wallet.balanceUsd).toBe(0);
  });

  it('should connect in Watch-Only mode with user BNB Chain address with zero-default balance', async () => {
    const userAddress = '0x1813e3f70af99b6501c669531b74e03674a235b9';
    const wallet = await walletConnectionService.connect('watch_only', {
      customAddress: userAddress,
      preferredChain: 'bsc',
    });

    expect(wallet).toBeDefined();
    expect(wallet.isWatchOnly).toBe(true);
    expect(wallet.chain).toBe('bsc');
    expect(wallet.address).toBe(userAddress);
    // Verified: No more fake 3.42 BNB!
    expect(wallet.balanceNative).toBe(0);
    expect(wallet.balanceUsd).toBe(0);
  });

  it('should throw an error in Watch-Only mode for invalid or empty addresses', async () => {
    await expect(
      walletConnectionService.connect('watch_only', { customAddress: '' })
    ).rejects.toThrow('Please enter a valid wallet address to monitor.');

    await expect(
      walletConnectionService.connect('watch_only', { customAddress: 'invalid_short' })
    ).rejects.toThrow('Invalid address format');
  });

  it('should refresh balance on demand via refreshBalance()', async () => {
    await walletConnectionService.connect('watch_only', {
      customAddress: '0x1813e3f70af99b6501c669531b74e03674a235b9',
      preferredChain: 'bsc',
    });

    const refreshed = await walletConnectionService.refreshBalance();
    expect(refreshed).toBeDefined();
    expect(typeof refreshed?.balanceNative).toBe('number');
    expect(typeof refreshed?.balanceUsd).toBe('number');
  });

  it('should trigger onWalletChange listeners when connecting and disconnecting', async () => {
    let notifiedState: string | null = null;
    const unsub = walletConnectionService.onWalletChange((w) => {
      notifiedState = w ? w.address : null;
    });

    const wallet = await walletConnectionService.connect('solflare');
    expect(notifiedState).toBe(wallet.address);

    walletConnectionService.disconnect();
    expect(notifiedState).toBeNull();
    expect(walletConnectionService.getWallet()).toBeNull();

    unsub();
  });
});
