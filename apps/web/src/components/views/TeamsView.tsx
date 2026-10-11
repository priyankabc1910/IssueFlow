import React from 'react';
import {
  Users2,
  TrendingUp,
  CheckCircle2,
  Flame,
  ArrowRight,
  Shield,
  Layers,
  Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TeamsView: React.FC = () => {
  const { teams, users, issues, navigateToFilteredIssues } = useApp();

  return (
    <div className="view-container teams-view">
      <div className="view-header-strip">
        <div className="view-title-block">
          <span className="editorial-kicker">ENGINEERING ORGANIZATION // SQUADS & DOMAINS</span>
          <h1 className="view-main-title">Engineering Teams</h1>
          <p className="view-sub-desc">
            Autonomous product and infrastructure squads, component ownership domains, and active velocity.
          </p>
        </div>
      </div>

      <div className="teams-grid-layout">
        {teams.map(team => {
          const teamIssues = issues.filter(i => i.team === team.name);
          const active = teamIssues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status));
          const critical = active.filter(i => i.severity === 'CRITICAL');
          const resolved = teamIssues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status));
          const teamMembers = users.filter(u => u.team === team.name);

          return (
            <div key={team.id} className="team-profile-card">
              <div className="team-card-header">
                <div className="team-title-lockup">
                  <span className="team-icon-chip"><Users2 size={16} /></span>
                  <div>
                    <h3 className="team-name">{team.name}</h3>
                    <span className="team-lead-caption">Lead: <strong>{team.lead}</strong></span>
                  </div>
                </div>

                <span className="team-velocity-badge">
                  <TrendingUp size={12} />
                  <span>{team.velocity}</span>
                </span>
              </div>

              {/* Stats Bar */}
              <div className="team-stats-ribbon">
                <div className="stat-unit">
                  <span className="unit-lbl">OPEN ISSUES</span>
                  <strong className="unit-val">{active.length}</strong>
                </div>
                <div className="stat-unit">
                  <span className="unit-lbl">CRITICAL</span>
                  <strong className={`unit-val ${critical.length > 0 ? 'text-crimson' : 'text-emerald'}`}>
                    {critical.length}
                  </strong>
                </div>
                <div className="stat-unit">
                  <span className="unit-lbl">RESOLVED</span>
                  <strong className="unit-val text-emerald">{resolved.length}</strong>
                </div>
                <div className="stat-unit">
                  <span className="unit-lbl">SQUAD SIZE</span>
                  <strong className="unit-val">{team.membersCount}</strong>
                </div>
              </div>

              {/* Components Owned */}
              <div className="team-components-block">
                <span className="comp-block-label">OWNED COMPONENTS & REPOSITORIES:</span>
                <div className="comp-pills-row">
                  {team.components.map(comp => (
                    <span key={comp} className="team-comp-pill">{comp}</span>
                  ))}
                </div>
              </div>

              {/* Team Members Roster */}
              <div className="team-members-block">
                <span className="comp-block-label">ACTIVE SQUAD MEMBERS:</span>
                <div className="members-chips-list">
                  {teamMembers.map(m => (
                    <div key={m.id} className="member-roster-chip" title={`${m.name} (${m.role})`}>
                      <span className="m-avatar">{m.avatar || 'DE'}</span>
                      <span className="m-name">{m.name}</span>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <span className="text-muted text-xs">Cross-functional contributors</span>
                  )}
                </div>
              </div>

              {/* Footer Filter CTA */}
              <div className="team-card-footer">
                <button
                  className="editorial-action-link"
                  onClick={() => navigateToFilteredIssues({ team: team.name, status: 'ALL' })}
                >
                  <span>View all {team.name} issues</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
