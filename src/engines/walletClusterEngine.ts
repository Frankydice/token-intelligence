import { ClusterMember, WalletCluster } from '../types/wallet';
import { Chain } from '../types/token';

export class WalletClusterEngine {
  /**
   * Identifies clusters of wallets entering within a tight time window
   */
  public detectCoordinatedEntries(
    tokenAddress: string,
    chain: Chain,
    entries: ClusterMember[],
    maxWindowSeconds: number = 120
  ): WalletCluster | null {
    if (entries.length < 3) return null;

    // Sort entries by timestamp ascending
    const sorted = [...entries].sort((a, b) => a.entryTimestamp - b.entryTimestamp);
    const firstTime = sorted[0].entryTimestamp;
    const lastTime = sorted[sorted.length - 1].entryTimestamp;
    const actualWindowSec = Math.round((lastTime - firstTime) / 1000);

    if (actualWindowSec > maxWindowSeconds) {
      // Find subset within maxWindow
      return null;
    }

    const combinedPositionUsd = sorted.reduce((acc, curr) => acc + curr.amountUsd, 0);

    // Check common funding sources
    const fundingCounts: Record<string, number> = {};
    sorted.forEach((m) => {
      if (m.fundingSourceAddress) {
        fundingCounts[m.fundingSourceAddress] = (fundingCounts[m.fundingSourceAddress] || 0) + 1;
      }
    });

    let commonFundingSourceDetected = false;
    let commonFundingSourceAddress: string | undefined;

    for (const [addr, count] of Object.entries(fundingCounts)) {
      if (count >= 3) {
        commonFundingSourceDetected = true;
        commonFundingSourceAddress = addr;
        break;
      }
    }

    // Historical overlap check
    const avgOverlap = sorted.reduce((acc, curr) => acc + curr.historicalTokensTogether, 0) / sorted.length;

    let confidence: WalletCluster['confidence'] = 'Low';
    if (commonFundingSourceDetected && avgOverlap >= 2) {
      confidence = 'High';
    } else if (commonFundingSourceDetected || avgOverlap >= 1.5) {
      confidence = 'Medium';
    }

    const label = commonFundingSourceDetected
      ? 'COORDINATED WALLET ACTIVITY'
      : avgOverlap >= 2
      ? 'REPEATED WALLET NETWORK'
      : 'EARLY WALLET CLUSTER';

    const evidenceSummary = `${sorted.length} wallets entered within ${actualWindowSec} seconds, controlling $${Math.round(combinedPositionUsd).toLocaleString()} combined capital.${
      commonFundingSourceDetected ? ` Common funding source (${commonFundingSourceAddress?.slice(0, 8)}...) detected.` : ''
    }`;

    return {
      id: `cluster-${Date.now()}`,
      tokenAddress,
      chain,
      detectedAt: Date.now(),
      walletCount: sorted.length,
      windowSeconds: actualWindowSec,
      combinedPositionUsd,
      commonFundingSourceDetected,
      commonFundingSourceAddress,
      confidence,
      label,
      members: sorted,
      evidenceSummary,
    };
  }
}

export const walletClusterEngine = new WalletClusterEngine();
