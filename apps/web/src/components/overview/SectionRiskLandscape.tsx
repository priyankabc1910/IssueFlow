import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  ExternalLink,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionRiskLandscape: React.FC = () => {
  const { issues, navigateToFilteredIssues, setSelectedIssue } = useApp();

  const now = new Date();
  const activeIssues = issues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status));

  const criticalIssues = activeIssues.filter(i => i.severity === 'CRITICAL');
  const highIssues = activeIssues.filter(i => i.severity === 'HIGH');
  const mediumIssues = activeIssues.filter(i => i.severity === 'MEDIUM');
  const lowIssues = activeIssues.filter(i => i.severity === 'LOW');
  const overdueIssues = activeIssues.filter(i => i.dueAt && new Date(i.dueAt).getTime() < now.getTime());
  const reopenedIssues = activeIssues.filter(i => i.reopenedCount > 0);

  // Identify highest risk active issue
  const sortedByRisk = [...activeIssues].sort((a, b) => b.risk.score - a.risk.score);
  const highestRiskIssue = sortedByRisk[0];

  const totalActive = activeIssues.length || 1;
  const criticalPct = Math.round((criticalIssues.length / totalActive) * 100);
  const highPct = Math.round((highIssues.length / totalActive) * 100);
  const medPct = Math.round((mediumIssues.length / totalActive) * 100);
  const lowPct = Math.round((lowIssues.length / totalActive) * 100);

  return (
    <section className="story-section risk-landscape-section" id="section-risk">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 03 // EXPLAINABLE RISK DISTRIBUTION</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">SEVERITY VS EXPOSURE MATRIX</span>
      </div>

      <div className="risk-editorial-layout">
        {/* Header Block */}
        <div className="risk-header-strip">
          <div className="risk-title-cluster">
            <h2 className="editorial-section-title">
              Not every issue deserves <br />
              <span className="title-italic-accent">equal attention.</span>
            </h2>
            <p className="editorial-section-desc">
              Conventional issue trackers treat all open tickets as undifferentiated rows. 
              IssueFlow computes a transparent multi-factor risk index combining severity impact, 
              SLA deadline proximity, and historical reopen regressions.
            </p>
          </div>

          <div className="risk-demo-disclaimer-pill">
            <Info size={13} className="info-icon" />
            <span>Risk indices are deterministic calculations based on demonstration telemetry.</span>
          </div>
        </div>

        {/* Core Risk Grid: Landscape Distribution + Spotlight Issue */}
        <div className="risk-composition-grid">
          {/* Left: Visual Risk Landscape & Distribution */}
          <div className="risk-matrix-card">
            <div className="card-top-header">
              <span className="card-tag">SYSTEM RISK LANDSCAPE</span>
              <span className="card-metric-total">{activeIssues.length} ACTIVE RISKS</span>
            </div>

            {/* Severity Distribution Segmented Bar */}
            <div className="severity-segmented-track" title="Active severity breakdown">
              <div 
                className="seg-bar seg-critical" 
                style={{ width: `${Math.max(5, criticalPct)}%` }} 
                title={`Critical: ${criticalIssues.length} issues (${criticalPct}%)`}
              />
              <div 
                className="seg-bar seg-high" 
                style={{ width: `${Math.max(5, highPct)}%` }} 
                title={`High: ${highIssues.length} issues (${highPct}%)`}
              />
              <div 
                className="seg-bar seg-med" 
                style={{ width: `${Math.max(5, medPct)}%` }} 
                title={`Medium: ${mediumIssues.length} issues (${medPct}%)`}
              />
              <div 
                className="seg-bar seg-low" 
                style={{ width: `${Math.max(5, lowPct)}%` }} 
                title={`Low: ${lowIssues.length} issues (${lowPct}%)`}
              />
            </div>

            {/* Interactive Category Filter Tiles */}
            <div className="risk-category-tiles">
              {/* Critical */}
              <button
                className="risk-tile tile-critical"
                onClick={() => navigateToFilteredIssues({ severity: 'CRITICAL', status: 'ALL' })}
                title="Filter by Critical severity"
              >
                <div className="tile-top">
                  <span className="tile-badge-icon red"><Flame size={13} /></span>
                  <span className="tile-count text-crimson">{criticalIssues.length}</span>
                </div>
                <div className="tile-meta">
                  <span className="tile-name">Critical Severity</span>
                  <span className="tile-desc">Immediate service degradation</span>
                </div>
                <div className="tile-action">
                  <span>View issues</span>
                  <ArrowRight size={11} />
                </div>
              </button>

              {/* High */}
              <button
                className="risk-tile tile-high"
                onClick={() => navigateToFilteredIssues({ severity: 'HIGH', status: 'ALL' })}
                title="Filter by High severity"
              >
                <div className="tile-top">
                  <span className="tile-badge-icon amber"><AlertTriangle size={13} /></span>
                  <span className="tile-count text-amber">{highIssues.length}</span>
                </div>
                <div className="tile-meta">
                  <span className="tile-name">High Severity</span>
                  <span className="tile-desc">Elevated latency & memory</span>
                </div>
                <div className="tile-action">
                  <span>View issues</span>
                  <ArrowRight size={11} />
                </div>
              </button>

              {/* Medium */}
              <button
                className="risk-tile tile-medium"
                onClick={() => navigateToFilteredIssues({ severity: 'MEDIUM', status: 'ALL' })}
                title="Filter by Medium severity"
              >
                <div className="tile-top">
                  <span className="tile-badge-icon blue"><ShieldAlert size={13} /></span>
                  <span className="tile-count text-blue">{mediumIssues.length}</span>
                </div>
                <div className="tile-meta">
                  <span className="tile-name">Medium Severity</span>
                  <span className="tile-desc">Non-blocking cosmetic/feature</span>
                </div>
                <div className="tile-action">
                  <span>View issues</span>
                  <ArrowRight size={11} />
                </div>
              </button>

              {/* Low */}
              <button
                className="risk-tile tile-low"
                onClick={() => navigateToFilteredIssues({ severity: 'LOW', status: 'ALL' })}
                title="Filter by Low severity"
              >
                <div className="tile-top">
                  <span className="tile-badge-icon slate"><CheckCircle size={13} /></span>
                  <span className="tile-count">{lowIssues.length}</span>
                </div>
                <div className="tile-meta">
                  <span className="tile-name">Low Severity</span>
                  <span className="tile-desc">Polish & minor hygiene</span>
                </div>
                <div className="tile-action">
                  <span>View issues</span>
                  <ArrowRight size={11} />
                </div>
              </button>
            </div>

            {/* Overdue & SLA Breaches Mini-band */}
            <div className="risk-sla-strip">
              <button
                className="sla-sub-button"
                onClick={() => navigateToFilteredIssues({ status: 'OPEN' })}
              >
                <Clock size={14} className="text-amber" />
                <span className="sla-label">Overdue SLA Deadlines:</span>
                <strong className="text-amber">{overdueIssues.length} issues</strong>
                <ArrowRight size={12} className="ml-auto" />
              </button>

              <button
                className="sla-sub-button"
                onClick={() => navigateToFilteredIssues({ status: 'OPEN' })}
              >
                <ShieldAlert size={14} className="text-crimson" />
                <span className="sla-label">Regression Reopens:</span>
                <strong className="text-crimson">{reopenedIssues.length} issues</strong>
                <ArrowRight size={12} className="ml-auto" />
              </button>
            </div>
          </div>

          {/* Right: The #1 Most Important Risk Spotlight */}
          {highestRiskIssue && (
            <div className="risk-spotlight-card">
              <div className="spotlight-top-badge">
                <span className="spotlight-pulsar" />
                <span className="spotlight-tag">MAXIMUM RISK FACTOR SPOTLIGHT</span>
              </div>

              <div className="spotlight-score-block">
                <div className="score-numerical-lockup">
                  <span className="score-val text-crimson">{highestRiskIssue.risk.score}</span>
                  <span className="score-denominator">/10</span>
                </div>
                <div className="score-verdict">
                  <span className="score-level-badge level-critical">CRITICAL RISK</span>
                  <span className="score-key">{highestRiskIssue.key}</span>
                </div>
              </div>

              <h3 className="spotlight-issue-title">
                {highestRiskIssue.title}
              </h3>

              <p className="spotlight-issue-desc">
                {highestRiskIssue.attentionReason || highestRiskIssue.description}
              </p>

              {/* Explainable Factor Pills */}
              <div className="spotlight-reasons-container">
                <span className="reasons-label">EXPLAINABLE RISK DRIVERS:</span>
                <ul className="reasons-list">
                  {highestRiskIssue.risk.reasons.map((r, idx) => (
                    <li key={idx} className="reason-item">
                      <span className="reason-bullet" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="spotlight-footer-actions">
                <button
                  className="editorial-inspect-btn"
                  onClick={() => setSelectedIssue(highestRiskIssue)}
                >
                  <span>Inspect issue details</span>
                  <ExternalLink size={13} />
                </button>
                <div className="spotlight-assignee">
                  <div className="mini-avatar">{highestRiskIssue.assignee.avatar}</div>
                  <span>{highestRiskIssue.assignee.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
