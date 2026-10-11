import React, { useState } from 'react';
import {
  History,
  GitCommit,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  PlusCircle,
  FileCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime } from '../../services/intelligence';
import { ActivityEvent } from '../../types';

export const SectionRecentStory: React.FC = () => {
  const { activity, setActiveRoute, setSelectedIssue, issues } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActivity = activity.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'STATUS') return ['status_changed', 'resolved'].includes(item.type);
    if (filterType === 'COMMENTS') return item.type === 'comment_added';
    if (filterType === 'CRITICAL') return ['sla_warning', 'priority_changed'].includes(item.type);
    if (filterType === 'RELEASE') return item.type === 'checklist_updated';
    return true;
  });

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'created':
        return <PlusCircle size={14} className="text-blue" />;
      case 'resolved':
        return <CheckCircle2 size={14} className="text-emerald" />;
      case 'status_changed':
        return <GitCommit size={14} className="text-indigo" />;
      case 'priority_changed':
        return <AlertCircle size={14} className="text-amber" />;
      case 'comment_added':
        return <MessageSquare size={14} className="text-purple" />;
      case 'checklist_updated':
        return <FileCheck size={14} className="text-emerald" />;
      case 'sla_warning':
        return <ShieldAlert size={14} className="text-crimson" />;
      default:
        return <GitCommit size={14} className="text-slate" />;
    }
  };

  const handleTargetClick = (item: ActivityEvent) => {
    if (item.targetKey) {
      const match = issues.find(i => i.key === item.targetKey);
      if (match) {
        setSelectedIssue(match);
      }
    }
  };

  return (
    <section className="story-section recent-story-section" id="section-activity">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 08 // THE LIVING CHRONICLE</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">REAL-TIME AUDIT JOURNAL</span>
      </div>

      <div className="recent-editorial-header">
        <div className="recent-title-col">
          <h2 className="editorial-section-title">
            The recent <br />
            <span className="title-italic-accent">engineering story.</span>
          </h2>
          <p className="editorial-section-desc">
            Every commit, status transition, priority elevation, and audit review tells 
            the living story of how your team works through complexity.
          </p>
        </div>

        {/* Filter Strip */}
        <div className="activity-filter-strip">
          <span className="strip-lbl">FILTER STREAM:</span>
          <button 
            className={`filter-btn-pill ${filterType === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All Events
          </button>
          <button 
            className={`filter-btn-pill ${filterType === 'STATUS' ? 'is-active' : ''}`}
            onClick={() => setFilterType('STATUS')}
          >
            Transitions
          </button>
          <button 
            className={`filter-btn-pill ${filterType === 'COMMENTS' ? 'is-active' : ''}`}
            onClick={() => setFilterType('COMMENTS')}
          >
            Comments
          </button>
          <button 
            className={`filter-btn-pill ${filterType === 'CRITICAL' ? 'is-active' : ''}`}
            onClick={() => setFilterType('CRITICAL')}
          >
            SLA & Alerts
          </button>
          <button 
            className={`filter-btn-pill ${filterType === 'RELEASE' ? 'is-active' : ''}`}
            onClick={() => setFilterType('RELEASE')}
          >
            Release Checks
          </button>
        </div>
      </div>

      {/* Visually Connected Timeline */}
      <div className="connected-timeline-wrapper">
        <div className="timeline-spine-line" aria-hidden="true" />

        <div className="timeline-events-stream">
          {filteredActivity.map((event, idx) => (
            <div key={event.id} className="timeline-event-node">
              {/* Node Marker & Icon */}
              <div className="node-marker-hub">
                <div className="marker-disc">
                  {getEventIcon(event.type)}
                </div>
              </div>

              {/* Node Content Card */}
              <div className="node-content-block">
                <div className="node-meta-row">
                  <div className="actor-author-group">
                    <span className="actor-avatar-chip">{event.actor.avatar || 'DE'}</span>
                    <strong className="actor-name">{event.actor.name}</strong>
                  </div>

                  <span className="node-timestamp">{formatRelativeTime(event.timestamp)}</span>
                </div>

                <div className="node-detail-narrative">
                  {event.targetKey ? (
                    <button 
                      className="node-target-key-pill"
                      onClick={() => handleTargetClick(event)}
                      title={`Inspect ${event.targetKey}`}
                    >
                      {event.targetKey}
                    </button>
                  ) : (
                    <span className="node-target-text">{event.target}</span>
                  )}
                  <span className="node-body-detail">{event.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Next Action Callout */}
      <div className="overview-terminal-cta">
        <div className="terminal-inner">
          <div className="cta-text-group">
            <span className="cta-kicker">ENGINEERING CONTINUITY</span>
            <h3 className="cta-title">See the whole engineering story unfold in real time.</h3>
            <p className="cta-desc">
              Audit the complete event log, inspect code commits, or configure automated SLA scanner jobs.
            </p>
          </div>

          <div className="cta-buttons-dock">
            <button
              className="editorial-btn-primary"
              onClick={() => setActiveRoute('activity')}
            >
              <span>Explore all engineering activity</span>
              <ArrowRight size={15} />
            </button>
            <button
              className="editorial-btn-secondary"
              onClick={() => setActiveRoute('issues')}
            >
              <span>Open full issue tracker</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
