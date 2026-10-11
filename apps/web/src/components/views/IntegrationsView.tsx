import React from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IntegrationsView: React.FC = () => {
  const { integrations, setNotice } = useApp();

  const handleTestSync = (name: string) => {
    setNotice(`Synced webhook telemetry with ${name}. Latency: 48ms.`);
  };

  return (
    <div className="view-container integrations-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">ECOSYSTEM & TOOLCHAIN // EXTERNAL ADAPTERS</span>
          <h1 className="view-main-title">Integrations</h1>
          <p className="view-sub-desc">
            Bi-directional synchronization pipelines connecting IssueFlow to code repositories, crash reporters, and paging engines.
          </p>
        </div>
      </div>

      <div className="integrations-grid">
        {integrations.map(integ => {
          const isConnected = integ.status === 'connected';

          return (
            <div key={integ.id} className="integration-card">
              <div className="integ-header">
                <div className="integ-title-block">
                  <span className="integ-icon-box"><Boxes size={18} /></span>
                  <div>
                    <h3>{integ.name}</h3>
                    <span className="integ-cat">{integ.category}</span>
                  </div>
                </div>

                <span className={`integ-status-pill ${integ.status}`}>
                  <span className="status-dot-sm" />
                  <span>{integ.status.toUpperCase()}</span>
                </span>
              </div>

              <p className="integ-desc">{integ.description}</p>

              <div className="integ-meta-row">
                <div className="meta-chunk">
                  <span className="lbl">LAST SYNC</span>
                  <span className="val">{integ.lastSync}</span>
                </div>
                <div className="meta-chunk">
                  <span className="lbl">LATENCY</span>
                  <span className="val">{integ.latency}</span>
                </div>
              </div>

              <div className="integ-footer">
                <button
                  className="editorial-btn-secondary compact"
                  onClick={() => handleTestSync(integ.name)}
                >
                  <RotateCw size={12} />
                  <span>Test Sync</span>
                </button>
                <span className="auto-sync-tag">Auto-poll 60s</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
