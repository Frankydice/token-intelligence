export interface FactorImpact {
  factor: string;
  points: number; // positive or negative
  evidence: string;
}

export interface OpportunityScore {
  score: number; // 0-100
  rating: 'LOW' | 'MODERATE' | 'HIGH' | 'EXCEPTIONAL';
  positiveFactors: FactorImpact[];
  negativeFactors: FactorImpact[];
  summary: string;
}

export type MultiplierKey = '2X' | '5X' | '10X' | '20X' | '50X' | '100X';

export interface UpsideScenario {
  multiple: MultiplierKey;
  targetMcap: number;
  targetPrice: number;
  requiredLiquidity: number;
  requiredCapitalInflowUsd: number;
  requiredHolderMultiplier: number;
  feasibilityAssessment: 'PLAUSIBLE_MOMENTUM' | 'HIGH_FRICTION' | 'EXTREME_SPECULATION';
  prerequisites: string[];
}

export interface DownsideScenario {
  label: string;
  dropPercent: number;
  targetMcap: number;
  targetPrice: number;
  triggerEvent: string;
}

export interface ScenarioAnalysis {
  tokenAddress: string;
  currentPrice: number;
  currentMcap: number;
  currentLiquidity: number;
  circulatingSupply: number;
  upsideScenarios: UpsideScenario[];
  downsideScenarios: DownsideScenario[];
  disclaimer: string;
}
