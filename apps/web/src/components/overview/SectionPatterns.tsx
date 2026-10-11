import React from 'react';
import {
  Zap,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  GitMerge,
  AlertTriangle,
  Lightbulb,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionPatterns: React.FC = () => {
  const { patterns, navigateToFilteredIssues } = useApp();

  return (
    <section className="story-section patterns-story-section" id="section-patterns">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 05 // SYSTEMIC FAILURE RECURRENCE</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">STRUCTURAL ANOMALY CLUSTERING</span>
      </div>

      <div className="patterns-editorial-header">
        <div className="patterns-title-col">
          <h2 className="editorial-section-title">
            Individual bugs become <br />
            <span className="title-italic-accent">engineering patterns.</span>
          </h2>
          <p className="editorial-section-desc">
            A single timeout is an incident; five identical timeouts across sprint boundaries 
            is an architectural pattern. IssueFlow continuously clusters telemetry, stack traces, 
            and token signatures to isolate chronic operational friction.
          </p>
        </div>

        <div className="patterns-mock-disclaimer">
          <span className="pulse-indicator-dot" />
          <span>Pattern recognition engine powered by simulated failure clusters.</span>
        </div>
      </div>

      {/* Pattern Cards Visual Composition */}
      <div className="patterns-cards-grid">
        {patterns.map((pattern, idx) => {
          const isCritical = pattern.severity === 'CRITICAL';

          return (
            <div 
              key={pattern.id} 
              className={`pattern-editorial-card ${isCritical ? 'is-critical-pattern' : ''}`}
            >
              {/* Card Meta Top */}
              <div className="pattern-card-top">
                <div className="pattern-index-badge">
                  <span className="pattern-num">0{idx + 1}</span>
                  <span className={`pattern-sev-pill sev-${pattern.severity.toLowerCase()}`}>
                    {pattern.severity}
                  </span>
                </div>
                <div className="pattern-occurrence-chip">
                  <Radio size={12} className="text-crimson pulse-dot" />
                  <span>Last seen {pattern.lastSeen}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="pattern-title">{pattern.title}</h3>

              {/* Relationship Visual: Affected Components Nodes */}
              <div className="pattern-components-cluster">
                <span className="cluster-label">AFFECTED SYSTEM BOUNDARIES:</span>
                <div className="nodes-flow">
                  {pattern.affectedComponents.map((comp, cIdx) => (
                    <React.Fragment key={comp}>
                      <span className="comp-node-pill">{comp}</span>
                      {cIdx < pattern.affectedComponents.length - 1 && (
                        <span className="node-link-arrow">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Trend & Volume Band */}
              <div className="pattern-trend-strip">
                <div className="trend-col">
                  <span className="stat-label">CLUSTER VOLUME</span>
                  <span className="stat-value">
                    <strong>{pattern.relatedIssuesCount}</strong> linked tickets
                  </span>
                </div>
                <div className="trend-col">
                  <span className="stat-label">OBSERVED TRAJECTORY</span>
                  <span className="stat-trajectory-text">{pattern.trend}</span>
                </div>
              </div>

              {/* Prescriptive Engineering Action */}
              <div className="pattern-action-box">
                <div className="action-tag">
                  <Lightbulb size={13} className="lightbulb-icon" />
                  <span>SUGGESTED ARCHITECTURAL RESOLUTION</span>
                </div>
                <p className="action-body">{pattern.suggestedAction}</p>
              </div>

              {/* Card Footer Link */}
              <div className="pattern-card-footer">
                <button
                  className="pattern-link-btn"
                  onClick={() => navigateToFilteredIssues({ component: pattern.affectedComponents[0] || 'ALL' })}
                >
                  <span>Inspect cluster issues</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
