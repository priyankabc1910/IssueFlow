import React from 'react';
import {
  Users2,
  GitCommit,
  CheckCircle2,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionTeamMomentum: React.FC = () => {
  const { teams, users, issues, navigateToFilteredIssues, setActiveRoute } = useApp();

  // Calculate workloads per team based on active issues
  const teamMetrics = teams.map(team => {
    const teamIssues = issues.filter(i => i.team === team.name);
    const active = teamIssues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status));
    const critical = active.filter(i => i.severity === 'CRITICAL').length;
    const resolved = teamIssues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status)).length;

    return {
      ...team,
      currentActive: active.length,
      currentCritical: critical,
      currentResolved: resolved
    };
  });

  const maxActive = Math.max(...teamMetrics.map(t => t.currentActive), 1);

  return (
    <section className="story-section team-story-section" id="section-teams">
      <div className="section-eyebrow-row">
        <span className="editorial-kicker">SECTION 06 // HUMAN INFRASTRUCTURE</span>
        <span className="kicker-rule" />
        <span className="kicker-annotation">COLLECTIVE ENGINEERING EFFORT</span>
      </div>

      <div className="team-editorial-header">
        <div className="team-title-col">
          <h2 className="editorial-section-title">
            Engineering is a <br />
            <span className="title-italic-accent">team effort.</span>
          </h2>
          <p className="editorial-section-desc">
            Code health reflects team momentum. Monitor operational distribution across 
            core squads, highlight individual triage milestones, and identify where 
            workload imbalances threaten sprint commitments.
          </p>
        </div>

        <button 
          className="editorial-action-link"
          onClick={() => setActiveRoute('teams')}
        >
          <span>View complete team directory & rosters</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Asymmetric Two-Column Composition */}
      <div className="team-composition-layout">
        {/* Left Column: Horizontal Team Workload & Velocity Bands */}
        <div className="team-workload-column">
          <div className="column-top-label">
            <span>SQUAD OPERATIONAL CAPACITY</span>
            <span className="label-sub">ACTIVE LOAD VS RESOLUTION RATIO</span>
          </div>

          <div className="team-bars-stack">
            {teamMetrics.map(team => {
              const activeRatio = Math.round((team.currentActive / maxActive) * 100);

              return (
                <div key={team.id} className="team-workload-strip">
                  <div className="strip-info-row">
                    <div className="team-lead-meta">
                      <strong className="team-name-text">{team.name}</strong>
                      <span className="team-lead-text">Lead: {team.lead}</span>
                    </div>

                    <div className="team-stat-badges">
                      {team.currentCritical > 0 && (
                        <span className="stat-pill-critical">
                          <Flame size={11} />
                          <span>{team.currentCritical} critical</span>
                        </span>
                      )}
                      <span className="stat-pill-active">
                        <strong>{team.currentActive}</strong> active
                      </span>
                      <span className="stat-pill-resolved">
                        <CheckCircle2 size={11} />
                        <span>{team.currentResolved} resolved</span>
                      </span>
                    </div>
                  </div>

                  {/* Visual Workload Bar */}
                  <div className="workload-bar-track">
                    <div 
                      className={`workload-bar-fill ${team.currentCritical > 0 ? 'has-critical-fill' : ''}`}
                      style={{ width: `${Math.max(12, activeRatio)}%` }}
                    />
                  </div>

                  <div className="strip-bottom-meta">
                    <span className="velocity-tag">
                      <TrendingUp size={11} />
                      <span>{team.velocity}</span>
                    </span>
                    <button
                      className="team-filter-link"
                      onClick={() => navigateToFilteredIssues({ team: team.name, status: 'ALL' })}
                    >
                      <span>Filter issues</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Individual Contributor Roster & Resolution Rhythm */}
        <div className="contributor-momentum-column">
          <div className="column-top-label">
            <span>KEY CONTRIBUTORS</span>
            <span className="label-sub">TRIAGE & MERGE VELOCITY</span>
          </div>

          <div className="contributor-list">
            {users.slice(0, 4).map(u => {
              const userIssues = issues.filter(i => i.assignee.id === u.id);
              const userActive = userIssues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status)).length;
              const userResolved = userIssues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status)).length;

              return (
                <div key={u.id} className="contributor-card">
                  <div className="contributor-avatar-block">
                    <div className="avatar-disc">{u.avatar || 'DE'}</div>
                  </div>

                  <div className="contributor-text-block">
                    <div className="name-and-role">
                      <strong>{u.name}</strong>
                      <span className="role-sub">{u.role}</span>
                    </div>
                    <span className="contributor-team-tag">{u.team}</span>
                  </div>

                  <div className="contributor-stats-dock">
                    <div className="stat-cell">
                      <span className="c-lbl">ASSIGNED</span>
                      <strong className="c-val">{userActive}</strong>
                    </div>
                    <div className="stat-cell">
                      <span className="c-lbl">RESOLVED</span>
                      <strong className="c-val text-emerald">{userResolved}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="momentum-callout-footer">
            <Award size={16} className="award-icon" />
            <p>
              <strong>Elena Rostova</strong> and <strong>Marcus Chen</strong> led 4 critical hotfixes 
              this sprint across Payments and Ingress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
