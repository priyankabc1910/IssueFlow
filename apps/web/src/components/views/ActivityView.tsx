import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  GitCommit,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime } from '../../services/intelligence';
import { ActivityEvent } from '../../types';

export const ActivityView: React.FC = () => {
  const { activity, issues, setSelectedIssue, setNotice } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = activity.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (query) {
      const q = query.toLowerCase();
      const match =
        item.detail.toLowerCase().includes(q) ||
        item.actor.name.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        (item.targetKey && item.targetKey.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,Actor,Type,Target,Detail\n' +
      activity.map(a => `"${a.id}","${a.timestamp}","${a.actor.name}","${a.type}","${a.target}","${a.detail.replace(/"/g, '""')}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `issueflow-activity-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice('Exported activity audit log to CSV.');
  };

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'created': return <PlusCircle size={14} className="text-blue" />;
      case 'resolved': return <CheckCircle2 size={14} className="text-emerald" />;
      case 'status_changed': return <GitCommit size={14} className="text-indigo" />;
      case 'priority_changed': return <AlertCircle size={14} className="text-amber" />;
      case 'comment_added': return <MessageSquare size={14} className="text-purple" />;
      case 'checklist_updated': return <FileCheck size={14} className="text-emerald" />;
      case 'sla_warning': return <ShieldAlert size={14} className="text-crimson" />;
      default: return <GitCommit size={14} className="text-slate" />;
    }
  };

  return (
    <div className="view-container activity-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">COMPLIANCE & AUDIT TRAIL // SYSTEM LEDGER</span>
          <h1 className="view-main-title">Activity Log</h1>
          <p className="view-sub-desc">
            Complete chronological record of issue creations, status transitions, priority changes, and releases.
          </p>
        </div>

        <button
          className="editorial-btn-secondary"
          onClick={handleExportCsv}
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="practical-filter-bar">
        <div className="filter-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search by actor, issue key, description..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="filter-text-input"
          />
        </div>

        <div className="filter-dropdown-cluster">
          <div className="filter-select-wrapper">
            <label className="filter-mini-label">Event Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="practical-select"
            >
              <option value="ALL">All Event Types</option>
              <option value="status_changed">Status Changes</option>
              <option value="created">Created Issues</option>
              <option value="resolved">Resolved Issues</option>
              <option value="comment_added">Comments Added</option>
              <option value="priority_changed">Priority Changes</option>
              <option value="checklist_updated">Release Checklists</option>
              <option value="sla_warning">SLA Warnings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="practical-table-card">
        <div className="table-responsive-wrapper">
          <table className="practical-data-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ACTOR</th>
                <th>EVENT TYPE</th>
                <th>TARGET</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const matchIssue = item.targetKey ? issues.find(i => i.key === item.targetKey) : null;

                return (
                  <tr key={item.id}>
                    <td className="text-muted text-xs whitespace-nowrap">
                      {formatRelativeTime(item.timestamp)}
                    </td>
                    <td>
                      <div className="assignee-cell-dock">
                        <span className="avatar-chip">{item.actor.avatar || 'DE'}</span>
                        <strong className="text-xs">{item.actor.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="event-type-chip">
                        {getEventIcon(item.type)}
                        <span>{item.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </td>
                    <td>
                      {matchIssue ? (
                        <button
                          className="key-link-btn"
                          onClick={() => setSelectedIssue(matchIssue)}
                        >
                          {item.targetKey}
                        </button>
                      ) : (
                        <strong className="text-xs">{item.target}</strong>
                      )}
                    </td>
                    <td className="text-xs text-secondary-color">
                      {item.detail}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-empty-td">
                    No activity entries found matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
