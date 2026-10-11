import React, { useState } from 'react';
import { X, Plus, Terminal, AlertOctagon, Layers, Calendar, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, Severity } from '../../types';

export const CreateIssueModal: React.FC = () => {
  const { showCreateModal, setShowCreateModal, createIssue, teams, users } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [component, setComponent] = useState('Web App');
  const [team, setTeam] = useState('Platform & Infrastructure');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [dueAt, setDueAt] = useState('');

  if (!showCreateModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createIssue({
      title: title.trim(),
      description: description.trim(),
      severity,
      priority,
      component: component.trim() || 'General',
      team,
      assigneeId,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null
    });
  };

  return (
    <div 
      className="modal-backdrop-editorial"
      onClick={() => setShowCreateModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-create-title"
    >
      <div 
        className="modal-dialog-editorial"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header-editorial">
          <div className="modal-title-lockup">
            <span className="editorial-kicker">INCIDENT INTAKE // NEW TELEMETRY</span>
            <h2 id="modal-create-title" className="modal-heading">Create Engineering Issue</h2>
          </div>
          <button
            className="modal-close-icon-btn"
            onClick={() => setShowCreateModal(false)}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          <label className="form-group-editorial">
            <span className="group-label">Issue Title</span>
            <input
              type="text"
              required
              minLength={5}
              placeholder="e.g. Memory leak in background worker during mass SLA scan"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="editorial-input"
              autoFocus
            />
          </label>

          <label className="form-group-editorial">
            <span className="group-label">Description & Observed Impact</span>
            <textarea
              required
              rows={4}
              placeholder="Detail the failure mode, observed latency spikes, and downstream impact..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="editorial-textarea"
            />
          </label>

          <div className="form-row-duo">
            <label className="form-group-editorial">
              <span className="group-label">Severity</span>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as Severity)}
                className="editorial-select"
              >
                <option value="LOW">Low (Minor polish/hygiene)</option>
                <option value="MEDIUM">Medium (Non-blocking bug)</option>
                <option value="HIGH">High (Elevated latency/errors)</option>
                <option value="CRITICAL">Critical (Production outage/blocker)</option>
              </select>
            </label>

            <label className="form-group-editorial">
              <span className="group-label">Priority</span>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="editorial-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>

          <div className="form-row-duo">
            <label className="form-group-editorial">
              <span className="group-label">Component</span>
              <input
                type="text"
                placeholder="e.g. Payment Gateway"
                value={component}
                onChange={e => setComponent(e.target.value)}
                className="editorial-input"
              />
            </label>

            <label className="form-group-editorial">
              <span className="group-label">Responsible Squad</span>
              <select
                value={team}
                onChange={e => setTeam(e.target.value)}
                className="editorial-select"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row-duo">
            <label className="form-group-editorial">
              <span className="group-label">Assignee</span>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="editorial-select"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </label>

            <label className="form-group-editorial">
              <span className="group-label">Target Resolution Date</span>
              <input
                type="date"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="editorial-input"
              />
            </label>
          </div>

          <div className="modal-actions-footer">
            <button
              type="button"
              className="editorial-btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="editorial-btn-primary"
            >
              <Plus size={15} />
              <span>Create and Triage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
