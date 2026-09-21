import { Chain } from './token';
import { EvidenceItem, RiskLevel } from './developer';

export interface SolanaSecurity {
  mintAuthority: 'revoked' | 'active' | 'unknown';
  freezeAuthority: 'revoked' | 'active' | 'unknown';
  lpBurnedPercent: number;
  top10HoldersPercent: number;
  metadataMutable: boolean;
  pumpFunGraduated?: boolean;
}

export interface EvmSecurity {
  ownershipRenounced: boolean;
  isHoneypot: boolean;
  buyTaxPercent: number;
  sellTaxPercent: number;
  lpLockedPercent: number;
  top10HoldersPercent: number;
  isUpgradeableProxy: boolean;
  hasBlacklist: boolean;
}

export interface RugRiskAudit {
  tokenAddress: string;
  chain: Chain;
  overallRiskScore: number; // 0-100 (100 = critical rug risk)
  riskCategory: RiskLevel;
  solana?: SolanaSecurity;
  evm?: EvmSecurity;
  facts: EvidenceItem[];
  indicators: EvidenceItem[];
  inferences: EvidenceItem[];
  summary: string;
  creatorSellRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  liquidityRemovalRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  holderConcentrationRisk: 'HEALTHY' | 'MODERATE' | 'SEVERE';
}
