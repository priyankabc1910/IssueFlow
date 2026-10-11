import React, { useState } from 'react';
import {
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Issue, IssueStatus } from '../../types';
import { formatRelativeTime, formatLabel } from '../../services/intelligence';

export const SectionWorkThatMatters: React.FC = () => {
  const {
    issues,
    setActiveRoute,
    setSelectedIssue,
    updateIssueStatus,
    navigateToFilteredIssues
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ACTIVE'); // default show active

  const filteredIssues = issues.filter(issue => {
    if (filterSeverity !== 'ALL' && issue.severity !== filterSeverity) return false;
    if (filterStatus === 'ACTIVE') {
      return !['RESOLVED', 'CLOSED'].includes(issue.status);
    }
    if (filterStatus !== 'ALL' && issue.status !== filterStatus) return false;
    return true;
  });

  // Sort: Critical & Overdue items come first, then by risk score
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
    if (b.severity === 'CRITICAL' && a.severity !== 'CRITICAL') return 1;
    return b.risk.score - a.risk.score;
  });

  const displayList = sortedIssues.slice(0, 6);

  return (
    <section className="story-section work-story-section" id="section-work">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 04 // FOCUSED EXECUTION ROSTER</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">TRIAGED OPERATIONAL WORK</span>
      </div>

      <div className="work-editorial-header">
        <div className="work-title-group">
          <h2 className="editorial-section-title">
            Move the important <br />
            <span className="title-italic-accent">work forward.</span>
          </h2>
          <p className="editorial-section-desc">
            A curated editorial queue prioritized by production exposure, release gating, 
            and customer latency. Clear rationale accompanies each item so engineers know 
            precisely why each problem demands triage.
          </p>
        </div>

        {/* In-page Filter Strip */}
        <div className="work-filter-toolbar">
          <div className="filter-pill-group">
            <span className="filter-tag-lbl">STATUS:</span>
            <button 
              className={`filter-btn-pill ${filterStatus === 'ACTIVE' ? 'is-active' : ''}`}
              onClick={() => setFilterStatus('ACTIVE')}
            >
              Active Queue
            </button>
            <button 
              className={`filter-btn-pill ${filterStatus === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All Items
            </button>
            <button 
              className={`filter-btn-pill ${filterStatus === 'RESOLVED' ? 'is-active' : ''}`}
              onClick={() => setFilterStatus('RESOLVED')}
            >
              Resolved
            </button>
          </div>

          <div className="filter-pill-group">
            <span className="filter-tag-lbl">SEVERITY:</span>
            <button 
              className={`filter-btn-pill ${filterSeverity === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setFilterSeverity('ALL')}
            >
              Any
            </button>
            <button 
              className={`filter-btn-pill ${filterSeverity === 'CRITICAL' ? 'is-active' : ''}`}
              onClick={() => setFilterSeverity('CRITICAL')}
            >
              Critical
            </button>
            <button 
              className={`filter-btn-pill ${filterSeverity === 'HIGH' ? 'is-active' : ''}`}
              onClick={() => setFilterSeverity('HIGH')}
            >
              High
            </button>
          </div>
        </div>
      </div>

      {/* Rich Editorial Issue List */}
      <div className="editorial-issue-stack">
        {displayList.map(issue => {
          const isCritical = issue.severity === 'CRITICAL';
          const isResolved = ['RESOLVED', 'CLOSED'].includes(issue.status);
          const isOverdue = issue.dueAt && new Date(issue.dueAt).getTime() < Date.now() && !isResolved;

          return (
            <article 
              key={issue.id} 
              className={`editorial-issue-item ${isCritical ? 'is-critical-item' : ''} ${isOverdue ? 'is-overdue-item' : ''}`}
            >
              {/* Left Key and Meta column */}
              <div className="issue-meta-spine">
                <span className="issue-key-badge">{issue.key}</span>
                <span className={`issue-severity-pill sev-${issue.severity.toLowerCase()}`}>
                  {issue.severity}
                </span>
                <span className="issue-team-pill">{issue.team}</span>
              </div>

              {/* Main Content Area */}
              <div className="issue-content-body">
                <div className="issue-headline-row">
                  <h3 
                    className="issue-editorial-title"
                    onClick={() => setSelectedIssue(issue)}
                    role="button"
                    tabIndex={0}
                  >
                    {issue.title}
                  </h3>
                  
                  {isCritical && (
                    <span className="blocker-callout-tag">
                      <AlertCircle size={12} />
                      <span>RELEASE BLOCKER</span>
                    </span>
                  )}
                  {isOverdue && !isCritical && (
                    <span className="overdue-callout-tag">
                      <Clock size={12} />
                      <span>PAST DUE</span>
                    </span>
                  )}
                </div>

                {/* Reason it deserves attention */}
                <div className="issue-attention-reason">
                  <span className="reason-label">ATTENTION RATIONALE:</span>
                  <span className="reason-text">{issue.attentionReason || issue.description}</span>
                </div>

                {/* Micro Metadata Row */}
                <div className="issue-micro-meta">
                  <div className="meta-assignee">
                    <div className="avatar-chip">{issue.assignee.avatar || 'DE'}</div>
                    <span className="assignee-name">{issue.assignee.name}</span>
                  </div>
                  <span className="meta-sep">·</span>
                  <span className="meta-component">{issue.component}</span>
                  <span className="meta-sep">·</span>
                  <span className="meta-updated">Updated {formatRelativeTime(issue.updatedAt)}</span>
                  <span className="meta-sep">·</span>
                  <span className="meta-risk">Risk Score: <strong>{issue.risk.score}/10</strong></span>
                </div>
              </div>

              {/* Right Interactive Controls */}
              <div className="issue-action-dock">
                {/* Status Selector */}
                <div className="status-dropdown-wrap">
                  <select
                    className={`status-select-input status-${issue.status.toLowerCase()}`}
                    value={issue.status}
                    onChange={e => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                    aria-label={`Change status for ${issue.key}`}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                {/* Inspect Button */}
                <button
                  className="inspect-details-btn"
                  onClick={() => setSelectedIssue(issue)}
                  title={`Inspect full details for ${issue.key}`}
                >
                  <span>Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </article>
          );
        })}

        {displayList.length === 0 && (
          <div className="empty-editorial-notice">
            <CheckCircle2 size={24} className="text-emerald" />
            <p>No issues match current severity and status filters.</p>
          </div>
        )}
      </div>

      {/* Footer Navigation Link to Full Table */}
      <div className="work-section-footer">
        <span className="footer-count-label">
          Showing <strong>{displayList.length}</strong> prioritized items of <strong>{issues.length}</strong> total
        </span>

        <button 
          className="editorial-action-link"
          onClick={() => setActiveRoute('issues')}
        >
          <span>Explore all issues in comprehensive table</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};
