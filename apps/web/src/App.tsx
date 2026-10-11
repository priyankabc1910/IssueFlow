import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNav } from './components/navigation/TopNav';
import { OverviewPage } from './components/overview/OverviewPage';
import { IssuesView } from './components/views/IssuesView';
import { MyTasksView } from './components/views/MyTasksView';
import { TeamsView } from './components/views/TeamsView';
import { IntelligenceView } from './components/views/IntelligenceView';
import { ReleasesView } from './components/views/ReleasesView';
import { ActivityView } from './components/views/ActivityView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { SettingsView } from './components/views/SettingsView';
import { CreateIssueModal } from './components/modals/CreateIssueModal';
import { IssueDetailModal } from './components/modals/IssueDetailModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { NotificationsPopover } from './components/modals/NotificationsPopover';
import { CheckCircle2, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeRoute, notice, setNotice, apiOnline, setActiveRoute } = useApp();

  return (
    <div className="issueflow-app-canvas">
      {/* Top Floating Navigation */}
      <TopNav />

      {/* Floating System Notice Banner */}
      {notice && (
        <aside className="global-system-toast" role="status" aria-live="polite">
          <div className="toast-inner">
            <CheckCircle2 size={15} className="toast-icon text-emerald" />
            <span className="toast-msg">{notice}</span>
            <button
              className="toast-dismiss-btn"
              onClick={() => setNotice('')}
              aria-label="Dismiss notice"
            >
              <X size={14} />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Stage (Full Width, No Left Sidebar) */}
      <main className="main-editorial-stage" id="main-content">
        {activeRoute === 'overview' && <OverviewPage />}
        {activeRoute === 'issues' && <IssuesView />}
        {activeRoute === 'my-tasks' && <MyTasksView />}
        {activeRoute === 'teams' && <TeamsView />}
        {activeRoute === 'intelligence' && <IntelligenceView />}
        {activeRoute === 'releases' && <ReleasesView />}
        {activeRoute === 'activity' && <ActivityView />}
        {activeRoute === 'integrations' && <IntegrationsView />}
        {activeRoute === 'settings' && <SettingsView />}
      </main>

      {/* Editorial Footer */}
      <footer className="editorial-footer">
        <div className="footer-inner-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="footer-glyph">✦</span>
              <strong>IssueFlow</strong>
            </div>
            <p className="footer-tagline">
              Engineering intelligence platform combining editorial storytelling with rigorous operational triage.
            </p>
            <div className="footer-status-tag">
              <span className={`status-dot ${apiOnline ? 'online' : 'demo'}`} />
              <span>{apiOnline ? 'API Connected (Production mode)' : 'Stateful Demo Environment · Real-time simulation'}</span>
            </div>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-heading">WORKSPACE</span>
            <button onClick={() => setActiveRoute('overview')}>Overview Story</button>
            <button onClick={() => setActiveRoute('issues')}>Issues Registry</button>
            <button onClick={() => setActiveRoute('my-tasks')}>My Tasks</button>
            <button onClick={() => setActiveRoute('teams')}>Squad Directory</button>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-heading">INTELLIGENCE</span>
            <button onClick={() => setActiveRoute('intelligence')}>Risk Scoring Formula</button>
            <button onClick={() => setActiveRoute('releases')}>Release Gate RC</button>
            <button onClick={() => setActiveRoute('activity')}>Audit Journal</button>
            <button onClick={() => setActiveRoute('integrations')}>Toolchain Connectors</button>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-heading">GOVERNANCE</span>
            <button onClick={() => setActiveRoute('settings')}>Settings & SLA</button>
            <span className="footer-version-label">IssueFlow v2.4.0 · 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals & Popovers */}
      <CreateIssueModal />
      <IssueDetailModal />
      <GlobalSearchModal />
      <NotificationsPopover />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
