import { Chain } from '../types/token';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface TerminalAlert {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  severity: AlertSeverity;
  tokenAddress?: string;
  tokenSymbol?: string;
  chain?: Chain;
  actionAvailable?: 'REVIEW_REPORT' | 'VIEW_POSITION' | 'VIEW_AUDIT';
  read: boolean;
}

export class AlertEngine {
  private alerts: TerminalAlert[] = [];
  private listeners: ((alerts: TerminalAlert[]) => void)[] = [];

  public emitAlert(alert: Omit<TerminalAlert, 'id' | 'timestamp' | 'read'>): TerminalAlert {
    const fullAlert: TerminalAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };

    this.alerts.unshift(fullAlert);
    this.notifyListeners();
    return fullAlert;
  }

  public getAlerts(): TerminalAlert[] {
    return [...this.alerts];
  }

  public markAllAsRead() {
    this.alerts = this.alerts.map((a) => ({ ...a, read: true }));
    this.notifyListeners();
  }

  public subscribe(listener: (alerts: TerminalAlert[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l([...this.alerts]));
  }
}

export const alertEngine = new AlertEngine();
