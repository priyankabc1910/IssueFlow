export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAssessment {
  score: number; // 0 to 10
  level: RiskLevel;
  reasons: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  team: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: Priority;
  severity: Severity;
  component: string;
  team: string;
  assignee: User;
  reporter: User;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  reopenedCount: number;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  environment?: string;
  risk: RiskAssessment;
  attentionReason?: string;
  comments?: IssueComment[];
}

export interface Team {
  id: string;
  name: string;
  lead: string;
  membersCount: number;
  openIssuesCount: number;
  criticalCount: number;
  resolvedCount: number;
  velocity: string;
  components: string[];
}

export interface RecurringPattern {
  id: string;
  title: string;
  relatedIssuesCount: number;
  affectedComponents: string[];
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
  lastSeen: string;
  suggestedAction: string;
  severity: Severity;
}

export interface ReleaseChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
  category: 'Security' | 'Testing' | 'Database' | 'Infrastructure' | 'Documentation';
}

export interface Release {
  id: string;
  name: string;
  version: string;
  targetDate: string;
  status: 'planning' | 'rc' | 'frozen' | 'released';
  readinessScore: number;
  blockersCount: number;
  highPriorityCount: number;
  overdueCount: number;
  checklist: ReleaseChecklistItem[];
}

export interface ActivityEvent {
  id: string;
  type: 'created' | 'status_changed' | 'priority_changed' | 'comment_added' | 'resolved' | 'checklist_updated' | 'sla_warning';
  actor: User;
  target: string;
  targetKey?: string;
  detail: string;
  timestamp: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'degraded' | 'disconnected';
  lastSync: string;
  latency: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
  linkRoute?: RouteId;
  issueKey?: string;
}

export type RouteId = 
  | 'overview' 
  | 'issues' 
  | 'my-tasks' 
  | 'teams' 
  | 'intelligence' 
  | 'releases' 
  | 'activity' 
  | 'integrations' 
  | 'settings';

export interface IssueFilterState {
  query: string;
  status: string;
  priority: string;
  severity: string;
  team: string;
  component: string;
  assignee: string;
}
