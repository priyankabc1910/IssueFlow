import { Issue, IssueStatus, Priority, Severity } from '@prisma/client';

export function riskFor(issue: Pick<Issue, 'severity'|'priority'|'dueAt'|'status'|'reopenedCount'|'createdAt'>, now = new Date()) {
  const reasons: string[] = []; let score = 0;
  const severity: Record<Severity, number> = { LOW: 1, MEDIUM: 3, HIGH: 6, CRITICAL: 8 };
  const priority: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  score += severity[issue.severity]; if (issue.severity === 'CRITICAL') reasons.push('Critical severity');
  score += priority[issue.priority]; if (issue.priority === 'CRITICAL') reasons.push('Critical priority');
  if (issue.dueAt && issue.dueAt < now && !['RESOLVED','CLOSED'].includes(issue.status)) { score += 3; reasons.push('Past its due date'); }
  if (issue.reopenedCount > 0) { score += Math.min(2, issue.reopenedCount); reasons.push(`Reopened ${issue.reopenedCount} time(s)`); }
  const ageDays = Math.floor((now.getTime() - issue.createdAt.getTime()) / 86400000);
  if (ageDays >= 7 && !['RESOLVED','CLOSED'].includes(issue.status)) { score += 1; reasons.push(`Open for ${ageDays} days`); }
  return { score: Math.min(10, score), level: score >= 9 ? 'CRITICAL' : score >= 6 ? 'HIGH' : score >= 3 ? 'MEDIUM' : 'LOW', reasons };
}

const tokens = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['the','and','for','with','from','when','after','this','that','issue','error'].includes(w)));
export function similarity(a: string, b: string) {
  const aa = tokens(a), bb = tokens(b); if (!aa.size || !bb.size) return 0;
  let common = 0; for (const t of aa) if (bb.has(t)) common++;
  return common / (aa.size + bb.size - common);
}
export function readinessScore(issues: Array<Pick<Issue, 'status'|'severity'|'dueAt'|'reopenedCount'>>) {
  const active = issues.filter(i => ![IssueStatus.RESOLVED, IssueStatus.CLOSED].includes(i.status));
  const critical = active.filter(i => i.severity === 'CRITICAL').length;
  const overdue = active.filter(i => i.dueAt && i.dueAt < new Date()).length;
  const reopened = issues.filter(i => i.reopenedCount > 0).length;
  const score = Math.max(0, 100 - critical * 25 - overdue * 10 - reopened * 5 - Math.max(0, active.length - critical) * 2);
  return { score, label: score >= 85 ? 'Ready' : score >= 65 ? 'Needs attention' : 'At risk', blockers: { critical, overdue, reopened, active: active.length } };
}
