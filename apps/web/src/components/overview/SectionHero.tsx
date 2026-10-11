import React, { useState } from 'react';
import {
  ArrowDown,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionHero: React.FC = () => {
  const { setShowCreateModal, scrollToSection, teams, setFilterState, issues } = useApp();
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [dateRange, setDateRange] = useState('sprint');

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTeam(val);
    if (val !== 'ALL') {
      setFilterState(prev => ({ ...prev, team: val }));
    } else {
      setFilterState(prev => ({ ...prev, team: 'ALL' }));
    }
  };

  const openCount = issues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status)).length;
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(i.status)).length;

  return (
    <section className="story-section hero-story-section" id="section-hero">
      <div className="hero-editorial-grid">
        {/* Left Column: Narrative Headline & Controls */}
        <div className="hero-narrative-col">
          {/* Top metadata tags */}
          <div className="hero-meta-row">
            <span className="editorial-meta-badge">
              <Terminal size={12} className="meta-icon" />
              <span>ACME ENGINEERING · PROD WORKSPACE</span>
            </span>
            <span className="demo-live-indicator" title="Calculated from stateful demo dataset">
              <span className="live-pulse-dot" />
              <span>LIVE DEMO TELEMETRY · SYNCED 1M AGO</span>
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="hero-editorial-title">
            Your engineering health, <br />
            <span className="hero-title-accent">in focus.</span>
          </h1>

          {/* Supporting Editorial Paragraph */}
          <p className="hero-editorial-lead">
            Understand what is breaking, where risk is building, and what your team should solve next.
            IssueFlow bridges ticket noise and systemic operational reliability into a single living narrative.
          </p>

          {/* Controls Bar: Filters & Actions */}
          <div className="hero-interaction-panel">
            <div className="hero-selectors-cluster">
              {/* Team Selector */}
              <div className="hero-select-wrapper">
                <Layers size={13} className="select-icon" />
                <select 
                  aria-label="Select Team" 
                  value={selectedTeam} 
                  onChange={handleTeamChange}
                  className="hero-select-input"
                >
                  <option value="ALL">All Engineering Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="select-arrow" />
              </div>

              {/* Date Range Selector */}
              <div className="hero-select-wrapper">
                <Calendar size={13} className="select-icon" />
                <select 
                  aria-label="Select Date Range" 
                  value={dateRange} 
                  onChange={e => setDateRange(e.target.value)}
                  className="hero-select-input"
                >
                  <option value="sprint">Sprint 26.4 (Oct 5 – Oct 18)</option>
                  <option value="7d">Last 7 calendar days</option>
                  <option value="14d">Last 14 calendar days</option>
                  <option value="30d">Rolling 30-day window</option>
                </select>
                <ChevronDown size={12} className="select-arrow" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hero-actions-cluster">
              <button 
                className="editorial-btn-primary" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={15} />
                <span>Create issue</span>
              </button>

              <button 
                className="editorial-btn-secondary" 
                onClick={() => scrollToSection('section-pulse')}
              >
                <span>Explore insights</span>
                <ArrowDown size={14} className="btn-down-arrow" />
              </button>
            </div>
          </div>

          {/* Micro context indicators */}
          <div className="hero-footnotes">
            <span className="footnote-item">
              <strong>{openCount}</strong> active issues tracked
            </span>
            <span className="footnote-separator">/</span>
            <span className="footnote-item">
              <strong className={criticalCount > 0 ? 'text-critical' : 'text-emerald'}>
                {criticalCount} critical blocker{criticalCount === 1 ? '' : 's'}
              </strong>
            </span>
            <span className="footnote-separator">/</span>
            <span className="footnote-item">
              Release target: <strong>v2.4.0-rc1</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Abstract Engineering Telemetry Schematic */}
        <div className="hero-schematic-col" aria-hidden="true">
          <div className="schematic-canvas-card">
            <div className="schematic-top-bar">
              <div className="schematic-dots">
                <span /><span /><span />
              </div>
              <span className="schematic-title-tag">SYSTEM TOPOLOGY // TELEMETRY NODE MAP</span>
              <span className="schematic-status-pill">MONITORING</span>
            </div>

            <div className="schematic-svg-frame">
              <svg viewBox="0 0 460 320" className="topology-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background gridlines */}
                <path d="M40 0 V320 M120 0 V320 M200 0 V320 M280 0 V320 M360 0 V320 M440 0 V320" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3 3"/>
                <path d="M0 60 H460 M0 140 H460 M0 220 H460 M0 300 H460" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3 3"/>

                {/* Data Flow Connections */}
                <path d="M 80 150 C 140 150, 150 90, 220 90" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4 4" className="stream-line-active" />
                <path d="M 80 150 C 140 150, 150 210, 220 210" stroke="#e11d48" strokeWidth="2" className="stream-line-critical" />
                <path d="M 220 90 C 290 90, 310 150, 380 150" stroke="#2563eb" strokeWidth="1.5" />
                <path d="M 220 210 C 290 210, 310 150, 380 150" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 3" />
                <path d="M 220 210 C 290 210, 310 270, 380 270" stroke="#059669" strokeWidth="1.5" />

                {/* Ingress Gateway Node */}
                <g className="node-group" transform="translate(80, 150)">
                  <circle r="22" fill="#131722" stroke="#2b344a" strokeWidth="1.5"/>
                  <circle r="6" fill="#3b82f6" />
                  <text y="36" textAnchor="middle" fill="#718096" fontSize="9" fontFamily="monospace">API INGRESS</text>
                  <text y="46" textAnchor="middle" fill="#a0aec0" fontSize="8" fontFamily="monospace">99.98% OK</text>
                </g>

                {/* Search / Analytics Service Node */}
                <g className="node-group" transform="translate(220, 90)">
                  <circle r="20" fill="#131722" stroke="#2b344a" strokeWidth="1.5"/>
                  <circle r="5" fill="#3b82f6" />
                  <text y="34" textAnchor="middle" fill="#718096" fontSize="9" fontFamily="monospace">SEARCH/CACHE</text>
                  <text y="44" textAnchor="middle" fill="#a0aec0" fontSize="8" fontFamily="monospace">42ms LAT</text>
                </g>

                {/* Payment Gateway Node (Critical) */}
                <g className="node-group" transform="translate(220, 210)">
                  <circle r="24" fill="#201217" stroke="#e11d48" strokeWidth="2" className="node-pulse-halo"/>
                  <circle r="7" fill="#e11d48" />
                  <text y="38" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">PAYMENTS</text>
                  <text y="48" textAnchor="middle" fill="#e11d48" fontSize="8" fontFamily="monospace">WEB-101 BLKR</text>
                </g>

                {/* Release Gate Node */}
                <g className="node-group" transform="translate(380, 150)">
                  <circle r="22" fill="#131722" stroke="#2b344a" strokeWidth="1.5"/>
                  <circle r="6" fill="#10b981" />
                  <text y="36" textAnchor="middle" fill="#718096" fontSize="9" fontFamily="monospace">RELEASE RC</text>
                  <text y="46" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">78% CONF</text>
                </g>

                {/* SRE Worker Node */}
                <g className="node-group" transform="translate(380, 270)">
                  <circle r="18" fill="#131722" stroke="#2b344a" strokeWidth="1.5"/>
                  <circle r="5" fill="#10b981" />
                  <text y="32" textAnchor="middle" fill="#718096" fontSize="9" fontFamily="monospace">SLA WORKER</text>
                </g>
              </svg>
            </div>

            <div className="schematic-footer-metrics">
              <div className="s-metric">
                <span className="s-label">PIPELINE VELOCITY</span>
                <span className="s-val">94.2%</span>
              </div>
              <div className="s-metric">
                <span className="s-label">FAIL-STOP ISOLATION</span>
                <span className="s-val text-emerald">ACTIVE</span>
              </div>
              <div className="s-metric">
                <span className="s-label">TELEMETRY LATENCY</span>
                <span className="s-val">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
