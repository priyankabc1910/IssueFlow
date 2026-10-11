import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CircleDot,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionPulse: React.FC = () => {
  const { issues, navigateToFilteredIssues } = useApp();

  const now = new Date();
  const openIssues = issues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status));
  const openCount = openIssues.length;

  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(i.status));
  const criticalCount = criticalIssues.length;

  const overdueIssues = issues.filter(i => i.dueAt && new Date(i.dueAt).getTime() < now.getTime() && !['RESOLVED', 'CLOSED'].includes(i.status));
  const overdueCount = overdueIssues.length;

  const resolvedIssues = issues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status));
  const resolvedCount = resolvedIssues.length;

  return (
    <section className="story-section pulse-band-section" id="section-pulse">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 01 // TELEMETRY PULSE</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">REAL-TIME SYSTEM COHESION</span>
      </div>

      <div className="pulse-editorial-container">
        {/* Horizontal Continuous Metric Band */}
        <div className="pulse-metrics-strip" role="region" aria-label="Engineering pulse metrics">
          {/* Metric 1: Open issues */}
          <button
            className="pulse-metric-block is-primary"
            onClick={() => navigateToFilteredIssues({ status: 'OPEN' })}
            title="Click to view all open issues"
          >
            <div className="pulse-metric-header">
              <span className="pulse-label">OPEN ISSUES</span>
              <span className="pulse-status-dot blue" />
            </div>
            <div className="pulse-metric-body">
              <span className="pulse-number">{openCount}</span>
              <span className="pulse-subtext">across 4 product teams</span>
            </div>
            <div className="pulse-metric-footer">
              <span className="trend-badge neutral">
                <CircleDot size={12} />
                <span>Steady queue</span>
              </span>
              <span className="click-affordance">
                <span>View open</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </button>

          <div className="pulse-divider" aria-hidden="true" />

          {/* Metric 2: Critical incidents */}
          <button
            className="pulse-metric-block is-critical"
            onClick={() => navigateToFilteredIssues({ severity: 'CRITICAL' })}
            title="Click to filter by critical issues"
          >
            <div className="pulse-metric-header">
              <span className="pulse-label">CRITICAL INCIDENTS</span>
              <span className="pulse-status-dot red" />
            </div>
            <div className="pulse-metric-body">
              <span className="pulse-number text-crimson">{criticalCount}</span>
              <span className="pulse-subtext text-critical-muted">
                {criticalCount === 1 ? '1 active release blocker' : `${criticalCount} release blockers`}
              </span>
            </div>
            <div className="pulse-metric-footer">
              <span className="trend-badge red">
                <AlertTriangle size={12} />
                <span>High SLA risk</span>
              </span>
              <span className="click-affordance text-crimson">
                <span>Investigate</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </button>

          <div className="pulse-divider" aria-hidden="true" />

          {/* Metric 3: Overdue issues */}
          <button
            className="pulse-metric-block is-warning"
            onClick={() => navigateToFilteredIssues({ status: 'OPEN' })}
            title="Click to view overdue work"
          >
            <div className="pulse-metric-header">
              <span className="pulse-label">OVERDUE SLA ISSUES</span>
              <span className="pulse-status-dot amber" />
            </div>
            <div className="pulse-metric-body">
              <span className="pulse-number text-amber">{overdueCount}</span>
              <span className="pulse-subtext">past target sprint delivery</span>
            </div>
            <div className="pulse-metric-footer">
              <span className="trend-badge amber">
                <Clock size={12} />
                <span>Oldest 2d overdue</span>
              </span>
              <span className="click-affordance text-amber">
                <span>Review SLA</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </button>

          <div className="pulse-divider" aria-hidden="true" />

          {/* Metric 4: Issues resolved */}
          <button
            className="pulse-metric-block is-success"
            onClick={() => navigateToFilteredIssues({ status: 'RESOLVED' })}
            title="Click to view resolved issues"
          >
            <div className="pulse-metric-header">
              <span className="pulse-label">ISSUES RESOLVED</span>
              <span className="pulse-status-dot emerald" />
            </div>
            <div className="pulse-metric-body">
              <span className="pulse-number text-emerald">{resolvedCount}</span>
              <span className="pulse-subtext">closed with verified fixes</span>
            </div>
            <div className="pulse-metric-footer">
              <span className="trend-badge emerald">
                <ArrowUpRight size={12} />
                <span>+18% velocity vs prior</span>
              </span>
              <span className="click-affordance text-emerald">
                <span>View archive</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </button>
        </div>

        {/* Narrative Caption */}
        <div className="pulse-narrative-bar">
          <span className="pulse-quote-mark">“</span>
          <p className="pulse-narrative-text">
            While overall ticket resolution velocity remains healthy with <strong>{resolvedCount} verified fixes</strong>, 
            the presence of <strong>{criticalCount} critical blocker</strong> (WEB-101) in Checkout requires prioritization 
            before the upcoming release freeze.
          </p>
        </div>
      </div>
    </section>
  );
};
