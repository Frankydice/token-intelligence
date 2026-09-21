import { Token } from '../types/token';
import { RugRiskAudit } from '../types/risk';
import { WalletCluster } from '../types/wallet';
import { TradeSetupDraft } from '../types/trade';
import { formatUsd } from '../utils/formatters';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface TelegramCallbackAction {
  action: 'APPROVE' | 'IGNORE';
  tokenAddress: string;
  entryPrice: number;
  positionSizeUsd: number;
  userId?: number;
  username?: string;
}

export class TelegramBotService {
  private config: TelegramConfig = {
    botToken: '',
    chatId: '',
    enabled: false,
  };

  private approvalCallbacks: ((draft: TradeSetupDraft, approvalProof: string) => void)[] = [];

  public setConfig(config: Partial<TelegramConfig>) {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): TelegramConfig {
    return { ...this.config };
  }

  public onApproval(callback: (draft: TradeSetupDraft, approvalProof: string) => void) {
    this.approvalCallbacks.push(callback);
    return () => {
      this.approvalCallbacks = this.approvalCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Formats a comprehensive Opportunity Report into a formatted Telegram message
   */
  public formatReportMessage(token: Token, risk?: RugRiskAudit, cluster?: WalletCluster): string {
    const lines = [
      `🚨 *TOKEN ALERT OPPORTUNITY REPORT*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Token:* $${token.symbol} (${token.name})`,
      `*Chain:* ${token.chain.toUpperCase()}`,
      `*Age:* ${token.ageHours} hours`,
      `*Current Price:* $${token.priceUsd.toFixed(6)}`,
      `*Market Cap:* ${formatUsd(token.marketCap)}`,
      `*Liquidity Pool:* ${formatUsd(token.liquidity)}`,
      `*24h Volume:* ${formatUsd(token.volume24h)}`,
      `*Holders:* ${token.holdersCount.toLocaleString()}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Opportunity Score:* ${token.opportunityScore}/100`,
      `*Structural Risk:* ${risk?.riskCategory || 'WATCH'} (${token.riskScore}/100)`,
    ];

    if (cluster) {
      lines.push(
        `*Cluster Activity:* ${cluster.label}`,
        `↳ ${cluster.walletCount} wallets entered in ${cluster.windowSeconds}s (${formatUsd(cluster.combinedPositionUsd)})`
      );
    }

    if (token.chain === 'solana' && risk?.solana) {
      lines.push(
        `*Solana Security:* Mint ${risk.solana.mintAuthority.toUpperCase()} • Freeze ${risk.solana.freezeAuthority.toUpperCase()} • LP ${risk.solana.lpBurnedPercent}% Burned`
      );
    }

    lines.push(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⚠️ *ACTION REQUIRED*: The bot will NOT buy automatically. Tap below to authorize entry conditions.`
    );

    return lines.join('\n');
  }

  /**
   * Sends an alert with inline approval buttons to the configured Telegram chat
   */
  public async sendOpportunityAlert(
    token: Token,
    risk?: RugRiskAudit,
    cluster?: WalletCluster
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    if (!this.config.enabled || !this.config.botToken || !this.config.chatId) {
      return {
        success: false,
        error: 'Telegram bot integration is not configured or disabled.',
      };
    }

    const text = this.formatReportMessage(token, risk, cluster);
    const defaultEntry = Number((token.priceUsd * 0.95).toFixed(6));

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: `✅ Approve Buy ($100 @ $${defaultEntry})`,
            callback_data: `APPROVE:${token.address}:${defaultEntry}:100`,
          },
        ],
        [
          {
            text: '❌ Ignore Token',
            callback_data: `IGNORE:${token.address}`,
          },
        ],
      ],
    };

    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text,
          parse_mode: 'Markdown',
          reply_markup: replyMarkup,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { success: false, error: data.description || `HTTP ${res.status}` };
      }

      return { success: true, messageId: data.result.message_id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  /**
   * Sends a test message to verify the Telegram bot credentials
   */
  public async sendTestMessage(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.botToken || !this.config.chatId) {
      return { success: false, error: 'Please enter Bot Token and Chat ID.' };
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: '🤖 *Token Intelligence & Sniper*: Telegram connection verified successfully!',
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { success: false, error: data.description || 'Failed to send message.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  /**
   * Parses incoming Telegram callback data string
   */
  public parseCallbackData(data: string): TelegramCallbackAction | null {
    if (!data) return null;
    const parts = data.split(':');
    if (parts[0] === 'APPROVE' && parts.length >= 4) {
      return {
        action: 'APPROVE',
        tokenAddress: parts[1],
        entryPrice: parseFloat(parts[2]) || 0,
        positionSizeUsd: parseFloat(parts[3]) || 100,
      };
    }
    if (parts[0] === 'IGNORE' && parts.length >= 2) {
      return {
        action: 'IGNORE',
        tokenAddress: parts[1],
        entryPrice: 0,
        positionSizeUsd: 0,
      };
    }
    return null;
  }

  /**
   * Dispatches a remote approval event into registered listeners
   */
  public dispatchRemoteApproval(draft: TradeSetupDraft, approvalProof: string) {
    this.approvalCallbacks.forEach((cb) => cb(draft, approvalProof));
  }
}

export const telegramBotService = new TelegramBotService();
