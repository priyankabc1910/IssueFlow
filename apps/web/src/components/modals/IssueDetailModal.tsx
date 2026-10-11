import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Send,
  MessageSquare,
  User as UserIcon,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, Priority, Severity } from '../../types';
import { formatRelativeTime } from '../../services/intelligence';

export const IssueDetailModal: React.FC = () => {
  const {
    selectedIssue,
    setSelectedIssue,
    updateIssueStatus,
    updateIssuePriority,
    updateIssueAssignee,
    addComment,
    users
  } = useApp();

  const [commentText, setCommentText] = useState('');

  if (!selectedIssue) return null;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedIssue.id, commentText);
    setCommentText('');
  };

  const isCritical = selectedIssue.severity === 'CRITICAL';
  const isOverdue = selectedIssue.dueAt && new Date(selectedIssue.dueAt).getTime() < Date.now() && !['RESOLVED', 'CLOSED'].includes(selectedIssue.status);

  return (
    <div
      className="modal-backdrop-editorial is-drawer-mode"
      onClick={() => setSelectedIssue(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-detail-title"
    >
      <div
        className="modal-drawer-editorial"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header-strip">
          <div className="drawer-header-left">
            <span className="drawer-key-pill">{selectedIssue.key}</span>
            <span className={`drawer-sev-pill sev-${selectedIssue.severity.toLowerCase()}`}>
              {selectedIssue.severity}
            </span>
            <span className="drawer-team-tag">{selectedIssue.team}</span>
          </div>

          <button
            className="drawer-close-btn"
            onClick={() => setSelectedIssue(null)}
            aria-label="Close inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="drawer-scroll-body">
          {/* Title */}
          <h2 id="issue-detail-title" className="drawer-main-title">
            {selectedIssue.title}
          </h2>

          {/* Attention Callout if applicable */}
          {selectedIssue.attentionReason && (
            <div className={`drawer-attention-box ${isCritical ? 'is-critical' : ''}`}>
              <div className="attention-head">
                {isCritical ? <Flame size={14} className="text-crimson" /> : <ShieldAlert size={14} className="text-amber" />}
                <strong>TRIAGE RATIONALE:</strong>
              </div>
              <p>{selectedIssue.attentionReason}</p>
            </div>
          )}

          {/* Explainable Risk Assessment Block */}
          <div className="drawer-risk-card">
            <div className="risk-card-top">
              <span className="risk-score-badge">
                <strong>{selectedIssue.risk.score}</strong>
                <small>/10</small>
              </span>
              <div className="risk-level-lockup">
                <span className={`risk-level-title text-${selectedIssue.risk.level.toLowerCase()}`}>
                  {selectedIssue.risk.level} RISK ASSESSMENT
                </span>
                <span className="risk-algo-sub">Computed by IssueFlow telemetry engine</span>
              </div>
            </div>

            <div className="risk-reasons-cluster">
              <span className="reasons-label">SCORE FACTOR BREAKDOWN:</span>
              <ul className="drawer-reasons-list">
                {selectedIssue.risk.reasons.map((r, i) => (
                  <li key={i}>
                    <span className="bullet-point" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Operational Properties Matrix */}
          <div className="drawer-meta-grid">
            {/* Status */}
            <div className="meta-grid-item">
              <label>Status</label>
              <select
                value={selectedIssue.status}
                onChange={e => updateIssueStatus(selectedIssue.id, e.target.value as IssueStatus)}
                className={`drawer-select status-${selectedIssue.status.toLowerCase()}`}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="meta-grid-item">
              <label>Priority</label>
              <select
                value={selectedIssue.priority}
                onChange={e => updateIssuePriority(selectedIssue.id, e.target.value as Priority)}
                className="drawer-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="meta-grid-item">
              <label>Assignee</label>
              <select
                value={selectedIssue.assignee.id}
                onChange={e => updateIssueAssignee(selectedIssue.id, e.target.value)}
                className="drawer-select"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role.split(' ')[0]})</option>
                ))}
              </select>
            </div>

            {/* Component */}
            <div className="meta-grid-item">
              <label>Component</label>
              <span className="readonly-val">{selectedIssue.component}</span>
            </div>

            {/* Target Due Date */}
            <div className="meta-grid-item">
              <label>Target SLA Deadline</label>
              <span className={`readonly-val ${isOverdue ? 'text-crimson font-bold' : ''}`}>
                {selectedIssue.dueAt ? (
                  <>
                    {new Date(selectedIssue.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isOverdue && ' (SLA Breached)'}
                  </>
                ) : (
                  'No strict deadline'
                )}
              </span>
            </div>

            {/* Reopened count */}
            <div className="meta-grid-item">
              <label>Regression Reopens</label>
              <span className="readonly-val">
                {selectedIssue.reopenedCount > 0 ? `${selectedIssue.reopenedCount} time(s)` : 'None (First run)'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="drawer-text-section">
            <h3>Description</h3>
            <p className="drawer-desc-content">{selectedIssue.description}</p>
          </div>

          {/* Reproduction & Technical Context */}
          {selectedIssue.stepsToReproduce && (
            <div className="drawer-text-section">
              <h3>Steps to Reproduce</h3>
              <pre className="drawer-code-block"><code>{selectedIssue.stepsToReproduce}</code></pre>
            </div>
          )}

          {selectedIssue.actualResult && (
            <div className="drawer-text-section">
              <h3>Observed Telemetry Result</h3>
              <p className="drawer-desc-content">{selectedIssue.actualResult}</p>
            </div>
          )}

          {selectedIssue.environment && (
            <div className="drawer-text-section">
              <h3>Runtime Environment</h3>
              <span className="env-badge-tag">{selectedIssue.environment}</span>
            </div>
          )}

          {/* Comments and Engineering Audit Stream */}
          <div className="drawer-comments-section">
            <h3>Engineering Comments & Notes</h3>

            <div className="comments-stream">
              {(selectedIssue.comments && selectedIssue.comments.length > 0) ? (
                selectedIssue.comments.map(c => (
                  <div key={c.id} className="comment-bubble-item">
                    <div className="comment-head">
                      <div className="c-author">
                        <span className="avatar-chip">{c.author.avatar || 'DE'}</span>
                        <strong>{c.author.name}</strong>
                      </div>
                      <span className="c-date">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="c-text">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments-caption">No engineering comments logged yet.</p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="add-comment-dock">
              <input
                type="text"
                placeholder="Post an investigation update or mitigation note..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="comment-text-input"
              />
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={!commentText.trim()}
              >
                <Send size={14} />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
