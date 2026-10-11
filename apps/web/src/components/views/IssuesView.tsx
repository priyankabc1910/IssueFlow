import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  User as UserIcon,
  CircleDot
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Issue, IssueStatus, Priority, Severity } from '../../types';
import { formatLabel } from '../../services/intelligence';

export const IssuesView: React.FC = () => {
  const {
    issues,
    filterState,
    setFilterState,
    setSelectedIssue,
    setShowCreateModal,
    updateIssueStatus,
    teams
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [sortField, setSortField] = useState<'key' | 'risk' | 'dueAt' | 'severity'>('risk');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter issues
  const filtered = issues.filter(issue => {
    if (filterState.status !== 'ALL' && issue.status !== filterState.status) return false;
    if (filterState.priority !== 'ALL' && issue.priority !== filterState.priority) return false;
    if (filterState.severity !== 'ALL' && issue.severity !== filterState.severity) return false;
    if (filterState.team !== 'ALL' && issue.team !== filterState.team) return false;
    if (filterState.component !== 'ALL' && issue.component !== filterState.component) return false;
    if (filterState.query) {
      const q = filterState.query.toLowerCase();
      const match =
        issue.key.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.component.toLowerCase().includes(q) ||
        issue.assignee.name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === 'risk') diff = b.risk.score - a.risk.score;
    if (sortField === 'key') diff = a.key.localeCompare(b.key);
    if (sortField === 'dueAt') {
      const tA = a.dueAt ? new Date(a.dueAt).getTime() : 0;
      const tB = b.dueAt ? new Date(b.dueAt).getTime() : 0;
      diff = tB - tA;
    }
    if (sortField === 'severity') {
      const weight: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      diff = weight[b.severity] - weight[a.severity];
    }
    return sortAsc ? -diff : diff;
  });

  const handleResetFilters = () => {
    setFilterState({
      query: '',
      status: 'ALL',
      priority: 'ALL',
      severity: 'ALL',
      team: 'ALL',
      component: 'ALL',
      assignee: 'ALL'
    });
  };

  const allComponents = Array.from(new Set(issues.map(i => i.component)));

  const kanbanColumns: { status: IssueStatus; label: string; count: number }[] = [
    { status: 'OPEN', label: 'Open', count: sorted.filter(i => i.status === 'OPEN').length },
    { status: 'IN_PROGRESS', label: 'In Progress', count: sorted.filter(i => i.status === 'IN_PROGRESS').length },
    { status: 'IN_REVIEW', label: 'In Review', count: sorted.filter(i => i.status === 'IN_REVIEW').length },
    { status: 'RESOLVED', label: 'Resolved', count: sorted.filter(i => i.status === 'RESOLVED').length }
  ];

  return (
    <div className="view-container issues-view-container">
      {/* Header bar */}
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">ENGINEERING OPERATIONS // WORKSPACE QUEUE</span>
          <h1 className="view-main-title">All Issues</h1>
          <p className="view-sub-desc">
            Full operational registry with explainable risk scores, SLA indicators, and multi-dimensional filtering.
          </p>
        </div>

        <div className="view-actions-right">
          <div className="view-toggle-segment">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'is-active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
            <button
              className={`toggle-btn ${viewMode === 'board' ? 'is-active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Board View"
            >
              <LayoutGrid size={14} />
              <span>Board</span>
            </button>
          </div>

          <button
            className="editorial-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={15} />
            <span>Create issue</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="practical-filter-bar">
        {/* Search input */}
        <div className="filter-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search key, title, component, assignee..."
            value={filterState.query}
            onChange={e => setFilterState(prev => ({ ...prev, query: e.target.value }))}
            className="filter-text-input"
          />
        </div>

        {/* Dropdowns */}
        <div className="filter-dropdown-cluster">
          {/* Status */}
          <div className="filter-select-wrapper">
            <label className="filter-mini-label">Status</label>
            <select
              value={filterState.status}
              onChange={e => setFilterState(prev => ({ ...prev, status: e.target.value }))}
              className="practical-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Severity */}
          <div className="filter-select-wrapper">
            <label className="filter-mini-label">Severity</label>
            <select
              value={filterState.severity}
              onChange={e => setFilterState(prev => ({ ...prev, severity: e.target.value }))}
              className="practical-select"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Priority */}
          <div className="filter-select-wrapper">
            <label className="filter-mini-label">Priority</label>
            <select
              value={filterState.priority}
              onChange={e => setFilterState(prev => ({ ...prev, priority: e.target.value }))}
              className="practical-select"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Team */}
          <div className="filter-select-wrapper">
            <label className="filter-mini-label">Team</label>
            <select
              value={filterState.team}
              onChange={e => setFilterState(prev => ({ ...prev, team: e.target.value }))}
              className="practical-select"
            >
              <option value="ALL">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Component */}
          <div className="filter-select-wrapper">
            <label className="filter-mini-label">Component</label>
            <select
              value={filterState.component}
              onChange={e => setFilterState(prev => ({ ...prev, component: e.target.value }))}
              className="practical-select"
            >
              <option value="ALL">All Components</option>
              {allComponents.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {(filterState.query || filterState.status !== 'ALL' || filterState.severity !== 'ALL' || filterState.priority !== 'ALL' || filterState.team !== 'ALL' || filterState.component !== 'ALL') && (
            <button
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        /* Practical Working Table */
        <div className="practical-table-card">
          <div className="table-responsive-wrapper">
            <table className="practical-data-table">
              <thead>
                <tr>
                  <th onClick={() => { setSortField('key'); setSortAsc(!sortAsc); }} className="cursor-pointer">
                    <span className="th-content">KEY <ArrowUpDown size={11} /></span>
                  </th>
                  <th>TITLE</th>
                  <th onClick={() => { setSortField('severity'); setSortAsc(!sortAsc); }} className="cursor-pointer">
                    <span className="th-content">SEVERITY <ArrowUpDown size={11} /></span>
                  </th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th onClick={() => { setSortField('risk'); setSortAsc(!sortAsc); }} className="cursor-pointer">
                    <span className="th-content">RISK SCORE <ArrowUpDown size={11} /></span>
                  </th>
                  <th>COMPONENT</th>
                  <th>ASSIGNEE</th>
                  <th onClick={() => { setSortField('dueAt'); setSortAsc(!sortAsc); }} className="cursor-pointer">
                    <span className="th-content">DUE DATE <ArrowUpDown size={11} /></span>
                  </th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(issue => {
                  const isCritical = issue.severity === 'CRITICAL';
                  const isOverdue = issue.dueAt && new Date(issue.dueAt).getTime() < Date.now() && !['RESOLVED', 'CLOSED'].includes(issue.status);

                  return (
                    <tr 
                      key={issue.id}
                      className={`table-issue-row ${isCritical ? 'row-critical-highlight' : ''}`}
                    >
                      <td className="td-key">
                        <button
                          className="key-link-btn"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          {issue.key}
                        </button>
                      </td>
                      <td className="td-title">
                        <div 
                          className="title-cell-wrap"
                          onClick={() => setSelectedIssue(issue)}
                          role="button"
                          tabIndex={0}
                        >
                          <strong className="issue-main-title-text">{issue.title}</strong>
                          {issue.attentionReason && (
                            <small className="issue-brief-reason">{issue.attentionReason}</small>
                          )}
                        </div>
                      </td>
                      <td className="td-severity">
                        <span className={`pill-badge sev-${issue.severity.toLowerCase()}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="td-priority">
                        <span className={`pill-badge prio-${issue.priority.toLowerCase()}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="td-status">
                        <span className={`pill-badge status-${issue.status.toLowerCase()}`}>
                          {formatLabel(issue.status)}
                        </span>
                      </td>
                      <td className="td-risk">
                        <span className={`risk-badge risk-${issue.risk.level.toLowerCase()}`}>
                          <strong>{issue.risk.score}</strong>
                          <small>/10</small>
                        </span>
                      </td>
                      <td className="td-component">
                        <span className="comp-tag-pill">{issue.component}</span>
                      </td>
                      <td className="td-assignee">
                        <div className="assignee-cell-dock">
                          <span className="avatar-chip">{issue.assignee.avatar || 'DE'}</span>
                          <span className="name-trunc">{issue.assignee.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="td-due">
                        {issue.dueAt ? (
                          <span className={`due-date-pill ${isOverdue ? 'is-overdue' : ''}`}>
                            {new Date(issue.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="td-actions">
                        <select
                          className="table-status-select"
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
                      </td>
                    </tr>
                  );
                })}

                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={10} className="table-empty-td">
                      <div className="table-empty-state">
                        <CheckCircle2 size={32} className="text-emerald" />
                        <strong>No issues matching filter criteria</strong>
                        <p>Adjust your search filters or click "Reset" to view all issues.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer-status-bar">
            <span>
              Showing <strong>{sorted.length}</strong> of <strong>{issues.length}</strong> issues
            </span>
            <span className="text-muted">Click any issue row or key to open full inspector drawer</span>
          </div>
        </div>
      ) : (
        /* Board / Kanban View */
        <div className="practical-kanban-board">
          {kanbanColumns.map(col => {
            const columnIssues = sorted.filter(i => i.status === col.status);

            return (
              <div key={col.status} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="col-title-group">
                    <span className="col-name">{col.label}</span>
                    <span className="col-count-badge">{columnIssues.length}</span>
                  </div>
                </div>

                <div className="kanban-cards-stack">
                  {columnIssues.map(issue => (
                    <div
                      key={issue.id}
                      className={`kanban-card ${issue.severity === 'CRITICAL' ? 'is-critical-card' : ''}`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <div className="kanban-card-top">
                        <span className="card-key-tag">{issue.key}</span>
                        <span className={`card-sev-dot sev-${issue.severity.toLowerCase()}`} title={`Severity: ${issue.severity}`} />
                      </div>

                      <h4 className="kanban-card-title">{issue.title}</h4>

                      <div className="kanban-card-meta">
                        <span className="comp-tag-pill">{issue.component}</span>
                        <span className="risk-mini-badge">Risk {issue.risk.score}</span>
                      </div>

                      <div className="kanban-card-footer">
                        <div className="assignee-mini">
                          <span className="avatar-chip">{issue.assignee.avatar || 'DE'}</span>
                          <span className="name">{issue.assignee.name.split(' ')[0]}</span>
                        </div>
                        {issue.dueAt && (
                          <span className="due-mini">
                            <Clock size={11} />
                            <span>{new Date(issue.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnIssues.length === 0 && (
                    <div className="kanban-empty-lane">
                      <span>No issues in this stage</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
