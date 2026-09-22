import React, { useState, useEffect } from 'react';
import { Settings, Shield, HardDrive, Network, CheckCircle2, Send, Download, Trash2, Database, AlertCircle, Sun, Moon, Monitor, Smartphone, Laptop } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { telegramBotService } from '../services/telegramBotService';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../hooks/useDevice';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportAuditLogsJson,
    selectedToken,
    tokens,
    simulateTelegramApproval,
  } = useTradingStore();

  const [maxPositionSize, setMaxPositionSize] = useState<number>(settings.maxPositionSizeUsd);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(settings.maxDailyLossUsd);
  const [maxSlippage, setMaxSlippage] = useState<number>(settings.maxSlippagePercent);
  const [solanaRpc, setSolanaRpc] = useState<string>(settings.solanaRpcUrl);
  const [bscRpc, setBscRpc] = useState<string>(settings.bscRpcUrl);
  const [solanaWs, setSolanaWs] = useState<string>(settings.solanaWsUrl);
  const [robinhoodRpc, setRobinhoodRpc] = useState<string>(settings.robinhoodRpcUrl || 'https://rpc.robinhood.com');
  const [robinhoodWs, setRobinhoodWs] = useState<string>(settings.robinhoodWsUrl || 'wss://rpc.robinhood.com/ws');

  // Telegram state
  const [telegramToken, setTelegramToken] = useState<string>(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(settings.telegramChatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(settings.telegramAlertsEnabled);
  const [telegramTestStatus, setTelegramTestStatus] = useState<string | null>(null);

  const [saved, setSaved] = useState<boolean>(false);
  const [storageStatus, setStorageStatus] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();
  const device = useDevice();

  useEffect(() => {
    setMaxPositionSize(settings.maxPositionSizeUsd);
    setMaxDailyLoss(settings.maxDailyLossUsd);
    setMaxSlippage(settings.maxSlippagePercent);
    setSolanaRpc(settings.solanaRpcUrl);
    setBscRpc(settings.bscRpcUrl);
    setSolanaWs(settings.solanaWsUrl);
    setRobinhoodRpc(settings.robinhoodRpcUrl || 'https://rpc.robinhood.com');
    setRobinhoodWs(settings.robinhoodWsUrl || 'wss://rpc.robinhood.com/ws');
    setTelegramToken(settings.telegramBotToken || '');
    setTelegramChatId(settings.telegramChatId || '');
    setTelegramEnabled(settings.telegramAlertsEnabled);
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      maxPositionSizeUsd: maxPositionSize,
      maxDailyLossUsd: maxDailyLoss,
      maxSlippagePercent: maxSlippage,
      solanaRpcUrl: solanaRpc,
      bscRpcUrl: bscRpc,
      solanaWsUrl: solanaWs,
      robinhoodRpcUrl: robinhoodRpc,
      robinhoodWsUrl: robinhoodWs,
      telegramBotToken: telegramToken,
      telegramChatId: telegramChatId,
      telegramAlertsEnabled: telegramEnabled,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestTelegram = async () => {
    setTelegramTestStatus('Testing Telegram connection...');
    telegramBotService.setConfig({
      botToken: telegramToken,
      chatId: telegramChatId,
      enabled: true,
    });
    const res = await telegramBotService.sendTestMessage();
    if (res.success) {
      setTelegramTestStatus('✅ Test message successfully sent to your Telegram chat!');
    } else {
      setTelegramTestStatus(`❌ Telegram test error: ${res.error}`);
    }
  };

  const handleSimulateRemoteApproval = () => {
    const target = selectedToken || tokens[0];
    if (!target) return;
    simulateTelegramApproval(target);
    setTelegramTestStatus(`✅ Simulated remote approval received for $${target.symbol}! Check TRADE SETUPS tab.`);
  };

  const handleExportAuditLogs = () => {
    const json = exportAuditLogsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token_sniper_audit_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStorageStatus('Audit trail exported successfully.');
    setTimeout(() => setStorageStatus(null), 3000);
  };

  const handleClearStorage = () => {
    if (confirm('Are you sure you want to clear all stored trade setups, open positions, and audit history?')) {
      storageService.clearAll();
      setStorageStatus('Local storage cleared. Please refresh the page.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] font-mono text-xs transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                TERMINAL &amp; EXECUTION GUARDRAILS SETTINGS
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Enforce hard risk boundaries, network endpoints, Telegram remote approvals, and theme &amp; device adaptation.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold flex items-center gap-1.5 transition shadow-sm text-xs font-mono"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>{saved ? 'Saved Successfully' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Display Theme & Adaptive Device Detection Section */}
        <div className="terminal-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4 text-sky-500" />
              DISPLAY THEME &amp; ADAPTIVE DEVICE ENGINE
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              AUTONOMOUS ADAPTATION ACTIVE
            </span>
          </div>
          
          <p className="text-[var(--text-muted)] text-xs">
            The terminal automatically detects whether you are browsing from a mobile smartphone or desktop workstation, and fluidly optimizes navigation, touch targets, and visual density.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Theme Selector */}
            <div className="p-3.5 rounded-lg border border-[var(--card-border)] bg-black/5 dark:bg-zinc-950/60 space-y-2.5">
              <span className="font-semibold text-[var(--text-primary)] text-xs block">Visual Theme Preference:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition ${
                    theme === 'dark'
                      ? 'bg-sky-500 text-slate-950 font-semibold border-sky-500 shadow-sm'
                      : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Moon className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition ${
                    theme === 'light'
                      ? 'bg-sky-500 text-slate-950 font-semibold border-sky-500 shadow-sm'
                      : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Sun className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition ${
                    theme === 'system'
                      ? 'bg-sky-500 text-slate-950 font-semibold border-sky-500 shadow-sm'
                      : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Monitor className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">System</span>
                </button>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] block">
                Executive high-contrast dark or crisp Swiss-banking light mode.
              </span>
            </div>

            {/* Device Diagnostics */}
            <div className="p-3.5 rounded-lg border border-[var(--card-border)] bg-black/5 dark:bg-zinc-950/60 space-y-2">
              <span className="font-semibold text-[var(--text-primary)] text-xs block">Active Device Diagnostics:</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Detected Form Factor:</span>
                  <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    {device.isMobile ? <Smartphone className="w-3.5 h-3.5 text-sky-500" /> : <Laptop className="w-3.5 h-3.5 text-sky-500" />}
                    {device.deviceType.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Viewport Resolution:</span>
                  <span className="text-[var(--text-primary)]">{device.screenWidth} × {device.screenHeight} px</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Input Pointer:</span>
                  <span className="text-[var(--text-primary)]">{device.isTouch ? 'Touchscreen (Coarse)' : 'Mouse / Trackpad (Fine)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Navigation Layout:</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                    {device.isMobile ? 'Bottom Bar + Quick Sheet' : 'Top Navigation + Wide Grid'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Mode */}
        <div className="terminal-card p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-500" />
            LIVE PUBLIC EXECUTION ARCHITECTURE
          </h3>
          <p className="text-[var(--text-muted)] text-xs">
            The terminal operates continuously in live market mode, ingesting real DEX liquidity pools across Solana and BNB Chain.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-md border border-sky-500/30 bg-sky-500/10 text-left">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                LIVE PAPER EXECUTION (ACTIVE PUBLIC DEFAULT)
              </div>
              <p className="text-[11px] text-[var(--text-primary)] font-normal mt-1.5 leading-relaxed">
                Orders monitor and execute against real-time market prices, liquidity depth, and realistic slippage modeling with zero capital risk for public users.
              </p>
            </div>
            <div className="p-3.5 rounded-md border border-[var(--card-border)] bg-black/5 dark:bg-zinc-950/60 text-left">
              <div className="flex items-center gap-2 text-[var(--text-muted)] font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                ON-CHAIN RPC SIGNER (RESTRICTED)
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-normal mt-1.5 leading-relaxed">
                Direct blockchain transaction signing via private RPC endpoints. Requires dedicated air-gapped signer confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Telegram Bot & Remote Approval Integration */}
        <div className="terminal-card p-4 sm:p-5 space-y-4 border-l-2 border-l-sky-500">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-2">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-500" />
              TELEGRAM BOT &amp; REMOTE ONE-CLICK APPROVALS
            </h3>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-white dark:bg-zinc-900 border-[var(--card-border)] focus:ring-0 cursor-pointer"
              />
              <span className="text-[var(--text-primary)] font-medium text-xs">Enable Telegram Alerts</span>
            </label>
          </div>

          <p className="text-[var(--text-muted)] text-xs">
            Sends rich Opportunity Reports directly to your phone. Tap inline buttons in Telegram to approve trades remotely without opening the desktop terminal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Telegram Bot Token</label>
              <input
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Created via @BotFather.</span>
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Telegram Chat ID</label>
              <input
                type="text"
                placeholder="e.g. 987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Your personal Telegram user ID or channel ID.</span>
            </div>
          </div>

          {telegramTestStatus && (
            <div className="p-2.5 rounded-md bg-black/5 dark:bg-zinc-950 border border-[var(--card-border)] text-[var(--text-primary)] text-xs">
              {telegramTestStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleTestTelegram}
              className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] transition flex items-center gap-1.5 font-medium shadow-sm text-xs"
            >
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>Send Test Telegram Alert</span>
            </button>

            <button
              onClick={handleSimulateRemoteApproval}
              className="px-3 py-1.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 transition flex items-center gap-1.5 font-semibold text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate Remote Approval</span>
            </button>
          </div>
        </div>

        {/* Local Persistent Storage Management */}
        <div className="terminal-card p-4 sm:p-5 space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-500" />
            LOCAL PERSISTENT STORAGE (INDEXEDDB / LOCALSTORAGE)
          </h3>
          <p className="text-[var(--text-muted)] text-xs">
            All pending setups, open positions, closed trade history, and audit trails automatically persist across browser refreshes and system reboots.
          </p>

          {storageStatus && (
            <div className="p-2.5 rounded-md bg-black/5 dark:bg-zinc-950 border border-emerald-500/40 text-emerald-500 dark:text-emerald-400 text-xs">
              {storageStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportAuditLogs}
              className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-zinc-800 hover:bg-black/10 dark:hover:bg-zinc-700 text-[var(--text-primary)] border border-[var(--card-border)] transition flex items-center gap-1.5 font-medium shadow-sm text-xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Export Audit Trail (JSON)</span>
            </button>

            <button
              onClick={handleClearStorage}
              className="px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5 font-medium text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Persistent Storage</span>
            </button>
          </div>
        </div>

        {/* Safety Limits */}
        <div className="terminal-card p-4 sm:p-5 space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-500" />
            HARD RISK GUARDRAILS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Max Position Size ($)</label>
              <input
                type="number"
                value={maxPositionSize}
                onChange={(e) => setMaxPositionSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Upper bound for any single approved setup.</span>
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Daily Stop Loss Ceiling ($)</label>
              <input
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Halts trading if daily loss exceeds threshold.</span>
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Max Slippage Tolerance (%)</label>
              <input
                type="number"
                step="0.1"
                value={maxSlippage}
                onChange={(e) => setMaxSlippage(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Maximum permissible slippage per order.</span>
            </div>
          </div>
        </div>

        {/* Network & RPC Configuration */}
        <div className="terminal-card p-4 sm:p-5 space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-sky-500" />
            BLOCKCHAIN RPC &amp; WEBSOCKET ENDPOINTS
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Solana WebSocket (Sub-second streaming)</label>
              <input
                type="text"
                value={solanaWs}
                onChange={(e) => setSolanaWs(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Supports Helius, QuickNode, or public Solana WSS.</span>
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Solana RPC Endpoint</label>
              <input
                type="text"
                value={solanaRpc}
                onChange={(e) => setSolanaRpc(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">BNB Chain RPC Endpoint</label>
              <input
                type="text"
                value={bscRpc}
                onChange={(e) => setBscRpc(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Robinhood Chain RPC (Arbitrum Orbit L2)</label>
              <input
                type="text"
                value={robinhoodRpc}
                onChange={(e) => setRobinhoodRpc(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">EVM Arbitrum Orbit L2 node for Robinhood Swap &amp; Tokenized Stocks.</span>
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Robinhood Chain WebSocket Stream</label>
              <input
                type="text"
                value={robinhoodWs}
                onChange={(e) => setRobinhoodWs(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-[var(--card-border)] rounded-md p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Sub-second PairCreated and RWA mint log stream.</span>
            </div>
          </div>
        </div>

        {/* Security Guarantee */}
        <div className="bg-black/5 dark:bg-zinc-950/70 p-4 rounded-lg border border-[var(--card-border)] space-y-2 text-[var(--text-muted)] text-xs">
          <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-sky-500" />
            SECURITY ARCHITECTURE GUARANTEE:
          </span>
          <p>
            Private keys and seed phrases are <strong>never</strong> transmitted to or stored in frontend client code. For production execution, signers reside exclusively in isolated, air-gapped backend environments or hardware wallets.
          </p>
        </div>
      </div>
    </div>
  );
};
