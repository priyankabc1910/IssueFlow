import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Sliders,
  Save,
  Check,
  UserCheck,
  Terminal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { user, setNotice } = useApp();
  const [workspaceName, setWorkspaceName] = useState('Acme Engineering');
  const [slaCriticalHours, setSlaCriticalHours] = useState('4');
  const [slaHighHours, setSlaHighHours] = useState('24');
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('Workspace configuration preferences saved.');
  };

  return (
    <div className="view-container settings-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">CONFIGURATION // WORKSPACE GOVERNANCE</span>
          <h1 className="view-main-title">Settings</h1>
          <p className="view-sub-desc">
            Configure workspace parameters, SLA breach thresholds, notification dispatches, and engineering policies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form-layout">
        {/* Workspace Identity */}
        <div className="settings-section-card">
          <div className="sec-header">
            <span className="sec-icon"><Settings size={16} /></span>
            <div>
              <h3>Workspace Profile</h3>
              <p>Organizational identifier and primary workspace slug</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <label className="field-group">
              <span className="field-label">Workspace Name</span>
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                className="practical-text-input"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Primary Admin Contact</span>
              <input
                type="text"
                disabled
                value={user.email}
                className="practical-text-input disabled"
              />
            </label>
          </div>
        </div>

        {/* SLA Escalation Policies */}
        <div className="settings-section-card">
          <div className="sec-header">
            <span className="sec-icon"><Shield size={16} /></span>
            <div>
              <h3>SLA Escalation Policies</h3>
              <p>Define automated breach thresholds for unattended high and critical severity tickets</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <label className="field-group">
              <span className="field-label">Critical SLA Breach Window (Hours)</span>
              <input
                type="number"
                value={slaCriticalHours}
                onChange={e => setSlaCriticalHours(e.target.value)}
                className="practical-text-input"
              />
              <span className="field-hint">Triggers immediate PagerDuty on-call escalation</span>
            </label>

            <label className="field-group">
              <span className="field-label">High Severity SLA Window (Hours)</span>
              <input
                type="number"
                value={slaHighHours}
                onChange={e => setSlaHighHours(e.target.value)}
                className="practical-text-input"
              />
              <span className="field-hint">Dispatches Slack digest warning to squad leads</span>
            </label>
          </div>
        </div>

        {/* Notification Routing */}
        <div className="settings-section-card">
          <div className="sec-header">
            <span className="sec-icon"><Bell size={16} /></span>
            <div>
              <h3>Notification Channels</h3>
              <p>Select where operational alerts and release blocker digests are routed</p>
            </div>
          </div>

          <div className="toggle-options-stack">
            <label className="toggle-option-row">
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={e => setSlackAlerts(e.target.checked)}
              />
              <div className="toggle-text">
                <strong>Slack Real-Time Notifications</strong>
                <span>Broadcast critical incidents directly into #eng-triage</span>
              </div>
            </label>

            <label className="toggle-option-row">
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={e => setEmailDigest(e.target.checked)}
              />
              <div className="toggle-text">
                <strong>Daily Engineering Pulse Digest</strong>
                <span>Summary email with release readiness scores every morning at 09:00 UTC</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="settings-save-dock">
          <button type="submit" className="editorial-btn-primary">
            <Save size={15} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
