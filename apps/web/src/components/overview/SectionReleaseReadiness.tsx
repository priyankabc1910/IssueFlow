import React from 'react';
import {
  GitBranch,
  Calendar,
  AlertOctagon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Circle,
  ArrowRight,
  Info,
  ExternalLink,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionReleaseReadiness: React.FC = () => {
  const {
    release,
    computedReadiness,
    toggleReleaseChecklist,
    setActiveRoute,
    navigateToFilteredIssues
  } = useApp();

  const targetDateFormatted = new Date(release.targetDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const { score, label, blockers } = computedReadiness;
  const isHealthy = score >= 85;
  const isWarning = score >= 65 && score < 85;

  return (
    <section className="story-section release-story-section" id="section-release">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 07 // DEPLOYMENT GOVERNANCE</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">CANDIDATE SHIP GATE</span>
      </div>

      <div className="release-editorial-header">
        <div className="release-title-col">
          <h2 className="editorial-section-title">
            Know what stands between <br />
            <span className="title-italic-accent">you and release.</span>
          </h2>
          <p className="editorial-section-desc">
            Releasing software shouldn't rely on gut instinct or late-night Slack polling. 
            IssueFlow synthesizes code stability, unresolved blocker counts, and automated audit checks 
            into an objective release confidence index.
          </p>
        </div>

        <div className="release-demo-pill">
          <Info size={13} />
          <span>Readiness score is a deterministic demonstration calculation based on active blockers.</span>
        </div>
      </div>

      {/* Main Release Readiness Composition */}
      <div className="release-composition-stage">
        {/* Left Dial & Status Column */}
        <div className="release-dial-card">
          <div className="candidate-version-banner">
            <span className="branch-icon"><GitBranch size={14} /></span>
            <span className="version-tag">{release.version}</span>
            <span className="codename-tag">"{release.name}"</span>
            <span className="status-badge-rc">RC CANDIDATE</span>
          </div>

          {/* Architectural Dial / Ring Visualization */}
          <div className="readiness-gauge-wrapper">
            <svg viewBox="0 0 200 200" className="readiness-gauge-svg">
              <circle
                cx="100"
                cy="100"
                r="82"
                className="gauge-bg-ring"
              />
              <circle
                cx="100"
                cy="100"
                r="82"
                className={`gauge-fill-ring ${isHealthy ? 'ring-emerald' : isWarning ? 'ring-amber' : 'ring-crimson'}`}
                strokeDasharray={2 * Math.PI * 82}
                strokeDashoffset={2 * Math.PI * 82 * (1 - score / 100)}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>

            <div className="gauge-center-content">
              <span className="gauge-percentage-number">{score}</span>
              <span className="gauge-pct-symbol">%</span>
              <span className="gauge-sub-caption">READINESS SCORE</span>
            </div>
          </div>

          {/* Verdict Pill */}
          <div className="gauge-verdict-box">
            <span className={`verdict-dot ${isHealthy ? 'green' : isWarning ? 'amber' : 'red'}`} />
            <strong className="verdict-label-text">{label}</strong>
          </div>

          <div className="target-schedule-row">
            <Calendar size={13} className="cal-icon" />
            <span>Target Ship: <strong>{targetDateFormatted}</strong> (5 days remaining)</span>
          </div>

          {/* Blocker Breakdown Tiles */}
          <div className="blockers-summary-grid">
            <button
              className="blocker-stat-tile is-critical-tile"
              onClick={() => navigateToFilteredIssues({ severity: 'CRITICAL', status: 'ALL' })}
            >
              <span className="b-icon"><Flame size={13} /></span>
              <div className="b-text">
                <strong className="b-val text-crimson">{blockers.critical}</strong>
                <span className="b-lbl">Critical Blocker{blockers.critical === 1 ? '' : 's'}</span>
              </div>
            </button>

            <button
              className="blocker-stat-tile is-overdue-tile"
              onClick={() => navigateToFilteredIssues({ status: 'OPEN' })}
            >
              <span className="b-icon"><Clock size={13} /></span>
              <div className="b-text">
                <strong className="b-val text-amber">{blockers.overdue}</strong>
                <span className="b-lbl">Overdue Item{blockers.overdue === 1 ? '' : 's'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Interactive Checklist Column */}
        <div className="release-checklist-card">
          <div className="checklist-card-header">
            <div>
              <h3 className="checklist-heading">Release Readiness Verification Checklist</h3>
              <p className="checklist-subtext">Click items to simulate audit sign-offs and test verification status</p>
            </div>
            <span className="checklist-completed-count">
              {release.checklist.filter(c => c.completed).length} / {release.checklist.length} Passed
            </span>
          </div>

          <div className="checklist-items-stack" role="list">
            {release.checklist.map(item => (
              <div
                key={item.id}
                className={`checklist-item-row ${item.completed ? 'is-completed' : 'is-pending'} ${item.required ? 'is-mandatory' : ''}`}
                onClick={() => toggleReleaseChecklist(item.id)}
                role="checkbox"
                aria-checked={item.completed}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleReleaseChecklist(item.id);
                  }
                }}
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
                    {item.required && (
                      <span className="required-tag">MANDATORY GATE</span>
                    )}
                  </div>
                  <span className="check-category-pill">{item.category}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="checklist-card-footer">
            <button
              className="editorial-action-link"
              onClick={() => setActiveRoute('releases')}
            >
              <span>Inspect full release candidate pipeline & changelog</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
