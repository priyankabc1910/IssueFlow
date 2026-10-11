import React from 'react';
import {
  CheckSquare,
  Clock,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueStatus } from '../../types';

export const MyTasksView: React.FC = () => {
  const { user, issues, setSelectedIssue, updateIssueStatus, setShowCreateModal } = useApp();

  const myIssues = issues.filter(i => i.assignee.id === user.id);

  const inProgress = myIssues.filter(i => i.status === 'IN_PROGRESS');
  const openIssues = myIssues.filter(i => i.status === 'OPEN');
  const inReview = myIssues.filter(i => i.status === 'IN_REVIEW');
  const resolved = myIssues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status));

  return (
    <div className="view-container my-tasks-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">PERSONAL TRIAGE QUEUE // {user.name.toUpperCase()}</span>
          <h1 className="view-main-title">My Tasks</h1>
          <p className="view-sub-desc">
            Issues assigned directly to you across all product squads and release streams.
          </p>
        </div>

        <button
          className="editorial-btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={15} />
          <span>Create issue</span>
        </button>
      </div>

      {/* Task Summary Banner */}
      <div className="my-tasks-summary-band">
        <div className="task-summary-stat">
          <span className="lbl">TOTAL ASSIGNED</span>
          <strong className="val">{myIssues.length}</strong>
        </div>
        <div className="task-summary-stat">
          <span className="lbl">IN PROGRESS</span>
          <strong className="val text-indigo">{inProgress.length}</strong>
        </div>
        <div className="task-summary-stat">
          <span className="lbl">AWAITING TRIAGE</span>
          <strong className="val text-amber">{openIssues.length}</strong>
        </div>
        <div className="task-summary-stat">
          <span className="lbl">RESOLVED THIS SPRINT</span>
          <strong className="val text-emerald">{resolved.length}</strong>
        </div>
      </div>

      {/* Task Sections */}
      <div className="my-tasks-sections-stack">
        {/* In Progress */}
        <div className="task-group-card">
          <div className="task-group-head">
            <div className="title-left">
              <span className="group-dot indigo" />
              <h3>In Progress ({inProgress.length})</h3>
            </div>
            <span className="group-hint">Active development & local testing</span>
          </div>

          <div className="task-items-list">
            {inProgress.map(issue => (
              <div key={issue.id} className="my-task-row">
                <div className="task-left-info">
                  <span className="task-key-tag">{issue.key}</span>
                  <div className="task-text">
                    <h4 onClick={() => setSelectedIssue(issue)} role="button" tabIndex={0}>
                      {issue.title}
                    </h4>
                    <span className="task-comp">{issue.component} · Risk {issue.risk.score}/10</span>
                  </div>
                </div>

                <div className="task-actions-right">
                  <select
                    className="task-status-select"
                    value={issue.status}
                    onChange={e => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>
            ))}
            {inProgress.length === 0 && <p className="empty-tasks-hint">No items currently in progress.</p>}
          </div>
        </div>

        {/* Open Queue */}
        <div className="task-group-card">
          <div className="task-group-head">
            <div className="title-left">
              <span className="group-dot amber" />
              <h3>To Do & Triaged ({openIssues.length})</h3>
            </div>
            <span className="group-hint">Prioritized for upcoming work</span>
          </div>

          <div className="task-items-list">
            {openIssues.map(issue => (
              <div key={issue.id} className="my-task-row">
                <div className="task-left-info">
                  <span className="task-key-tag">{issue.key}</span>
                  <div className="task-text">
                    <h4 onClick={() => setSelectedIssue(issue)} role="button" tabIndex={0}>
                      {issue.title}
                    </h4>
                    <span className="task-comp">{issue.component} · Risk {issue.risk.score}/10</span>
                  </div>
                </div>

                <div className="task-actions-right">
                  <select
                    className="task-status-select"
                    value={issue.status}
                    onChange={e => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">Start Work (In Progress)</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>
            ))}
            {openIssues.length === 0 && <p className="empty-tasks-hint">Your open backlog is clean.</p>}
          </div>
        </div>

        {/* Resolved */}
        <div className="task-group-card">
          <div className="task-group-head">
            <div className="title-left">
              <span className="group-dot emerald" />
              <h3>Resolved & Verified ({resolved.length})</h3>
            </div>
            <span className="group-hint">Closed during active sprint</span>
          </div>

          <div className="task-items-list">
            {resolved.map(issue => (
              <div key={issue.id} className="my-task-row is-resolved">
                <div className="task-left-info">
                  <span className="task-key-tag">{issue.key}</span>
                  <div className="task-text">
                    <h4 onClick={() => setSelectedIssue(issue)} role="button" tabIndex={0}>
                      {issue.title}
                    </h4>
                    <span className="task-comp text-emerald">Verified resolution in {issue.component}</span>
                  </div>
                </div>

                <div className="task-actions-right">
                  <span className="resolved-check-badge">
                    <CheckCircle2 size={14} />
                    <span>Done</span>
                  </span>
                </div>
              </div>
            ))}
            {resolved.length === 0 && <p className="empty-tasks-hint">No resolved tasks yet this sprint.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
