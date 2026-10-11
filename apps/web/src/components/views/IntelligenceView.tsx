import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Zap,
  ShieldAlert,
  Search,
  ArrowRight,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateSimilarity } from '../../services/intelligence';

export const IntelligenceView: React.FC = () => {
  const { issues, patterns, setNotice, navigateToFilteredIssues } = useApp();

  // Similarity Lab State
  const [titleA, setTitleA] = useState('Checkout fails for saved payment methods on 3D Secure v2');
  const [titleB, setTitleB] = useState('Payment gateway timeouts when selecting saved cards in checkout');
  const similarityScore = calculateSimilarity(titleA, titleB);

  // Trigger simulated SLA scan
  const handleTriggerSlaScan = () => {
    setNotice('Queued automated SLA scan worker. Checked 12 issues against SLA policies. 2 overdue warnings flagged.');
  };

  return (
    <div className="view-container intelligence-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">ENGINEERING INTELLIGENCE // EXPLAINABLE ANALYTICS</span>
          <h1 className="view-main-title">Engineering Intelligence</h1>
          <p className="view-sub-desc">
            Deterministic risk quantification, duplicate token similarity, and systemic failure cluster analysis.
          </p>
        </div>

        <button
          className="editorial-btn-secondary"
          onClick={handleTriggerSlaScan}
        >
          <Activity size={15} />
          <span>Run SLA Scan Job</span>
        </button>
      </div>

      <div className="intelligence-grid-layout">
        {/* Left Column: Interactive Token Similarity Laboratory */}
        <div className="intel-card similarity-lab-card">
          <div className="intel-card-header">
            <div className="title-left">
              <span className="intel-icon"><GitCompare size={16} /></span>
              <h3>Duplicate Issue & Similarity Laboratory</h3>
            </div>
            <span className="intel-chip">TOKEN JACCARD ENGINE</span>
          </div>

          <p className="intel-desc">
            Test IssueFlow's token-based similarity detection algorithm. When new bugs are submitted, 
            IssueFlow computes stop-word filtered Jaccard token overlap to prevent duplicate triage.
          </p>

          <div className="similarity-inputs-stack">
            <div className="sim-input-box">
              <label>Issue Title A (Candidate Ticket)</label>
              <textarea
                rows={2}
                value={titleA}
                onChange={e => setTitleA(e.target.value)}
                className="sim-textarea"
              />
            </div>

            <div className="sim-input-box">
              <label>Issue Title B (Existing Knowledge Base)</label>
              <textarea
                rows={2}
                value={titleB}
                onChange={e => setTitleB(e.target.value)}
                className="sim-textarea"
              />
            </div>
          </div>

          {/* Live Similarity Score Result */}
          <div className="similarity-result-dock">
            <div className="sim-score-dial">
              <span className="sim-score-num">{similarityScore}%</span>
              <span className="sim-score-lbl">OVERLAP SIMILARITY</span>
            </div>

            <div className="sim-verdict-text">
              {similarityScore >= 60 ? (
                <div className="verdict-high">
                  <AlertTriangle size={15} className="text-crimson" />
                  <strong>High Duplicate Probability:</strong> Flagged for auto-deduplication link during intake.
                </div>
              ) : similarityScore >= 30 ? (
                <div className="verdict-med">
                  <Sparkles size={15} className="text-amber" />
                  <strong>Moderate Semantic Overlap:</strong> Suggested as related reference ticket.
                </div>
              ) : (
                <div className="verdict-low">
                  <CheckCircle2 size={15} className="text-emerald" />
                  <strong>Unique Incident:</strong> Distinct operational problem signature.
                </div>
              )}
            </div>
          </div>

          {/* Pre-fill quick samples */}
          <div className="quick-samples-row">
            <span className="samples-label">Test Samples:</span>
            <button
              className="sample-pill-btn"
              onClick={() => {
                setTitleA('Redis connection pool exhaustion during scheduled SLA scan jobs');
                setTitleB('BullMQ worker socket pool leak when running mass background scans');
              }}
            >
              Redis Worker Leak
            </button>
            <button
              className="sample-pill-btn"
              onClick={() => {
                setTitleA('Search results produce duplicates after rapid filter toggles');
                setTitleB('Catalog search repeats identical items when clicking facet filters');
              }}
            >
              Search Duplicates
            </button>
          </div>
        </div>

        {/* Right Column: Explainable Risk Scoring Engine Spec */}
        <div className="intel-card risk-spec-card">
          <div className="intel-card-header">
            <div className="title-left">
              <span className="intel-icon"><ShieldAlert size={16} /></span>
              <h3>Explainable Risk Scoring Formula</h3>
            </div>
            <span className="intel-chip">DETERMINISTIC // ZERO BLACK-BOX</span>
          </div>

          <p className="intel-desc">
            IssueFlow avoids opaque neural predictions for mission-critical triage. 
            Risk indices (1–10) are calculated from inspectable rules:
          </p>

          <div className="formula-rules-list">
            <div className="rule-item">
              <span className="rule-weight text-crimson">+8 pts</span>
              <div className="rule-text">
                <strong>CRITICAL Severity:</strong> Revenue impacting outage or data loss risk.
              </div>
            </div>

            <div className="rule-item">
              <span className="rule-weight text-amber">+3 pts</span>
              <div className="rule-text">
                <strong>Past Due SLA:</strong> Issue exceeded designated target sprint resolution date.
              </div>
            </div>

            <div className="rule-item">
              <span className="rule-weight text-indigo">+2 pts</span>
              <div className="rule-text">
                <strong>Regression Reopens:</strong> Reopened after previous verification failure.
              </div>
            </div>

            <div className="rule-item">
              <span className="rule-weight text-slate">+1 pt</span>
              <div className="rule-text">
                <strong>Dormancy Age:</strong> Open without resolution for more than 7 days.
              </div>
            </div>
          </div>

          <div className="formula-footer-badge">
            <Terminal size={14} />
            <span>Fully transparent and reproducible in audit logs.</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Hotspot Clusters */}
      <div className="hotspots-full-section">
        <div className="section-eyebrow-row">
          <span className="editorial-kicker">FAILURE HOTSPOTS</span>
          <span className="kicker-rule" />
          <span className="kicker-annotation">{patterns.length} ACTIVE PATTERNS</span>
        </div>

        <div className="hotspots-grid">
          {patterns.map(p => (
            <div key={p.id} className="hotspot-summary-card">
              <div className="hotspot-head">
                <h4>{p.title}</h4>
                <span className={`pill-badge sev-${p.severity.toLowerCase()}`}>{p.severity}</span>
              </div>
              <p className="hotspot-rec">{p.suggestedAction}</p>
              <div className="hotspot-footer">
                <span>{p.relatedIssuesCount} linked issues</span>
                <button
                  className="editorial-action-link"
                  onClick={() => navigateToFilteredIssues({ component: p.affectedComponents[0] || 'ALL' })}
                >
                  <span>Filter by component</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
