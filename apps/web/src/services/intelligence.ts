import { Issue, IssueStatus, Priority, Severity, RiskAssessment } from '../types';

export function calculateRisk(
  issue: {
    severity: Severity;
    priority: Priority;
    dueAt: string | null;
    status: IssueStatus;
    reopenedCount: number;
    createdAt: string;
  },
  now = new Date()
): RiskAssessment {
  const reasons: string[] = [];
  let score = 0;
  const severityWeight: Record<Severity, number> = { LOW: 1, MEDIUM: 3, HIGH: 6, CRITICAL: 8 };
  const priorityWeight: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

  score += severityWeight[issue.severity] || 3;
  if (issue.severity === 'CRITICAL') reasons.push('Critical severity impact');
  if (issue.severity === 'HIGH') reasons.push('High operational severity');

  score += priorityWeight[issue.priority] || 1;
  if (issue.priority === 'CRITICAL') reasons.push('Urgent resolution priority');

  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(issue.status);

  if (issue.dueAt && !isResolvedOrClosed) {
    const dueTime = new Date(issue.dueAt).getTime();
    if (dueTime < now.getTime()) {
      score += 3;
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - dueTime) / 86400000));
      reasons.push(`Target SLA overdue by ${daysOverdue}d`);
    }
  }

  if (issue.reopenedCount > 0) {
    score += Math.min(2, issue.reopenedCount);
    reasons.push(`Reopened ${issue.reopenedCount} time(s) - regression risk`);
  }

  const createdTime = new Date(issue.createdAt).getTime();
  const ageDays = Math.floor((now.getTime() - createdTime) / 86400000);
  if (ageDays >= 7 && !isResolvedOrClosed) {
    score += 1;
    reasons.push(`Open without resolution for ${ageDays} days`);
  }

  const boundedScore = Math.min(10, Math.max(1, score));
  const level = boundedScore >= 9 ? 'CRITICAL' : boundedScore >= 6 ? 'HIGH' : boundedScore >= 3 ? 'MEDIUM' : 'LOW';

  return {
    score: boundedScore,
    level,
    reasons: reasons.length > 0 ? reasons : ['Standard baseline engineering risk']
  };
}

export function calculateReadiness(issues: Issue[]) {
  const active = issues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status));
  const now = new Date();
  const critical = active.filter(i => i.severity === 'CRITICAL').length;
  const overdue = active.filter(i => i.dueAt && new Date(i.dueAt).getTime() < now.getTime()).length;
  const reopened = issues.filter(i => i.reopenedCount > 0).length;

  // Formula matching IssueFlow engine:
  // Math.max(0, 100 - critical * 25 - overdue * 10 - reopened * 5 - Math.max(0, active.length - critical) * 2);
  const score = Math.max(0, 100 - (critical * 25) - (overdue * 10) - (reopened * 5) - Math.max(0, active.length - critical) * 2);
  
  let label = 'Ready to ship';
  if (score < 65) {
    label = 'At risk - blockers present';
  } else if (score < 85) {
    label = 'Needs targeted attention';
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    label,
    blockers: {
      critical,
      overdue,
      reopened,
      active: active.length
    }
  };
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'when', 'after', 'this', 'that', 'issue', 'error', 'bug', 'cannot']);

export function calculateSimilarity(a: string, b: string): number {
  const tokenize = (str: string) =>
    new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    );

  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (!tokensA.size || !tokensB.size) return 0;
  let common = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) common++;
  }
  return Math.round((common / (tokensA.size + tokensB.size - common)) * 100);
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date().getTime();
  const date = new Date(dateStr).getTime();
  const diffMinutes = Math.floor((now - date) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLabel(s?: string): string {
  if (!s) return 'Open';
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
