import { describe, expect, it } from 'vitest';
import { readinessScore, riskFor, similarity } from '../src/services/intelligence.js';
const base = { severity: 'MEDIUM' as const, priority: 'MEDIUM' as const, dueAt: null, status: 'OPEN' as const, reopenedCount: 0, createdAt: new Date() };
describe('IssueFlow intelligence', () => {
  it('explains elevated risk for critical overdue issues', () => { const result = riskFor({ ...base, severity: 'CRITICAL', priority: 'CRITICAL', dueAt: new Date(Date.now()-1000) }); expect(result.score).toBeGreaterThanOrEqual(9); expect(result.reasons).toContain('Past its due date'); });
  it('detects lexical overlap', () => { expect(similarity('checkout payment fails', 'payment checkout fails')).toBeGreaterThan(0.5); });
  it('reduces readiness when a critical active issue exists', () => { const result = readinessScore([{ status: 'OPEN' as const, severity: 'CRITICAL' as const, dueAt: null, reopenedCount: 0 }]); expect(result.score).toBeLessThan(100); expect(result.blockers.critical).toBe(1); });
});
