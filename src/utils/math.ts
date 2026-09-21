import { MultiplierKey, UpsideScenario, DownsideScenario, ScenarioAnalysis } from '../types/opportunity';
import { Token } from '../types/token';

const MULTIPLIER_MAP: { key: MultiplierKey; mult: number }[] = [
  { key: '2X', mult: 2 },
  { key: '5X', mult: 5 },
  { key: '10X', mult: 10 },
  { key: '20X', mult: 20 },
  { key: '50X', mult: 50 },
  { key: '100X', mult: 100 },
];

export function calculateUpsideScenarios(token: Token): UpsideScenario[] {
  const currentMcap = Math.max(1000, token.marketCap);
  const currentPrice = Math.max(0.000000001, token.priceUsd);
  const currentLiq = Math.max(500, token.liquidity);
  const currentHolders = Math.max(10, token.holdersCount);

  return MULTIPLIER_MAP.map(({ key, mult }) => {
    const targetMcap = currentMcap * mult;
    const targetPrice = currentPrice * mult;
    
    // In constant product AMM, pool depth typically needs to grow to support order flow
    // A healthy pool maintains ~12-20% liquidity-to-mcap ratio
    const requiredLiquidity = Math.max(currentLiq * Math.sqrt(mult), targetMcap * 0.15);
    
    // Net capital inflow required into bonding curve or AMM to shift price by factor mult
    // In CPMM (x*y=k), price = y/x. To 10x price, reserve of quote increases by sqrt(10) ≈ 3.16x
    const requiredCapitalInflowUsd = currentLiq * (Math.sqrt(mult) - 1);

    // Holder growth estimate needed to sustain volume distribution
    const requiredHolderMultiplier = Number((Math.sqrt(mult) * 1.5).toFixed(1));

    let feasibilityAssessment: UpsideScenario['feasibilityAssessment'] = 'PLAUSIBLE_MOMENTUM';
    if (mult >= 50 || targetMcap > 50_000_000) {
      feasibilityAssessment = 'EXTREME_SPECULATION';
    } else if (mult >= 10 || targetMcap > 10_000_000) {
      feasibilityAssessment = 'HIGH_FRICTION';
    }

    const prerequisites = [
      `Sustained net capital inflow of ~${Math.round(requiredCapitalInflowUsd).toLocaleString()} USD`,
      `Expansion of holder base by ${requiredHolderMultiplier}x (~${Math.round(currentHolders * requiredHolderMultiplier).toLocaleString()} total holders)`,
      `Liquidity pool depth scaled to at least $${Math.round(requiredLiquidity).toLocaleString()}`,
      `Zero major creator/insider dump events during accumulation phase`,
    ];

    return {
      multiple: key,
      targetMcap,
      targetPrice,
      requiredLiquidity,
      requiredCapitalInflowUsd,
      requiredHolderMultiplier,
      feasibilityAssessment,
      prerequisites,
    };
  });
}

export function calculateDownsideScenarios(token: Token): DownsideScenario[] {
  const currentMcap = Math.max(1000, token.marketCap);
  const currentPrice = Math.max(0.000000001, token.priceUsd);

  return [
    {
      label: 'Normal Correction (-50%)',
      dropPercent: -50,
      targetMcap: currentMcap * 0.5,
      targetPrice: currentPrice * 0.5,
      triggerEvent: 'Early buyers taking initial 2x profits; volume pauses.',
    },
    {
      label: 'Severe Selloff (-80%)',
      dropPercent: -80,
      targetMcap: currentMcap * 0.2,
      targetPrice: currentPrice * 0.2,
      triggerEvent: 'Wallet cluster co-exits; liquidity pool experiences sustained selling pressure.',
    },
    {
      label: 'Liquidity Pull / Abandonment (-99%)',
      dropPercent: -99,
      targetMcap: currentMcap * 0.01,
      targetPrice: currentPrice * 0.01,
      triggerEvent: 'Deployer removes liquidity, dumps treasury tokens, or sells remaining dev reserves.',
    },
  ];
}

export function buildScenarioAnalysis(token: Token): ScenarioAnalysis {
  return {
    tokenAddress: token.address,
    currentPrice: token.priceUsd,
    currentMcap: token.marketCap,
    currentLiquidity: token.liquidity,
    circulatingSupply: token.circulatingSupply,
    upsideScenarios: calculateUpsideScenarios(token),
    downsideScenarios: calculateDownsideScenarios(token),
    disclaimer: 'DISCLAIMER: Scenario calculations model mathematical capital requirements and liquidity dynamics under ideal liquidity conditions. They are NOT guarantees, predictions, or investment advice. Crypto token trading carries total loss risk.',
  };
}

export function calculatePnl(
  entryPrice: number,
  currentPrice: number,
  positionSizeUsd: number
): { pnlUsd: number; pnlPercent: number; currentValueUsd: number } {
  if (entryPrice <= 0) return { pnlUsd: 0, pnlPercent: 0, currentValueUsd: positionSizeUsd };
  const ratio = currentPrice / entryPrice;
  const currentValueUsd = positionSizeUsd * ratio;
  const pnlUsd = currentValueUsd - positionSizeUsd;
  const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  return { pnlUsd, pnlPercent, currentValueUsd };
}
