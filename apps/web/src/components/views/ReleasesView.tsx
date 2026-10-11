import React, { useState } from 'react';
import {
  GitBranch,
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  ArrowRight,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReleasesView: React.FC = () => {
  const { release, computedReadiness, toggleReleaseChecklist, issues, setNotice } = useApp();
  const [copiedChangelog, setCopiedChangelog] = useState(false);

  const resolvedIssues = issues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status));
  const blockers = issues.filter(i => i.severity === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(i.status));

  const targetDateFormatted = new Date(release.targetDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const changelogText = `## Release ${release.version} "${release.name}"\n` +
    `*Target Ship Date: ${targetDateFormatted}*\n\n` +
    `### Verified Fixes & Features\n` +
    resolvedIssues.map(i => `- **[${i.key}]** ${i.title} (${i.component})`).join('\n') +
    `\n\n### Open Blockers (${blockers.length})\n` +
    (blockers.length ? blockers.map(i => `- ⚠️ **[${i.key}]** ${i.title}`).join('\n') : '- None! All critical gates passed.');

  const handleCopyChangelog = () => {
    navigator.clipboard.writeText(changelogText);
    setCopiedChangelog(true);
    setNotice('Copied markdown changelog to clipboard.');
    setTimeout(() => setCopiedChangelog(false), 2000);
  };

  return (
    <div className="view-container releases-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">RELEASE MANAGEMENT // DEPLOYMENT GATES</span>
          <h1 className="view-main-title">Release Readiness</h1>
          <p className="view-sub-desc">
            Candidate verification status, automated gating checklists, and dynamic changelog generation.
          </p>
        </div>

        <button
          className="editorial-btn-secondary"
          onClick={handleCopyChangelog}
        >
          {copiedChangelog ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
          <span>{copiedChangelog ? 'Copied Changelog' : 'Copy Release Notes'}</span>
        </button>
      </div>

      {/* Main Release Candidate Hero Card */}
      <div className="release-hero-card">
        <div className="hero-top-row">
          <div className="release-identity-lockup">
            <span className="version-pill-large">
              <GitBranch size={16} />
              <span>{release.version}</span>
            </span>
            <div className="title-text">
              <h2>Codename "{release.name}"</h2>
              <span className="target-sub">Target deployment: <strong>{targetDateFormatted}</strong></span>
            </div>
          </div>

          <div className="score-hero-dock">
            <div className="score-callout-number">
              <strong>{computedReadiness.score}%</strong>
              <small>READINESS</small>
            </div>
            <span className={`readiness-status-badge ${computedReadiness.score >= 85 ? 'green' : computedReadiness.score >= 65 ? 'amber' : 'red'}`}>
              {computedReadiness.label}
            </span>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="release-metrics-band">
          <div className="r-metric">
            <span className="lbl">CRITICAL BLOCKERS</span>
            <strong className={`val ${computedReadiness.blockers.critical > 0 ? 'text-crimson' : 'text-emerald'}`}>
              {computedReadiness.blockers.critical}
            </strong>
          </div>
          <div className="r-metric">
            <span className="lbl">OVERDUE TICKETS</span>
            <strong className="val text-amber">{computedReadiness.blockers.overdue}</strong>
          </div>
          <div className="r-metric">
            <span className="lbl">RESOLVED FIXES</span>
            <strong className="val text-emerald">{resolvedIssues.length}</strong>
          </div>
          <div className="r-metric">
            <span className="lbl">CHECKLIST COMPLIANCE</span>
            <strong className="val">
              {release.checklist.filter(c => c.completed).length} / {release.checklist.length}
            </strong>
          </div>
        </div>
      </div>

      {/* Two-Column Stage: Checklist on Left, Dynamic Changelog on Right */}
      <div className="releases-two-col-grid">
        {/* Verification Checklist */}
        <div className="release-checklist-panel">
          <div className="panel-title-strip">
            <h3>Release Sign-off Gates</h3>
            <span className="hint-pill">Interactive Verification</span>
          </div>

          <div className="checklist-items-stack">
            {release.checklist.map(item => (
              <div
                key={item.id}
                className={`checklist-item-row ${item.completed ? 'is-completed' : 'is-pending'}`}
                onClick={() => toggleReleaseChecklist(item.id)}
                role="checkbox"
                aria-checked={item.completed}
                tabIndex={0}
              >
                <div className="check-indicator-box">
                  {item.completed ? (
                    <CheckCircle2 size={18} className="text-emerald" />
                  ) : (
                    <Circle size={18} className="text-slate-muted" />
                  )}
                </div>

                <div className="check-text-content">
                  <div className="check-title-row">
                    <span className="check-title-text">{item.title}</span>
                    {item.required && <span className="required-tag">MANDATORY</span>}
                  </div>
                  <span className="check-category-pill">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Changelog Generator */}
        <div className="release-changelog-panel">
          <div className="panel-title-strip">
            <h3>Dynamic Release Changelog</h3>
            <span className="hint-pill">Generated from verified issues</span>
          </div>

          <div className="changelog-markdown-preview">
            <pre><code>{changelogText}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
};
