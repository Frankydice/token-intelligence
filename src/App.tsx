import React, { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { DiscoverPage } from './pages/DiscoverPage';
import { FlowRadarPage } from './pages/FlowRadarPage';
import { TokenDetailPage } from './pages/TokenDetailPage';
import { DevelopersPage } from './pages/DevelopersPage';
import { WalletsPage } from './pages/WalletsPage';
import { ChineseAlphaPage } from './pages/ChineseAlphaPage';
import { SetupsPage } from './pages/SetupsPage';
import { PositionsPage } from './pages/PositionsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';
import { OpportunityReportModal } from './components/trade/OpportunityReportModal';
import { TradeSetupModal } from './components/trade/TradeSetupModal';
import { useTradingStore } from './store/useTradingStore';
import { alertEngine, TerminalAlert } from './engines/alertEngine';
import { ShieldAlert, Bell, X } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeNav,
    reportModalToken,
    tradeModalToken,
    isKillSwitchActive,
    toggleKillSwitch,
  } = useTradingStore();

  const [toasts, setToasts] = useState<TerminalAlert[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    return alertEngine.subscribe((newAlerts) => {
      // Show unread alerts as temporary toast notifications
      const latest = newAlerts.filter((a) => !a.read).slice(0, 3);
      setToasts(latest);
    });
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Kill Switch Banner if Active */}
      {isKillSwitchActive && (
        <div className="bg-rose-600 text-white px-4 py-2 font-mono text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>EMERGENCY KILL SWITCH ENGAGED: ALL MONITORING &amp; EXECUTION IS FROZEN.</span>
          </div>
          <button
            onClick={() => toggleKillSwitch(false)}
            className="px-3 py-0.5 rounded bg-black/40 hover:bg-black/60 text-white transition text-[11px]"
          >
            DISARM KILL SWITCH
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header />

      {/* Main Navigation (Desktop only) */}
      <Navigation />

      {/* Viewport Content with mobile bottom navigation bar spacing */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
        {activeNav === 'DISCOVER' && <DiscoverPage />}
        {activeNav === 'FLOW_RADAR' && <FlowRadarPage />}
        {activeNav === 'TOKEN_DETAIL' && <TokenDetailPage />}
        {activeNav === 'DEVELOPERS' && <DevelopersPage />}
        {activeNav === 'WALLETS' && <WalletsPage />}
        {activeNav === 'CHINESE_ALPHA' && <ChineseAlphaPage />}
        {activeNav === 'SETUPS' && <SetupsPage />}
        {activeNav === 'POSITIONS' && <PositionsPage />}
        {activeNav === 'HISTORY' && <HistoryPage />}
        {activeNav === 'AUDIT' && <AuditPage />}
        {activeNav === 'SETTINGS' && <SettingsPage />}
      </main>

      {/* Mobile Native Navigation Bar (< 768px) */}
      <MobileNavigation onOpenDrawer={() => setIsDrawerOpen(true)} />

      {/* Mobile Slide-Up Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Opportunity Report Modal (REPORT FIRST WORKFLOW) */}
      {reportModalToken && <OpportunityReportModal token={reportModalToken} />}

      {/* Human Trade Setup Modal */}
      {tradeModalToken && <TradeSetupModal token={tradeModalToken} />}

      {/* Alert Toasts in Lower Right (adjusted above mobile bar on mobile screens) */}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-xl flex items-start gap-2.5 font-mono text-xs transition-all ${
              toast.severity === 'critical'
                ? 'bg-rose-950/90 border-rose-700 text-rose-200'
                : toast.severity === 'warning'
                ? 'bg-amber-950/90 border-amber-700 text-amber-200'
                : toast.severity === 'success'
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                : 'bg-zinc-900/95 border-zinc-700 text-zinc-200'
            }`}
          >
            <Bell className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-white">{toast.title}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default App;
