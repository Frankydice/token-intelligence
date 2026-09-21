import { useState, useEffect, useCallback, useMemo } from 'react';
import { Token, TokenFilter, Chain } from '../types/token';
import { TradeSetup, Position, TradeSetupDraft } from '../types/trade';
import { AuditLogEntry } from '../types/audit';
import { TerminalAlert, alertEngine } from '../engines/alertEngine';
import { auditLogEngine } from '../engines/auditLogEngine';
import { providerRegistry } from '../providers/providerRegistry';
import { tradeSetupEngine } from '../engines/tradeSetupEngine';
import { entryMonitorEngine } from '../engines/entryMonitorEngine';
import { positionMonitorEngine } from '../engines/positionMonitorEngine';
import { exitEngine } from '../engines/exitEngine';
import { DEMO_TOKENS } from '../providers/demoDataProvider';
import { storageService, PersistedAppSettings, DEFAULT_APP_SETTINGS } from '../services/storageService';
import { telegramBotService } from '../services/telegramBotService';
import { solanaWsListener, SolanaWsStatus } from '../providers/solanaWebSocketListener';

export interface TradingState {
  tokens: Token[];
  selectedToken: Token | null;
  filter: TokenFilter;
  activeNav: string;
  detailTab: string;
  pendingSetups: TradeSetup[];
  openPositions: Position[];
  closedPositions: Position[];
  auditLogs: AuditLogEntry[];
  alerts: TerminalAlert[];
  isDemoMode: boolean;
  isKillSwitchActive: boolean;
  reportModalToken: Token | null;
  tradeModalToken: Token | null;
  isKillSwitchModalOpen: boolean;
  isScanning: boolean;
  simulationRunning: boolean;
  solanaWsStatus: SolanaWsStatus;
  settings: PersistedAppSettings;
}

// Initial state singleton
let globalState: TradingState = {
  tokens: DEMO_TOKENS,
  selectedToken: DEMO_TOKENS[1] || DEMO_TOKENS[0],
  filter: {
    chain: 'all',
    maxAgeHours: 720,
    minLiquidity: 0,
    minMarketCap: 0,
    minVolume24h: 0,
    minHolders: 0,
    minOpportunityScore: 0,
    maxRiskScore: 100,
    tag: 'all',
  },
  activeNav: 'DISCOVER',
  detailTab: 'overview',
  pendingSetups: [],
  openPositions: [],
  closedPositions: [],
  auditLogs: auditLogEngine.getLogs(),
  alerts: [],
  isDemoMode: true,
  isKillSwitchActive: false,
  reportModalToken: null,
  tradeModalToken: null,
  isKillSwitchModalOpen: false,
  isScanning: false,
  simulationRunning: true,
  solanaWsStatus: solanaWsListener.getStatus(),
  settings: DEFAULT_APP_SETTINGS,
};

const listeners = new Set<(state: TradingState) => void>();

function notify() {
  globalState = { ...globalState, auditLogs: auditLogEngine.getLogs() };
  listeners.forEach((l) => l(globalState));

  // Auto-sync persistent storage
  storageService.savePendingSetups(globalState.pendingSetups);
  storageService.saveOpenPositions(globalState.openPositions);
  storageService.saveClosedPositions(globalState.closedPositions);
  storageService.saveAuditLogs(globalState.auditLogs);
  storageService.saveSettings(globalState.settings);
}

// Initialize and hydrate persistent storage once
let isHydrated = false;
async function hydrateStorage() {
  if (isHydrated) return;
  isHydrated = true;

  try {
    const savedSetups = await storageService.loadPendingSetups();
    const savedOpen = await storageService.loadOpenPositions();
    const savedClosed = await storageService.loadClosedPositions();
    const savedLogs = await storageService.loadAuditLogs();
    const savedSettings = await storageService.loadSettings();

    if (savedSetups.length > 0) globalState.pendingSetups = savedSetups;
    if (savedOpen.length > 0) globalState.openPositions = savedOpen;
    if (savedClosed.length > 0) globalState.closedPositions = savedClosed;
    if (savedLogs.length > 0) {
      savedLogs.forEach((l) => auditLogEngine.recordEntry(l));
    }
    if (savedSettings) {
      globalState.settings = savedSettings;
      telegramBotService.setConfig({
        botToken: savedSettings.telegramBotToken || '',
        chatId: savedSettings.telegramChatId || '',
        enabled: savedSettings.telegramAlertsEnabled,
      });
    }

    notify();
  } catch (err) {
    console.warn('[useTradingStore] Storage hydration error:', err);
  }
}

// Wire up Telegram remote approval dispatcher
telegramBotService.onApproval((draft, approvalProof) => {
  const res = tradeSetupEngine.approveTradeSetup(draft);
  if (res.success && res.setup) {
    const setup = res.setup;
    setup.userApprovalToken = approvalProof;
    setup.isDemo = globalState.isDemoMode;

    globalState = {
      ...globalState,
      pendingSetups: [...globalState.pendingSetups, setup],
    };

    auditLogEngine.recordEntry({
      action: 'USER_APPROVED_TRADE',
      summary: `Remote Telegram Approval: $${setup.tokenSymbol}`,
      details: `User approved trade setup via Telegram inline button. Entry: $${setup.entryTriggerPrice} | Size: $${setup.positionSizeUsd} | TP: $${setup.takeProfitPrice} | Proof: ${approvalProof}`,
      tokenAddress: setup.tokenAddress,
      tokenSymbol: setup.tokenSymbol,
      chain: setup.chain,
      actor: 'HUMAN_USER',
      isDemo: globalState.isDemoMode,
      metadata: { approvalProof, channel: 'TELEGRAM' },
    });

    alertEngine.emitAlert({
      title: `Telegram Approval: $${setup.tokenSymbol}`,
      message: `Remote approval received. Monitoring price for entry at $${setup.entryTriggerPrice}.`,
      severity: 'success',
      tokenAddress: setup.tokenAddress,
      tokenSymbol: setup.tokenSymbol,
      chain: setup.chain,
      actionAvailable: 'VIEW_POSITION',
    });

    notify();
  }
});

// Wire up Solana WebSocket real-time launch stream
solanaWsListener.onStatusChange((status) => {
  globalState = { ...globalState, solanaWsStatus: status };
  notify();
});

solanaWsListener.onNewLaunch((event) => {
  const token = solanaWsListener.createTokenFromLaunch(event);

  // Add to front of tokens list if not already present
  if (!globalState.tokens.some((t) => t.address === token.address)) {
    globalState = {
      ...globalState,
      tokens: [token, ...globalState.tokens],
    };

    auditLogEngine.recordEntry({
      action: 'TOKEN_DISCOVERED',
      summary: `Solana Launch Detected via WebSocket: $${token.symbol}`,
      details: `Platform: ${event.platform.toUpperCase()} • Signature: ${event.signature.slice(0, 16)}...`,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      chain: 'solana',
      actor: 'BOT_AUTONOMOUS',
      isDemo: false,
    });

    alertEngine.emitAlert({
      title: `Solana WebSocket Mint: $${token.symbol}`,
      message: `Newly initialized ${event.platform.toUpperCase()} token. Opportunity audit initiated.`,
      severity: 'info',
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      chain: 'solana',
      actionAvailable: 'REVIEW_REPORT',
    });

    notify();
  }
});

export function useTradingStore() {
  const [state, setState] = useState<TradingState>(globalState);

  useEffect(() => {
    hydrateStorage();
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setFilter = useCallback((newFilter: Partial<TokenFilter>) => {
    globalState = {
      ...globalState,
      filter: { ...globalState.filter, ...newFilter },
    };
    notify();
  }, []);

  const setSelectedToken = useCallback((token: Token | null) => {
    globalState = { ...globalState, selectedToken: token };
    notify();
  }, []);

  const setActiveNav = useCallback((nav: string) => {
    globalState = { ...globalState, activeNav: nav };
    notify();
  }, []);

  const setDetailTab = useCallback((tab: string) => {
    globalState = { ...globalState, detailTab: tab };
    notify();
  }, []);

  const setMode = useCallback((demo: boolean) => {
    providerRegistry.setMode(demo);
    globalState = {
      ...globalState,
      isDemoMode: demo,
    };
    auditLogEngine.recordEntry({
      action: 'ANALYSIS_GENERATED',
      summary: `Mode Switched to ${demo ? 'DEMO MODE' : 'LIVE DATA MODE'}`,
      details: demo
        ? 'Using deterministic simulation providers for safe testing.'
        : 'Connecting to live DexScreener & public RPC feeds.',
      actor: 'HUMAN_USER',
      isDemo: demo,
    });
    notify();
    refreshTokens();
  }, []);

  const toggleKillSwitch = useCallback((active: boolean, reason?: string) => {
    globalState = {
      ...globalState,
      isKillSwitchActive: active,
      isKillSwitchModalOpen: false,
    };
    auditLogEngine.recordEntry({
      action: 'KILL_SWITCH_ACTIVATED',
      summary: active ? 'EMERGENCY KILL SWITCH ENGAGED' : 'Kill Switch Disarmed',
      details: reason || (active ? 'User initiated emergency kill switch. All trading halted.' : 'Trading resumed by user.'),
      actor: 'HUMAN_USER',
      isDemo: globalState.isDemoMode,
    });
    alertEngine.emitAlert({
      title: active ? 'KILL SWITCH ENGAGED' : 'Kill Switch Disarmed',
      message: active ? 'All pending orders frozen and trading engine halted.' : 'Trading engine returned to normal state.',
      severity: active ? 'critical' : 'info',
    });
    notify();
  }, []);

  const openOpportunityReport = useCallback((token: Token) => {
    globalState = { ...globalState, reportModalToken: token };
    auditLogEngine.recordEntry({
      action: 'USER_REPORT_NOTIFIED',
      summary: `Opportunity Report Opened for ${token.symbol}`,
      details: `User inspecting comprehensive discovery report for ${token.name} (${token.address}) on ${token.chain.toUpperCase()}.`,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      chain: token.chain,
      actor: 'HUMAN_USER',
      isDemo: globalState.isDemoMode,
    });

    // If Telegram alerts enabled, automatically dispatch notification to Telegram chat!
    if (globalState.settings.telegramAlertsEnabled && globalState.settings.telegramBotToken) {
      telegramBotService.sendOpportunityAlert(token);
    }

    notify();
  }, []);

  const closeOpportunityReport = useCallback(() => {
    globalState = { ...globalState, reportModalToken: null };
    notify();
  }, []);

  const openTradeSetup = useCallback((token: Token) => {
    globalState = {
      ...globalState,
      reportModalToken: null,
      tradeModalToken: token,
    };
    notify();
  }, []);

  const closeTradeSetup = useCallback(() => {
    globalState = { ...globalState, tradeModalToken: null };
    notify();
  }, []);

  const approveTradeSetup = useCallback((draft: TradeSetupDraft) => {
    if (globalState.isKillSwitchActive) {
      alertEngine.emitAlert({
        title: 'Execution Blocked',
        message: 'Cannot approve trade setup while Kill Switch is active.',
        severity: 'critical',
      });
      return false;
    }

    const res = tradeSetupEngine.approveTradeSetup(draft);
    if (!res.success || !res.setup) {
      alertEngine.emitAlert({
        title: 'Validation Failed',
        message: res.errors?.join(' ') || 'Invalid parameters',
        severity: 'warning',
      });
      return false;
    }

    const setup = res.setup;
    setup.isDemo = globalState.isDemoMode;

    globalState = {
      ...globalState,
      pendingSetups: [...globalState.pendingSetups, setup],
      tradeModalToken: null,
      activeNav: 'SETUPS',
    };

    auditLogEngine.recordEntry({
      action: 'USER_APPROVED_TRADE',
      summary: `User Approved Trade Setup for ${setup.tokenSymbol}`,
      details: `Entry target: $${setup.entryTriggerPrice} | Size: $${setup.positionSizeUsd} | TP: $${setup.takeProfitPrice} (+${setup.takeProfitPercent}%) | SL: $${setup.stopLossPrice} (-${setup.stopLossPercent}%). Waiting for market trigger.`,
      tokenAddress: setup.tokenAddress,
      tokenSymbol: setup.tokenSymbol,
      chain: setup.chain,
      actor: 'HUMAN_USER',
      isDemo: globalState.isDemoMode,
      metadata: { approvalToken: setup.userApprovalToken },
    });

    alertEngine.emitAlert({
      title: 'Trade Setup Approved',
      message: `Bot is now monitoring ${setup.tokenSymbol}. Waiting for market price to reach $${setup.entryTriggerPrice}.`,
      severity: 'info',
      tokenAddress: setup.tokenAddress,
      tokenSymbol: setup.tokenSymbol,
      chain: setup.chain,
      actionAvailable: 'VIEW_POSITION',
    });

    notify();
    return true;
  }, []);

  const cancelTradeSetup = useCallback((setupId: string) => {
    const target = globalState.pendingSetups.find((s) => s.id === setupId);
    globalState = {
      ...globalState,
      pendingSetups: globalState.pendingSetups.filter((s) => s.id !== setupId),
    };

    if (target) {
      auditLogEngine.recordEntry({
        action: 'USER_CANCELLED_SETUP',
        summary: `User Cancelled Setup for ${target.tokenSymbol}`,
        details: `Pending order for ${target.tokenSymbol} cancelled before entry condition was met.`,
        tokenAddress: target.tokenAddress,
        tokenSymbol: target.tokenSymbol,
        chain: target.chain,
        actor: 'HUMAN_USER',
        isDemo: globalState.isDemoMode,
      });
    }

    notify();
  }, []);

  const manualClosePosition = useCallback(async (positionId: string) => {
    const pos = globalState.openPositions.find((p) => p.id === positionId);
    if (!pos) return;

    const res = await providerRegistry.execution.executeExit(pos, pos.currentPrice, 'MANUAL_USER_EXIT');
    if (res.success) {
      const closedPos: Position = {
        ...pos,
        status: 'CLOSED',
        exitTimestamp: Date.now(),
        exitPrice: res.executedPrice,
        exitTxHash: res.txHash,
        exitReason: 'MANUAL_USER_EXIT',
        realizedPnlUsd: res.realizedPnlUsd,
        realizedPnlPercent: res.realizedPnlPercent,
      };

      globalState = {
        ...globalState,
        openPositions: globalState.openPositions.filter((p) => p.id !== positionId),
        closedPositions: [closedPos, ...globalState.closedPositions],
      };

      auditLogEngine.recordEntry({
        action: 'POSITION_CLOSED',
        summary: `Manual Exit Executed for ${pos.tokenSymbol}`,
        details: `Closed at $${res.executedPrice} | Realized PnL: ${res.realizedPnlUsd >= 0 ? '+' : ''}$${res.realizedPnlUsd.toFixed(2)} (${res.realizedPnlPercent.toFixed(2)}%) | Tx: ${res.txHash}`,
        tokenAddress: pos.tokenAddress,
        tokenSymbol: pos.tokenSymbol,
        chain: pos.chain,
        actor: 'HUMAN_USER',
        isDemo: globalState.isDemoMode,
      });

      notify();
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    globalState = { ...globalState, isScanning: true };
    notify();

    try {
      const tokens = await providerRegistry.tokenDiscovery.discoverTokens(
        globalState.filter.chain === 'all' ? undefined : (globalState.filter.chain as Chain)
      );
      globalState = {
        ...globalState,
        tokens: tokens.length > 0 ? tokens : DEMO_TOKENS,
        isScanning: false,
      };
      notify();
    } catch {
      globalState = { ...globalState, isScanning: false };
      notify();
    }
  }, []);

  const runFullDemoScenario = useCallback(async () => {
    if (globalState.isKillSwitchActive) {
      alertEngine.emitAlert({
        title: 'Demo Blocked',
        message: 'Kill Switch is active. Disarm Kill Switch first.',
        severity: 'critical',
      });
      return;
    }

    const targetToken = DEMO_TOKENS.find((t) => t.symbol === 'CYBERDOGE') || DEMO_TOKENS[1];
    setSelectedToken(targetToken);
    setActiveNav('DISCOVER');

    alertEngine.emitAlert({
      title: 'Demo Scenario Initiated',
      message: `Discovered new token $${targetToken.symbol} on ${targetToken.chain.toUpperCase()} (7 hours old).`,
      severity: 'info',
      tokenAddress: targetToken.address,
      tokenSymbol: targetToken.symbol,
      chain: targetToken.chain,
    });

    openOpportunityReport(targetToken);
  }, [openOpportunityReport, setSelectedToken, setActiveNav]);

  const tickSimulation = useCallback(async () => {
    if (globalState.isKillSwitchActive) return;

    let hasChanges = false;
    const nowPending = [...globalState.pendingSetups];
    const nowOpen = [...globalState.openPositions];
    const nowClosed = [...globalState.closedPositions];

    // Check pending setups
    for (let i = nowPending.length - 1; i >= 0; i--) {
      const setup = nowPending[i];
      const token = globalState.tokens.find((t) => t.address.toLowerCase() === setup.tokenAddress.toLowerCase());
      if (!token) continue;

      const simulatedPrice = Math.min(token.priceUsd, setup.entryTriggerPrice);
      const entryCheck = entryMonitorEngine.evaluateEntryCondition(setup, simulatedPrice);

      if (entryCheck.triggered) {
        const exec = await providerRegistry.execution.executeEntry(setup, simulatedPrice);
        if (exec.success) {
          nowPending.splice(i, 1);
          const newPos: Position = {
            id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            setupId: setup.id,
            tokenAddress: setup.tokenAddress,
            tokenSymbol: setup.tokenSymbol,
            tokenName: setup.tokenName,
            chain: setup.chain,
            entryPrice: exec.executedPrice,
            entryTimestamp: Date.now(),
            entryTxHash: exec.txHash,
            currentPrice: exec.executedPrice,
            positionSizeUsd: exec.executedSizeUsd,
            tokenAmount: exec.tokenAmount,
            currentValueUsd: exec.executedSizeUsd,
            unrealizedPnlUsd: 0,
            unrealizedPnlPercent: 0,
            takeProfitPrice: setup.takeProfitPrice,
            stopLossPrice: setup.stopLossPrice,
            trailingStopPrice: setup.trailingStopPercent
              ? exec.executedPrice * (1 - setup.trailingStopPercent / 100)
              : undefined,
            maxPriceObserved: exec.executedPrice,
            status: 'OPEN',
            isDemo: globalState.isDemoMode,
          };
          nowOpen.push(newPos);

          auditLogEngine.recordEntry({
            action: 'ORDER_EXECUTED',
            summary: `Entry Trigger Executed for ${setup.tokenSymbol}`,
            details: `Filled at $${exec.executedPrice.toFixed(6)} | Size: $${exec.executedSizeUsd} | Slippage: ${exec.slippagePercent.toFixed(2)}% | Tx: ${exec.txHash}`,
            tokenAddress: setup.tokenAddress,
            tokenSymbol: setup.tokenSymbol,
            chain: setup.chain,
            actor: 'BOT_AUTONOMOUS',
            isDemo: globalState.isDemoMode,
          });

          alertEngine.emitAlert({
            title: `Entry Executed: $${setup.tokenSymbol}`,
            message: `Condition reached. Position opened at $${exec.executedPrice.toFixed(6)}.`,
            severity: 'success',
            tokenAddress: setup.tokenAddress,
            tokenSymbol: setup.tokenSymbol,
            chain: setup.chain,
            actionAvailable: 'VIEW_POSITION',
          });

          hasChanges = true;
        }
      }
    }

    // Check open positions
    for (let j = nowOpen.length - 1; j >= 0; j--) {
      const pos = nowOpen[j];
      const simulatedPrice = pos.takeProfitPrice;

      const updateRes = positionMonitorEngine.updatePosition(pos, simulatedPrice);
      nowOpen[j] = updateRes.updatedPosition;

      const exitCheck = exitEngine.evaluateExitConditions(nowOpen[j], simulatedPrice);
      if (exitCheck.shouldExit && exitCheck.reason) {
        const exitExec = await providerRegistry.execution.executeExit(nowOpen[j], simulatedPrice, exitCheck.reason);
        if (exitExec.success) {
          const closed: Position = {
            ...nowOpen[j],
            status: 'CLOSED',
            exitTimestamp: Date.now(),
            exitPrice: exitExec.executedPrice,
            exitTxHash: exitExec.txHash,
            exitReason: exitCheck.reason,
            realizedPnlUsd: exitExec.realizedPnlUsd,
            realizedPnlPercent: exitExec.realizedPnlPercent,
          };
          nowOpen.splice(j, 1);
          nowClosed.unshift(closed);

          auditLogEngine.recordEntry({
            action: 'POSITION_CLOSED',
            summary: `${exitCheck.reason} Reached for ${closed.tokenSymbol}`,
            details: `Exit executed at $${exitExec.executedPrice.toFixed(6)} | Realized PnL: +$${exitExec.realizedPnlUsd.toFixed(2)} (+${exitExec.realizedPnlPercent.toFixed(2)}%) | Tx: ${exitExec.txHash}`,
            tokenAddress: closed.tokenAddress,
            tokenSymbol: closed.tokenSymbol,
            chain: closed.chain,
            actor: 'BOT_AUTONOMOUS',
            isDemo: globalState.isDemoMode,
          });

          alertEngine.emitAlert({
            title: `Take Profit Triggered: $${closed.tokenSymbol}`,
            message: `Position closed with +$${exitExec.realizedPnlUsd.toFixed(2)} profit (+${exitExec.realizedPnlPercent.toFixed(2)}%).`,
            severity: 'success',
            tokenAddress: closed.tokenAddress,
            tokenSymbol: closed.tokenSymbol,
            chain: closed.chain,
            actionAvailable: 'VIEW_AUDIT',
          });

          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      globalState = {
        ...globalState,
        pendingSetups: nowPending,
        openPositions: nowOpen,
        closedPositions: nowClosed,
      };
      notify();
    }
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<PersistedAppSettings>) => {
    const merged = { ...globalState.settings, ...newSettings };
    globalState = { ...globalState, settings: merged };
    telegramBotService.setConfig({
      botToken: merged.telegramBotToken || '',
      chatId: merged.telegramChatId || '',
      enabled: merged.telegramAlertsEnabled,
    });
    notify();
  }, []);

  // Connect or Disconnect Solana WebSocket
  const toggleSolanaWs = useCallback((connect: boolean) => {
    if (connect) {
      solanaWsListener.setEndpoint(globalState.settings.solanaWsUrl);
      solanaWsListener.connect();
    } else {
      solanaWsListener.disconnect();
    }
  }, []);

  // Simulate Telegram Remote Approval (for testing when no live Bot is hooked up)
  const simulateTelegramApproval = useCallback((token: Token) => {
    const entryTarget = Number((token.priceUsd * 0.95).toFixed(6));
    const draft: TradeSetupDraft = {
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      chain: token.chain,
      currentPrice: token.priceUsd,
      entryTriggerPrice: entryTarget,
      positionSizeUsd: 100,
      takeProfitPercent: 100,
      takeProfitPrice: Number((entryTarget * 2).toFixed(6)),
      stopLossPercent: 30,
      stopLossPrice: Number((entryTarget * 0.7).toFixed(6)),
      maxSlippagePercent: 3.0,
      orderType: 'TRIGGER_LIMIT',
      expiryHours: 24,
    };
    telegramBotService.dispatchRemoteApproval(draft, `TELEGRAM_SIMULATED_PROOF_${Date.now()}`);
  }, []);

  // Export audit logs JSON
  const exportAuditLogsJson = useCallback(() => {
    return storageService.exportAuditLogsJson(globalState.auditLogs);
  }, []);

  const filteredTokens = useMemo(() => {
    return state.tokens.filter((t) => {
      if (state.filter.chain !== 'all' && t.chain !== state.filter.chain) return false;
      if (state.filter.tag && state.filter.tag !== 'all' && !t.tags.includes(state.filter.tag)) return false;
      if (t.liquidity < state.filter.minLiquidity) return false;
      if (t.opportunityScore < state.filter.minOpportunityScore) return false;
      if (t.riskScore > state.filter.maxRiskScore) return false;
      if (t.ageHours > state.filter.maxAgeHours) return false;
      if (state.filter.searchQuery) {
        const q = state.filter.searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.tokens, state.filter]);

  return {
    ...state,
    filteredTokens,
    setFilter,
    setSelectedToken,
    setActiveNav,
    setDetailTab,
    setMode,
    toggleKillSwitch,
    openOpportunityReport,
    closeOpportunityReport,
    openTradeSetup,
    closeTradeSetup,
    approveTradeSetup,
    cancelTradeSetup,
    manualClosePosition,
    refreshTokens,
    runFullDemoScenario,
    tickSimulation,
    updateSettings,
    toggleSolanaWs,
    simulateTelegramApproval,
    exportAuditLogsJson,
  };
}
