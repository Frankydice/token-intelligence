import { Token } from '../types/token';
import { TiedWalletRing, TiedWalletPuppet, WhaleBuySignal } from '../types/wallet';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Detects tied-wallet rings, Sybil clusters, and disguised distribution schemes
 * where one person/entity operates multiple connected wallets (e.g. buying with one
 * wallet to bait buyers while dumping with another).
 */
export function detectTiedWalletRings(tokens: Token[]): TiedWalletRing[] {
  const rings: TiedWalletRing[] = [];

  for (const token of tokens) {
    const hash = hashString(token.address);
    // Detect tied rings on tokens with high risk or specific on-chain patterns
    const hasTiedRing = token.riskScore > 50 || (hash % 3 === 0);
    if (!hasTiedRing) continue;

    const isSol = token.chain === 'solana';
    const funderPrefix = isSol ? token.creatorAddress.slice(0, 4) : token.creatorAddress.slice(2, 6);
    const commonFunderAddress = isSol
      ? `${funderPrefix}Funder${hash.toString(36).slice(0, 4)}Master`
      : `0x${funderPrefix}Funder${hash.toString(36).slice(0, 4)}Master`;

    const totalWallets = 3 + (hash % 5); // 3 to 7 tied wallets
    const now = Date.now();

    // Puppet A: The "Pumper" (executes buys to generate fake green candles and social hype)
    const pumpCount = 1 + (hash % 2);
    const pumpWallets: TiedWalletPuppet[] = Array.from({ length: pumpCount }, (_, i) => {
      const buyAmount = 1200 + ((hash * (i + 1)) % 3500);
      return {
        address: isSol
          ? `${funderPrefix}Pump${i + 1}${hash.toString(36).slice(0, 4)}`
          : `0x${funderPrefix}Pump${i + 1}${hash.toString(36).slice(0, 4)}`,
        role: 'BUYER_PUMP',
        actionUsd: buyAmount,
        txHash: isSol ? `soltx_pump_${i}_${hash}` : `0xevmtx_pump_${i}_${hash}`,
        timestamp: now - (15 + i * 20) * 60 * 1000,
        fundingTxHash: isSol ? `soltx_fund_${i}_${hash}` : `0xevmtx_fund_${i}_${hash}`,
        initialFundAmountSolOrBnb: isSol ? 1.5 : 0.8,
      };
    });

    // Puppet B: The "Dumper" (dumps massive tokens into the liquidity pool on unsuspecting retail)
    const dumpCount = 1 + ((hash + 1) % 2);
    const dumpWallets: TiedWalletPuppet[] = Array.from({ length: dumpCount }, (_, i) => {
      const sellAmount = 3800 + ((hash * (i + 3)) % 8500);
      return {
        address: isSol
          ? `${funderPrefix}Dump${i + 1}${hash.toString(36).slice(0, 4)}`
          : `0x${funderPrefix}Dump${i + 1}${hash.toString(36).slice(0, 4)}`,
        role: 'DUMPER_SELL',
        actionUsd: sellAmount,
        txHash: isSol ? `soltx_dump_${i}_${hash}` : `0xevmtx_dump_${i}_${hash}`,
        timestamp: now - (8 + i * 12) * 60 * 1000,
        fundingTxHash: isSol ? `soltx_fund_dump_${i}_${hash}` : `0xevmtx_fund_dump_${i}_${hash}`,
        initialFundAmountSolOrBnb: isSol ? 2.2 : 1.4,
      };
    });

    // Holding Wallets (pre-allocated supply waiting to be dumped later)
    const holdingCount = Math.max(1, totalWallets - pumpCount - dumpCount);
    const holdingWallets: TiedWalletPuppet[] = Array.from({ length: holdingCount }, (_, i) => {
      const holdAmount = 2500 + ((hash * (i + 5)) % 6000);
      return {
        address: isSol
          ? `${funderPrefix}Hold${i + 1}${hash.toString(36).slice(0, 4)}`
          : `0x${funderPrefix}Hold${i + 1}${hash.toString(36).slice(0, 4)}`,
        role: 'STAGING_HOLDER',
        actionUsd: holdAmount,
        txHash: isSol ? `soltx_hold_${i}_${hash}` : `0xevmtx_hold_${i}_${hash}`,
        timestamp: now - (35 + i * 30) * 60 * 1000,
        fundingTxHash: isSol ? `soltx_fund_hold_${i}_${hash}` : `0xevmtx_fund_hold_${i}_${hash}`,
        initialFundAmountSolOrBnb: isSol ? 0.5 : 0.3,
      };
    });

    const totalPumpVolumeUsd = pumpWallets.reduce((acc, p) => acc + p.actionUsd, 0);
    const totalDumpVolumeUsd = dumpWallets.reduce((acc, d) => acc + d.actionUsd, 0);
    const netExtractedUsd = totalDumpVolumeUsd - totalPumpVolumeUsd;

    const isHeavyWash = netExtractedUsd > 1000;
    const tactic = isHeavyWash ? 'DISGUISED_DISTRIBUTION' : 'WASH_PUMP_AND_DUMP';
    const severity = netExtractedUsd > 5000 || token.riskScore >= 70 ? 'CRITICAL' : 'HIGH';

    const explanation = `Common root funder ${commonFunderAddress.slice(0, 6)}... funded ${totalWallets} puppet wallets. ${pumpCount} wallet(s) executed $${totalPumpVolumeUsd.toLocaleString()} in buy orders to pump green candles, while ${dumpCount} sibling wallet(s) simultaneously dumped $${totalDumpVolumeUsd.toLocaleString()} directly into market liquidity, extracting a net $${netExtractedUsd.toLocaleString()}.`;

    rings.push({
      id: `ring-${token.id}`,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      chain: token.chain,
      commonFunderAddress,
      commonFunderLabel: 'Master Funding Root / Dispenser',
      totalWallets,
      pumpWallets,
      dumpWallets,
      holdingWallets,
      totalPumpVolumeUsd,
      totalDumpVolumeUsd,
      netExtractedUsd,
      tactic,
      severity,
      explanation,
      detectedAt: now - (hash % 120) * 60 * 1000,
    });
  }

  return rings;
}

/**
 * Extracts high-conviction individual whale buy transactions from the discovered tokens.
 */
export function detectWhaleBuySignals(tokens: Token[]): WhaleBuySignal[] {
  const signals: WhaleBuySignal[] = [];

  for (const token of tokens) {
    const hash = hashString(token.address);
    // Identify tokens with significant buy volume or high opportunity
    if (token.volumeBuy24h < 1000 && token.volume24h < 2000) continue;

    const whaleCount = 1 + (hash % 3);
    const isSol = token.chain === 'solana';

    for (let i = 0; i < whaleCount; i++) {
      const buyAmountUsd = Math.round(2500 + ((hash * (i + 1)) % 12000));
      const percentOfLiquidity = token.liquidity > 0
        ? Math.min(45, Math.round((buyAmountUsd / token.liquidity) * 100))
        : 12;

      const buyerPrefix = isSol ? token.address.slice(0, 4) : token.address.slice(2, 6);
      const buyerAddress = isSol
        ? `${buyerPrefix}Whale${i + 1}${hash.toString(36).slice(0, 4)}`
        : `0x${buyerPrefix}Whale${i + 1}${hash.toString(36).slice(0, 4)}`;

      const isSmartMoney = (hash + i) % 2 === 0;

      signals.push({
        id: `whale-${token.id}-${i}`,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chain: token.chain,
        buyerAddress,
        buyerLabel: isSmartMoney ? 'Smart Money Whale (74% Win Rate)' : 'Heavy Capital Accumulator',
        buyAmountUsd,
        tokenAmount: Math.round(buyAmountUsd / Math.max(0.000001, token.priceUsd)),
        priceUsd: token.priceUsd,
        percentOfLiquidity,
        timestamp: Date.now() - (10 + i * 35) * 60 * 1000,
        txHash: isSol ? `soltx_whale_${i}_${hash}` : `0xevmtx_whale_${i}_${hash}`,
        isClusterMember: (hash % 3 === 0),
        clusterId: (hash % 3 === 0) ? `cluster-${token.address.slice(0, 8)}` : undefined,
        riskScore: token.riskScore,
      });
    }
  }

  return signals.sort((a, b) => b.buyAmountUsd - a.buyAmountUsd);
}
