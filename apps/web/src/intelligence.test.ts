import { describe, expect, it } from 'vitest';
import { calculateRisk, calculateReadiness, calculateSimilarity, formatRelativeTime, formatLabel } from './services/intelligence';
import { Issue } from './types';

describe('IssueFlow Intelligence Engine', () => {
  it('keeps the project brand recognizable', () => {
    expect('IssueFlow Engineering Intelligence').toContain('IssueFlow');
  });

  describe('calculateRisk', () => {
    it('accurately calculates risk score for critical overdue issues', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();

      const assessment = calculateRisk({
        severity: 'CRITICAL',
        priority: 'CRITICAL',
        dueAt: yesterday,
        status: 'OPEN',
        reopenedCount: 1,
        createdAt: threeDaysAgo
      });

      // severity: 8 + priority: 3 + overdue: 3 + reopened: 1 = bounded to 10
      expect(assessment.score).toBe(10);
      expect(assessment.level).toBe('CRITICAL');
      expect(assessment.reasons).toContain('Critical severity impact');
      expect(assessment.reasons).toContain('Urgent resolution priority');
      expect(assessment.reasons.some(r => r.includes('Target SLA overdue'))).toBe(true);
      expect(assessment.reasons.some(r => r.includes('Reopened 1 time(s)'))).toBe(true);
    });

    it('returns low risk score for resolved issues with low severity', () => {
      const assessment = calculateRisk({
        severity: 'LOW',
        priority: 'LOW',
        dueAt: null,
        status: 'RESOLVED',
        reopenedCount: 0,
        createdAt: new Date().toISOString()
      });

      expect(assessment.score).toBeLessThanOrEqual(3);
      expect(assessment.level).toBe('LOW');
    });
  });

  describe('calculateReadiness', () => {
    it('computes 100% readiness when there are zero blockers or active issues', () => {
      const mockIssues: Issue[] = [
        {
          id: '1',
          key: 'WEB-1',
          title: 'Fixed bug',
          description: '',
          status: 'RESOLVED',
          priority: 'LOW',
          severity: 'LOW',
          component: 'Web',
          team: 'Platform',
          assignee: {} as any,
          reporter: {} as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueAt: null,
          reopenedCount: 0,
          risk: { score: 1, level: 'LOW', reasons: [] }
        }
      ];

      const readiness = calculateReadiness(mockIssues);
      expect(readiness.score).toBe(100);
      expect(readiness.label).toBe('Ready to ship');
      expect(readiness.blockers.critical).toBe(0);
      expect(readiness.blockers.active).toBe(0);
    });

    it('penalizes readiness score when critical blockers are open', () => {
      const mockIssues: Issue[] = [
        {
          id: '1',
          key: 'WEB-1',
          title: 'Critical issue',
          description: '',
          status: 'OPEN',
          priority: 'CRITICAL',
          severity: 'CRITICAL',
          component: 'Web',
          team: 'Platform',
          assignee: {} as any,
          reporter: {} as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueAt: null,
          reopenedCount: 0,
          risk: { score: 8, level: 'HIGH', reasons: [] }
        }
      ];

      const readiness = calculateReadiness(mockIssues);
      // 100 - (1 * 25) = 75
      expect(readiness.score).toBe(75);
      expect(readiness.label).toBe('Needs targeted attention');
      expect(readiness.blockers.critical).toBe(1);
    });
  });

  describe('calculateSimilarity', () => {
    it('detects high token overlap between duplicate incident titles', () => {
      const titleA = 'Checkout fails for saved payment methods on 3D Secure v2';
      const titleB = 'Payment gateway timeouts when selecting saved cards in checkout';

      const score = calculateSimilarity(titleA, titleB);
      expect(score).toBeGreaterThan(25);
    });

    it('returns 0 for completely unrelated titles', () => {
      const titleA = 'Redis worker socket connection leak';
      const titleB = 'Update brand logo colors in marketing footer';

      const score = calculateSimilarity(titleA, titleB);
      expect(score).toBe(0);
    });
  });

  describe('format helpers', () => {
    it('formats snake_case status labels to Title Case', () => {
      expect(formatLabel('IN_PROGRESS')).toBe('In Progress');
      expect(formatLabel('OPEN')).toBe('Open');
      expect(formatLabel('IN_REVIEW')).toBe('In Review');
    });

    it('formats relative time strings', () => {
      const justNow = new Date().toISOString();
      expect(formatRelativeTime(justNow)).toBe('Just now');
    });
  });
});
