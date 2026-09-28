export type MarketSessionId = 'ASIA' | 'EUROPE' | 'US' | 'DEAD_ZONE';

export interface MarketSessionInfo {
  utcTimeString: string;
  utcHour: number;
  utcMinute: number;
  activeSessions: MarketSessionId[];
  primarySession: MarketSessionId;
  sessionName: string;
  sessionBadge: string;
  isApexOverlap: boolean; // 13:00 - 15:00 UTC (EU + US overlap)
  isGoldenWindow: boolean; // 13:00 - 18:00 UTC (Peak breakout window)
  isDeadZone: boolean; // 21:00 - 00:00 UTC (Thin liquidity / touch grass)
  liquidityTier: 'MAXIMUM' | 'HIGH' | 'MODERATE' | 'LOW';
  volumeMultiplier: string;
  optimalAction: string;
  playbookGuidance: string;
}

/**
 * Market Session & Time-Window Engine
 * Grounded in Chapter 16 of "The Ultimate Memecoin Playbook for Noobs"
 * ("Timing and Market Sessions: When to Trade & When to Touch Grass")
 *
 * Session Windows (UTC):
 * - Asia Session (Tokyo / Singapore): 00:00 - 08:00 UTC (Retail pump.fun, lower priority fees)
 * - Europe Session (London / Frankfurt): 07:00 - 15:00 UTC (Raydium graduations, steady volume)
 * - US Session (New York): 13:00 - 21:00 UTC (Peak liquidity, highest breakout win-rate)
 * - Apex Overlap (EU + US): 13:00 - 15:00 UTC (Double global liquidity wave)
 * - Dead Zone (Late US / Pre-Asia): 21:00 - 00:00 UTC (Thin liquidity, wider spreads, touch grass)
 */
export class MarketSessionEngine {
  /**
   * Evaluates the current market session state for a given Date (defaults to now).
   */
  public getSessionInfo(date: Date = new Date()): MarketSessionInfo {
    const utcHour = date.getUTCHours();
    const utcMinute = date.getUTCMinutes();
    const utcSecond = date.getUTCSeconds();

    const pad = (n: number) => n.toString().padStart(2, '0');
    const utcTimeString = `${pad(utcHour)}:${pad(utcMinute)}:${pad(utcSecond)} UTC`;

    const activeSessions: MarketSessionId[] = [];

    // Check Asia: 00:00 to 08:00 UTC
    if (utcHour >= 0 && utcHour < 8) {
      activeSessions.push('ASIA');
    }

    // Check Europe: 07:00 to 15:00 UTC
    if (utcHour >= 7 && utcHour < 15) {
      activeSessions.push('EUROPE');
    }

    // Check US: 13:00 to 21:00 UTC
    if (utcHour >= 13 && utcHour < 21) {
      activeSessions.push('US');
    }

    // Check Dead Zone: 21:00 to 24:00 (00:00) UTC
    if (utcHour >= 21) {
      activeSessions.push('DEAD_ZONE');
    }

    const isApexOverlap = utcHour >= 13 && utcHour < 15;
    const isGoldenWindow = utcHour >= 13 && utcHour < 18;
    const isDeadZone = utcHour >= 21 || activeSessions.includes('DEAD_ZONE');

    let primarySession: MarketSessionId = 'ASIA';
    let sessionName = 'Asia Session';
    let sessionBadge = '🌏 ASIA';
    let liquidityTier: 'MAXIMUM' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
    let volumeMultiplier = '1.0x';
    let optimalAction = 'Micro-cap snipes & Chinese narrative tokens';
    let playbookGuidance =
      'Playbook Rule (Ch. 16): Lower priority gas fees. Active retail volume on pump.fun. Watch for Chinese community momentum.';

    if (isApexOverlap) {
      primarySession = 'US';
      sessionName = 'EU + US Apex Overlap';
      sessionBadge = '🔥 APEX OVERLAP';
      liquidityTier = 'MAXIMUM';
      volumeMultiplier = '3.5x';
      optimalAction = 'Highest win-rate: 100k Reclaims & Secondary DEX breakouts';
      playbookGuidance =
        'Playbook Rule (Ch. 16): Golden Apex Hour. London and New York overlapping liquidity. Highest breakout completion percentage in memecoins.';
    } else if (isGoldenWindow) {
      primarySession = 'US';
      sessionName = 'US Session (Golden Window)';
      sessionBadge = '🇺🇸 US GOLDEN';
      liquidityTier = 'HIGH';
      volumeMultiplier = '2.8x';
      optimalAction = 'Aggressive size on confirmed 100k reclaims';
      playbookGuidance =
        'Playbook Rule (Ch. 16): Peak American equity & crypto hours. Massive whale volume entries and sustained trend pushes.';
    } else if (utcHour >= 18 && utcHour < 21) {
      primarySession = 'US';
      sessionName = 'Late US Session';
      sessionBadge = '🇺🇸 US LATE';
      liquidityTier = 'MODERATE';
      volumeMultiplier = '1.4x';
      optimalAction = 'Tighten stop losses & take profits';
      playbookGuidance =
        'Playbook Rule (Ch. 16): US trading winds down. Lock in runner profits before the low-liquidity dead zone.';
    } else if (activeSessions.includes('EUROPE')) {
      primarySession = 'EUROPE';
      sessionName = 'Europe Session';
      sessionBadge = '🇪🇺 EUROPE';
      liquidityTier = 'HIGH';
      volumeMultiplier = '1.8x';
      optimalAction = 'Raydium graduations & European breakout screening';
      playbookGuidance =
        'Playbook Rule (Ch. 16): Solid morning momentum. Raydium graduation volume filters out overnight low-effort launches.';
    } else if (isDeadZone) {
      primarySession = 'DEAD_ZONE';
      sessionName = 'Dead Zone (Touch Grass)';
      sessionBadge = '🌙 TOUCH GRASS';
      liquidityTier = 'LOW';
      volumeMultiplier = '0.3x';
      optimalAction = 'Step away, review journal, avoid forced trades';
      playbookGuidance =
        'Playbook Rule (Ch. 16): Thin liquidity window. Slippage is high, spreads widen, and bot rugs thrive. High-probability setups dry up until Asia open.';
    }

    return {
      utcTimeString,
      utcHour,
      utcMinute,
      activeSessions,
      primarySession,
      sessionName,
      sessionBadge,
      isApexOverlap,
      isGoldenWindow,
      isDeadZone,
      liquidityTier,
      volumeMultiplier,
      optimalAction,
      playbookGuidance,
    };
  }
}

export const marketSessionEngine = new MarketSessionEngine();
