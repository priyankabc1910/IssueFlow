import React from 'react';
import { SectionHero } from './SectionHero';
import { SectionPulse } from './SectionPulse';
import { SectionTimelineChart } from './SectionTimelineChart';
import { SectionRiskLandscape } from './SectionRiskLandscape';
import { SectionWorkThatMatters } from './SectionWorkThatMatters';
import { SectionPatterns } from './SectionPatterns';
import { SectionTeamMomentum } from './SectionTeamMomentum';
import { SectionReleaseReadiness } from './SectionReleaseReadiness';
import { SectionRecentStory } from './SectionRecentStory';

export const OverviewPage: React.FC = () => {
  return (
    <div className="overview-storytelling-wrapper">
      {/* SECTION A — THE OPENING SCENE */}
      <SectionHero />

      {/* SECTION B — THE ENGINEERING PULSE */}
      <SectionPulse />

      {/* SECTION C — WHAT IS HAPPENING OVER TIME? */}
      <SectionTimelineChart />

      {/* SECTION D — WHERE IS THE RISK BUILDING? */}
      <SectionRiskLandscape />

      {/* SECTION E — THE WORK THAT MATTERS */}
      <SectionWorkThatMatters />

      {/* SECTION F — PATTERNS WORTH NOTICING */}
      <SectionPatterns />

      {/* SECTION G — TEAM MOMENTUM */}
      <SectionTeamMomentum />

      {/* SECTION H — RELEASE CONFIDENCE */}
      <SectionReleaseReadiness />

      {/* SECTION I — THE RECENT STORY */}
      <SectionRecentStory />
    </div>
  );
};
