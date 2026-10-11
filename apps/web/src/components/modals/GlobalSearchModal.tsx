import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CircleDot,
  Users2,
  GitBranch,
  ArrowRight,
  Plus,
  Compass,
  CornerDownLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RouteId } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    showSearchModal,
    setShowSearchModal,
    issues,
    teams,
    release,
    setSelectedIssue,
    setActiveRoute,
    setShowCreateModal
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearchModal) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [showSearchModal]);

  if (!showSearchModal) return null;

  const q = query.trim().toLowerCase();

  const matchingIssues = issues.filter(i =>
    !q ||
    i.key.toLowerCase().includes(q) ||
    i.title.toLowerCase().includes(q) ||
    i.component.toLowerCase().includes(q)
  ).slice(0, 5);

  const matchingTeams = teams.filter(t =>
    !q ||
    t.name.toLowerCase().includes(q) ||
    t.lead.toLowerCase().includes(q)
  );

  const handleSelectIssue = (issue: typeof issues[0]) => {
    setShowSearchModal(false);
    setSelectedIssue(issue);
  };

  const handleSelectRoute = (route: RouteId) => {
    setShowSearchModal(false);
    setActiveRoute(route);
  };

  const handleCreateNew = () => {
    setShowSearchModal(false);
    setShowCreateModal(true);
  };

  return (
    <div
      className="modal-backdrop-editorial is-search-backdrop"
      onClick={() => setShowSearchModal(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-search-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="search-modal-input-row">
          <Search size={18} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search issues by key, title, component, or squad..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-modal-input"
          />
          <kbd className="esc-kbd" onClick={() => setShowSearchModal(false)}>ESC</kbd>
        </div>

        {/* Results Container */}
        <div className="search-modal-results-stream">
          {/* Quick Actions */}
          {!q && (
            <div className="search-group-section">
              <span className="search-group-title">QUICK ACTIONS</span>
              <div className="search-items-list">
                <button className="search-item-btn" onClick={handleCreateNew}>
                  <div className="item-icon-wrap"><Plus size={14} /></div>
                  <span className="item-title-text">Create a new engineering issue</span>
                  <span className="item-hint">Action</span>
                </button>
                <button className="search-item-btn" onClick={() => handleSelectRoute('overview')}>
                  <div className="item-icon-wrap"><Compass size={14} /></div>
                  <span className="item-title-text">Jump to Overview storytelling dashboard</span>
                  <span className="item-hint">Route</span>
                </button>
                <button className="search-item-btn" onClick={() => handleSelectRoute('releases')}>
                  <div className="item-icon-wrap"><GitBranch size={14} /></div>
                  <span className="item-title-text">Inspect Release {release.version} gates</span>
                  <span className="item-hint">Route</span>
                </button>
              </div>
            </div>
          )}

          {/* Matching Issues */}
          {matchingIssues.length > 0 && (
            <div className="search-group-section">
              <span className="search-group-title">ISSUES ({matchingIssues.length})</span>
              <div className="search-items-list">
                {matchingIssues.map(issue => (
                  <button
                    key={issue.id}
                    className="search-item-btn"
                    onClick={() => handleSelectIssue(issue)}
                  >
                    <div className="item-icon-wrap"><CircleDot size={14} /></div>
                    <div className="item-text-dock">
                      <span className="item-key-chip">{issue.key}</span>
                      <strong className="item-title-text">{issue.title}</strong>
                    </div>
                    <span className="item-component-pill">{issue.component}</span>
                    <CornerDownLeft size={12} className="enter-icon" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Teams */}
          {matchingTeams.length > 0 && (
            <div className="search-group-section">
              <span className="search-group-title">TEAMS ({matchingTeams.length})</span>
              <div className="search-items-list">
                {matchingTeams.map(t => (
                  <button
                    key={t.id}
                    className="search-item-btn"
                    onClick={() => handleSelectRoute('teams')}
                  >
                    <div className="item-icon-wrap"><Users2 size={14} /></div>
                    <span className="item-title-text">{t.name}</span>
                    <span className="item-hint">Lead: {t.lead}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && matchingIssues.length === 0 && matchingTeams.length === 0 && (
            <div className="search-no-results">
              <p>No issues, squads, or components found for "{query}".</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="search-modal-footer">
          <span>Navigate with mouse or keyboard</span>
          <span>Press <strong>ESC</strong> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
