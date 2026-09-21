import React, { useState, useEffect } from 'react';
import { Settings, Shield, HardDrive, Network, CheckCircle2, Send, Download, Trash2, Database, AlertCircle } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { telegramBotService } from '../services/telegramBotService';
import { storageService } from '../services/storageService';

export const SettingsPage: React.FC = () => {
  const {
    isDemoMode,
    setMode,
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

  // Telegram state
  const [telegramToken, setTelegramToken] = useState<string>(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(settings.telegramChatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(settings.telegramAlertsEnabled);
  const [telegramTestStatus, setTelegramTestStatus] = useState<string | null>(null);

  const [saved, setSaved] = useState<boolean>(false);
  const [storageStatus, setStorageStatus] = useState<string | null>(null);

  useEffect(() => {
    setMaxPositionSize(settings.maxPositionSizeUsd);
    setMaxDailyLoss(settings.maxDailyLossUsd);
    setMaxSlippage(settings.maxSlippagePercent);
    setSolanaRpc(settings.solanaRpcUrl);
    setBscRpc(settings.bscRpcUrl);
    setSolanaWs(settings.solanaWsUrl);
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
    <div className="flex-1 overflow-y-auto p-4 bg-[#090a0f] font-mono text-xs">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-semibold text-sm text-zinc-100 uppercase tracking-wide">
                TERMINAL &amp; EXECUTION GUARDRAILS SETTINGS
              </h2>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Enforce hard risk boundaries, network endpoints, Telegram remote approvals, and storage persistence.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>{saved ? 'Saved Successfully' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Operational Mode */}
        <div className="terminal-card p-5 space-y-3">
          <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400" />
            OPERATIONAL ENVIRONMENT MODE
          </h3>
          <p className="text-zinc-400 text-xs">
            Toggle between deterministic simulation for reproducible testing and live market connections.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setMode(true)}
              className={`p-3 rounded-md border text-left transition ${
                isDemoMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <div>DEMO / SIMULATION MODE</div>
              <div className="text-[10px] text-zinc-400 font-normal mt-1">
                Deterministic tokens, realistic simulated execution, zero capital risk.
              </div>
            </button>
            <button
              onClick={() => setMode(false)}
              className={`p-3 rounded-md border text-left transition ${
                !isDemoMode
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <div>LIVE DATA MODE</div>
              <div className="text-[10px] text-zinc-400 font-normal mt-1">
                Fetches real-time pairs from DexScreener &amp; public Solana/BSC RPCs.
              </div>
            </button>
          </div>
        </div>

        {/* Telegram Bot & Remote Approval Integration */}
        <div className="terminal-card p-5 space-y-4 border-l-2 border-l-sky-500">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              TELEGRAM BOT &amp; REMOTE ONE-CLICK APPROVALS
            </h3>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-zinc-900 border-zinc-700 focus:ring-0"
              />
              <span className="text-zinc-200 font-medium text-xs">Enable Telegram Alerts</span>
            </label>
          </div>

          <p className="text-zinc-400 text-xs">
            Sends rich Opportunity Reports directly to your phone. Tap inline buttons in Telegram to approve trades remotely without opening the desktop terminal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Telegram Bot Token</label>
              <input
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Created via @BotFather.</span>
            </div>

            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Telegram Chat ID</label>
              <input
                type="text"
                placeholder="e.g. 987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Your personal Telegram user ID or channel ID.</span>
            </div>
          </div>

          {telegramTestStatus && (
            <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
              {telegramTestStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleTestTelegram}
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition flex items-center gap-1.5 font-medium shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Send Test Telegram Alert</span>
            </button>

            <button
              onClick={handleSimulateRemoteApproval}
              className="px-3 py-1.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition flex items-center gap-1.5 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate Remote Telegram Approval</span>
            </button>
          </div>
        </div>

        {/* Local Persistent Storage Management */}
        <div className="terminal-card p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            LOCAL PERSISTENT STORAGE (INDEXEDDB / LOCALSTORAGE)
          </h3>
          <p className="text-zinc-400 text-xs">
            All pending setups, open positions, closed trade history, and audit trails automatically persist across browser refreshes and system reboots.
          </p>

          {storageStatus && (
            <div className="p-2.5 rounded-md bg-zinc-950 border border-emerald-500/40 text-emerald-400 text-xs">
              {storageStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportAuditLogs}
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition flex items-center gap-1.5 font-medium shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export Audit Trail (JSON)</span>
            </button>

            <button
              onClick={handleClearStorage}
              className="px-3 py-1.5 rounded-md bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition flex items-center gap-1.5 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Persistent Storage</span>
            </button>
          </div>
        </div>

        {/* Safety Limits */}
        <div className="terminal-card p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            HARD RISK GUARDRAILS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Max Position Size ($)</label>
              <input
                type="number"
                value={maxPositionSize}
                onChange={(e) => setMaxPositionSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Upper bound for any single approved setup.</span>
            </div>

            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Daily Stop Loss Ceiling ($)</label>
              <input
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Halts trading if daily loss exceeds this threshold.</span>
            </div>

            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Max Slippage Tolerance (%)</label>
              <input
                type="number"
                step="0.1"
                value={maxSlippage}
                onChange={(e) => setMaxSlippage(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Maximum permissible slippage per order.</span>
            </div>
          </div>
        </div>

        {/* Network & RPC Configuration */}
        <div className="terminal-card p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-sky-400" />
            BLOCKCHAIN RPC &amp; WEBSOCKET ENDPOINTS
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Solana WebSocket (Sub-second launch streaming)</label>
              <input
                type="text"
                value={solanaWs}
                onChange={(e) => setSolanaWs(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Supports Helius, QuickNode, or public Solana WSS.</span>
            </div>
            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Solana RPC Endpoint</label>
              <input
                type="text"
                value={solanaRpc}
                onChange={(e) => setSolanaRpc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="text-zinc-300 block mb-1 font-medium">BNB Chain RPC Endpoint</label>
              <input
                type="text"
                value={bscRpc}
                onChange={(e) => setBscRpc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Security Guarantee */}
        <div className="bg-zinc-950/70 p-4 rounded-lg border border-zinc-800 space-y-2 text-zinc-400 text-xs">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-sky-400" />
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
