import { describe, it, expect, beforeEach } from 'vitest';
import { walletConnectionService } from '../src/services/walletConnectionService';

describe('Web3 Wallet Connection Service Tests', () => {
  beforeEach(() => {
    walletConnectionService.disconnect();
  });

  it('should detect watch_only provider as always available', () => {
    expect(walletConnectionService.isProviderInstalled('watch_only')).toBe(true);
  });

  it('should connect to Solana wallet via Phantom fallback/mock', async () => {
    const wallet = await walletConnectionService.connect('phantom');

    expect(wallet).toBeDefined();
    expect(wallet.chain).toBe('solana');
    expect(wallet.providerType).toBe('phantom');
    expect(wallet.providerName).toBe('Phantom');
    expect(wallet.isWatchOnly).toBe(false);
    expect(wallet.balanceNative).toBeGreaterThan(0);
    expect(wallet.address).toBeTruthy();
    expect(walletConnectionService.getWallet()?.address).toBe(wallet.address);
  });

  it('should connect to EVM wallet via MetaMask on BNB Chain', async () => {
    const wallet = await walletConnectionService.connect('metamask', { preferredChain: 'bsc' });

    expect(wallet).toBeDefined();
    expect(wallet.chain).toBe('bsc');
    expect(wallet.providerType).toBe('metamask');
    expect(wallet.providerName).toBe('MetaMask');
    expect(wallet.isWatchOnly).toBe(false);
    expect(wallet.balanceNative).toBeGreaterThan(0);
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
    expect(wallet.balanceNative).toBeGreaterThan(0);
  });

  it('should connect in Watch-Only mode with a valid Solana address', async () => {
    const solanaAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    const wallet = await walletConnectionService.connect('watch_only', {
      customAddress: solanaAddress,
    });

    expect(wallet).toBeDefined();
    expect(wallet.isWatchOnly).toBe(true);
    expect(wallet.chain).toBe('solana');
    expect(wallet.address).toBe(solanaAddress);
    expect(wallet.providerName).toBe('Watch-Only');
  });

  it('should connect in Watch-Only mode with a valid EVM address on Robinhood Chain', async () => {
    const evmAddress = '0x71C0B1c875155E6EfFdC32381F4faB4a54497e2C';
    const wallet = await walletConnectionService.connect('watch_only', {
      customAddress: evmAddress,
      preferredChain: 'robinhood',
    });

    expect(wallet).toBeDefined();
    expect(wallet.isWatchOnly).toBe(true);
    expect(wallet.chain).toBe('robinhood');
    expect(wallet.address).toBe(evmAddress);
  });

  it('should throw an error in Watch-Only mode for invalid or empty addresses', async () => {
    await expect(
      walletConnectionService.connect('watch_only', { customAddress: '' })
    ).rejects.toThrow('Please enter a valid wallet address to monitor.');

    await expect(
      walletConnectionService.connect('watch_only', { customAddress: 'invalid_short' })
    ).rejects.toThrow('Invalid address format');
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
