import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { TrendingUp, ArrowDownRight, ArrowUpRight, BarChart3, Info } from 'lucide-react';
import { TIME_SERIES_DATA } from '../../data/mockData';

export const SectionTimelineChart: React.FC = () => {
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('7d');

  const activeData = TIME_SERIES_DATA[range];

  const totalOpened = activeData.reduce((acc, curr) => acc + curr.opened, 0);
  const totalResolved = activeData.reduce((acc, curr) => acc + curr.resolved, 0);
  const netDiff = totalResolved - totalOpened;

  return (
    <section className="story-section timeline-story-section" id="section-timeline">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 02 // VELOCITY AND VOLUME DYNAMICS</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">TEMPORAL EQUILIBRIUM</span>
      </div>

      <div className="timeline-layout-grid">
        {/* Left Editorial Narrative Header */}
        <div className="timeline-narrative-header">
          <div className="headline-group">
            <h2 className="editorial-section-title">
              Engineering is a <br />
              <span className="title-italic-accent">moving system.</span>
            </h2>
            <p className="editorial-section-desc">
              Issues do not arrive in isolation. Tracking the flux between incoming bug reports 
              and production-verified resolutions reveals whether your engineering organization 
              is compounding technical debt or expanding operational runway.
            </p>
          </div>

          {/* Time range switcher */}
          <div className="range-controls-wrapper">
            <span className="control-label">TIME WINDOW:</span>
            <div className="range-pills-cluster" role="tablist" aria-label="Select time range">
              {(['7d', '14d', '30d'] as const).map(r => (
                <button
                  key={r}
                  className={`range-pill-btn ${range === r ? 'is-active' : ''}`}
                  onClick={() => setRange(r)}
                  role="tab"
                  aria-selected={range === r}
                >
                  {r === '7d' ? 'Last 7 Days' : r === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Insight Callout */}
          <div className="timeline-insight-box">
            <div className="insight-badge-row">
              <span className="insight-tag">
                <TrendingUp size={12} />
                <span>DYNAMIC TELEMETRY INSIGHT</span>
              </span>
              <span className="insight-window-tag">{range.toUpperCase()} WINDOW</span>
            </div>

            <p className="insight-body">
              {netDiff >= 0 ? (
                <>
                  Resolved throughput <strong>exceeded intake by {netDiff} issues</strong> ({totalResolved} resolved vs {totalOpened} opened). 
                  Engineering queue deficit contracted by <strong>{Math.round((netDiff / (totalOpened || 1)) * 100)}%</strong>, 
                  driven by focused bug-squashing in the Frontend and Platform squads.
                </>
              ) : (
                <>
                  Inflow outpaced resolutions by <strong>{Math.abs(netDiff)} issues</strong> ({totalOpened} opened vs {totalResolved} resolved). 
                  Triage queue pressure remains elevated in Payments and Search.
                </>
              )}
            </p>

            <div className="insight-meta-stats">
              <div className="stat-chunk">
                <span className="lbl">INTAKE VOLUME</span>
                <span className="val">{totalOpened}</span>
              </div>
              <div className="stat-chunk">
                <span className="lbl">RESOLVED VOLUME</span>
                <span className="val text-emerald">{totalResolved}</span>
              </div>
              <div className="stat-chunk">
                <span className="lbl">NET VELOCITY</span>
                <span className={`val ${netDiff >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                  {netDiff >= 0 ? `+${netDiff}` : netDiff}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Full-width Chart Container */}
        <div className="timeline-chart-stage">
          <div className="chart-stage-header">
            <div className="chart-legend-editorial">
              <div className="legend-item">
                <span className="legend-color-dot color-opened" />
                <span className="legend-name">Opened Issues</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-dot color-resolved" />
                <span className="legend-name">Resolved Issues</span>
              </div>
            </div>

            <div className="chart-annotation-pill">
              <Info size={12} />
              <span>Hover points to view daily intake vs resolution</span>
            </div>
          </div>

          {/* Integrated Chart (No white box trap) */}
          <div className="chart-container-editorial">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={activeData} margin={{ top: 20, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#e5e5e0" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  axisLine={{ stroke: '#d8d8d4' }} 
                  tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="custom-editorial-tooltip">
                          <div className="tooltip-header">
                            <span className="tooltip-date">{data.date}</span>
                            <span className="tooltip-net">Net: {data.resolved - data.opened >= 0 ? `+${data.resolved - data.opened}` : data.resolved - data.opened}</span>
                          </div>
                          <div className="tooltip-rows">
                            <div className="t-row">
                              <span className="t-dot color-opened" />
                              <span className="t-lbl">Opened:</span>
                              <strong>{data.opened}</strong>
                            </div>
                            <div className="t-row">
                              <span className="t-dot color-resolved" />
                              <span className="t-lbl">Resolved:</span>
                              <strong>{data.resolved}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="#2563eb" 
                  strokeWidth={2.2} 
                  fill="url(#gradientOpened)" 
                  activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#059669" 
                  strokeWidth={2.2} 
                  fill="url(#gradientResolved)" 
                  activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-editorial-caption">
            <span className="caption-label">FIG 2.1</span>
            <span className="caption-text">
              Continuous throughput stream showing issue arrival rates (cobalt) against merge/closure rates (emerald). 
              Values populated from simulated telemetry events.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
