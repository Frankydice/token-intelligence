import { describe, it, expect } from 'vitest';
import { walletClusterEngine } from '../src/engines/walletClusterEngine';
import { ClusterMember } from '../src/types/wallet';

describe('Wallet Cluster & Coordinated Activity Tests', () => {
  it('should detect a coordinated wallet cluster entering within 85 seconds', () => {
    const now = Date.now();
    const mockMembers: ClusterMember[] = [
      {
        walletAddress: '0x1111...1111',
        entryTimestamp: now,
        entryTxHash: '0xtx1',
        amountUsd: 5000,
        tokenAmount: 1000000,
        fundingSourceAddress: '0xfunder...001',
        fundingSourceName: 'Dispenser Wallet',
        historicalTokensTogether: 3,
      },
      {
        walletAddress: '0x2222...2222',
        entryTimestamp: now + 20000,
        entryTxHash: '0xtx2',
        amountUsd: 6000,
        tokenAmount: 1200000,
        fundingSourceAddress: '0xfunder...001',
        fundingSourceName: 'Dispenser Wallet',
        historicalTokensTogether: 3,
      },
      {
        walletAddress: '0x3333...3333',
        entryTimestamp: now + 50000,
        entryTxHash: '0xtx3',
        amountUsd: 7000,
        tokenAmount: 1400000,
        fundingSourceAddress: '0xfunder...001',
        fundingSourceName: 'Dispenser Wallet',
        historicalTokensTogether: 3,
      },
      {
        walletAddress: '0x4444...4444',
        entryTimestamp: now + 80000,
        entryTxHash: '0xtx4',
        amountUsd: 8000,
        tokenAmount: 1600000,
        fundingSourceAddress: '0xfunder...001',
        fundingSourceName: 'Dispenser Wallet',
        historicalTokensTogether: 3,
      },
    ];

    const cluster = walletClusterEngine.detectCoordinatedEntries(
      '0xmockToken',
      'bsc',
      mockMembers,
      120
    );

    expect(cluster).not.toBeNull();
    expect(cluster?.walletCount).toBe(4);
    expect(cluster?.windowSeconds).toBeLessThanOrEqual(120);
    expect(cluster?.combinedPositionUsd).toBe(26000);
    expect(cluster?.commonFundingSourceDetected).toBe(true);
    expect(cluster?.confidence).toBe('High');
    expect(cluster?.label).toBe('COORDINATED WALLET ACTIVITY');
  });

  it('should ignore entries that are spaced beyond the max window', () => {
    const now = Date.now();
    const distantMembers: ClusterMember[] = [
      {
        walletAddress: '0x1111...1111',
        entryTimestamp: now,
        entryTxHash: '0xtx1',
        amountUsd: 5000,
        tokenAmount: 1000000,
        historicalTokensTogether: 0,
      },
      {
        walletAddress: '0x2222...2222',
        entryTimestamp: now + 300000, // 300 seconds later!
        entryTxHash: '0xtx2',
        amountUsd: 6000,
        tokenAmount: 1200000,
        historicalTokensTogether: 0,
      },
      {
        walletAddress: '0x3333...3333',
        entryTimestamp: now + 600000,
        entryTxHash: '0xtx3',
        amountUsd: 7000,
        tokenAmount: 1400000,
        historicalTokensTogether: 0,
      },
    ];

    const cluster = walletClusterEngine.detectCoordinatedEntries(
      '0xmockToken',
      'bsc',
      distantMembers,
      120
    );

    expect(cluster).toBeNull();
  });
});
