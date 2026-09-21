import { TradeSetup, Position } from '../types/trade';
import { AuditLogEntry } from '../types/audit';

export interface PersistedAppSettings {
  maxPositionSizeUsd: number;
  maxDailyLossUsd: number;
  maxSlippagePercent: number;
  solanaRpcUrl: string;
  bscRpcUrl: string;
  solanaWsUrl: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramAlertsEnabled: boolean;
}

export const DEFAULT_APP_SETTINGS: PersistedAppSettings = {
  maxPositionSizeUsd: 500,
  maxDailyLossUsd: 1000,
  maxSlippagePercent: 3.0,
  solanaRpcUrl: 'https://api.mainnet-beta.solana.com',
  bscRpcUrl: 'https://bsc-dataseed.binance.org',
  solanaWsUrl: 'wss://api.mainnet-beta.solana.com',
  telegramBotToken: '',
  telegramChatId: '',
  telegramAlertsEnabled: false,
};

const STORAGE_KEYS = {
  SETUPS: 'token_intel_pending_setups',
  OPEN_POSITIONS: 'token_intel_open_positions',
  CLOSED_POSITIONS: 'token_intel_closed_positions',
  AUDIT_LOGS: 'token_intel_audit_logs',
  SETTINGS: 'token_intel_settings',
  WATCHLIST: 'token_intel_watchlist',
};

export class StorageService {
  private memoryFallback = new Map<string, string>();

  private getItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryFallback.get(key) || null;
      }
    }
    return this.memoryFallback.get(key) || null;
  }

  private setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        this.memoryFallback.set(key, value);
        return;
      }
    }
    this.memoryFallback.set(key, value);
  }

  private removeItem(key: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        this.memoryFallback.delete(key);
      }
    }
    this.memoryFallback.delete(key);
  }

  /**
   * Save pending trade setups
   */
  public async savePendingSetups(setups: TradeSetup[]): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.SETUPS, JSON.stringify(setups));
    } catch (err) {
      console.warn('[StorageService] Error saving pending setups:', err);
    }
  }

  /**
   * Load pending trade setups
   */
  public async loadPendingSetups(): Promise<TradeSetup[]> {
    try {
      const data = this.getItem(STORAGE_KEYS.SETUPS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save open positions
   */
  public async saveOpenPositions(positions: Position[]): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.OPEN_POSITIONS, JSON.stringify(positions));
    } catch (err) {
      console.warn('[StorageService] Error saving open positions:', err);
    }
  }

  /**
   * Load open positions
   */
  public async loadOpenPositions(): Promise<Position[]> {
    try {
      const data = this.getItem(STORAGE_KEYS.OPEN_POSITIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save closed positions history
   */
  public async saveClosedPositions(positions: Position[]): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.CLOSED_POSITIONS, JSON.stringify(positions));
    } catch (err) {
      console.warn('[StorageService] Error saving closed positions:', err);
    }
  }

  /**
   * Load closed positions history
   */
  public async loadClosedPositions(): Promise<Position[]> {
    try {
      const data = this.getItem(STORAGE_KEYS.CLOSED_POSITIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save audit logs
   */
  public async saveAuditLogs(logs: AuditLogEntry[]): Promise<void> {
    try {
      // Keep most recent 500 logs to prevent localStorage quota exhaustion
      const trimmed = logs.slice(0, 500);
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('[StorageService] Error saving audit logs:', err);
    }
  }

  /**
   * Load audit logs
   */
  public async loadAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const data = this.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save settings
   */
  public async saveSettings(settings: PersistedAppSettings): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('[StorageService] Error saving settings:', err);
    }
  }

  /**
   * Load settings
   */
  public async loadSettings(): Promise<PersistedAppSettings> {
    try {
      const data = this.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(data) } : DEFAULT_APP_SETTINGS;
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  /**
   * Export all audit logs as a downloadable JSON string
   */
  public exportAuditLogsJson(logs: AuditLogEntry[]): string {
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Clear all stored application state
   */
  public clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => this.removeItem(key));
  }
}

export const storageService = new StorageService();
