import { Issue, User, Team, RecurringPattern, Release, ActivityEvent, Integration, NotificationItem } from '../types';
import { calculateRisk } from '../services/intelligence';

export const CURRENT_USER: User = {
  id: 'usr-demo-1',
  name: 'Demo Engineer',
  email: 'demo@issueflow.dev',
  avatar: 'DE',
  role: 'Staff Systems Engineer',
  team: 'Platform & Infrastructure'
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    email: 'elena.r@issueflow.dev',
    avatar: 'ER',
    role: 'Principal Backend Engineer',
    team: 'Checkout & Payments'
  },
  {
    id: 'usr-3',
    name: 'Marcus Chen',
    email: 'marcus.c@issueflow.dev',
    avatar: 'MC',
    role: 'Lead Architect',
    team: 'Platform & Infrastructure'
  },
  {
    id: 'usr-4',
    name: 'Priya Patel',
    email: 'priya.p@issueflow.dev',
    avatar: 'PP',
    role: 'Staff Frontend Engineer',
    team: 'Frontend Design System'
  },
  {
    id: 'usr-5',
    name: 'Devon Zhao',
    email: 'devon.z@issueflow.dev',
    avatar: 'DZ',
    role: 'Senior SRE',
    team: 'Platform & Infrastructure'
  },
  {
    id: 'usr-6',
    name: 'Aisha Al-Mansoor',
    email: 'aisha.m@issueflow.dev',
    avatar: 'AM',
    role: 'Search Engineering Specialist',
    team: 'Search & Discovery'
  }
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-checkout',
    name: 'Checkout & Payments',
    lead: 'Elena Rostova',
    membersCount: 6,
    openIssuesCount: 4,
    criticalCount: 1,
    resolvedCount: 22,
    velocity: '94% sprint delivery',
    components: ['Checkout', 'Payment Gateway', 'Stripe Webhooks', 'Billing Ledger']
  },
  {
    id: 'team-search',
    name: 'Search & Discovery',
    lead: 'Aisha Al-Mansoor',
    membersCount: 5,
    openIssuesCount: 3,
    criticalCount: 0,
    resolvedCount: 18,
    velocity: '89% sprint delivery',
    components: ['Search API', 'ElasticSearch Cluster', 'Query Parser', 'Catalog Cache']
  },
  {
    id: 'team-platform',
    name: 'Platform & Infrastructure',
    lead: 'Marcus Chen',
    membersCount: 7,
    openIssuesCount: 3,
    criticalCount: 1,
    resolvedCount: 31,
    velocity: '96% sprint delivery',
    components: ['Redis Cache', 'Auth Worker', 'Kubernetes Ingress', 'DB Migrations']
  },
  {
    id: 'team-frontend',
    name: 'Frontend Design System',
    lead: 'Priya Patel',
    membersCount: 5,
    openIssuesCount: 2,
    criticalCount: 0,
    resolvedCount: 27,
    velocity: '98% sprint delivery',
    components: ['Web App UI', 'Design Tokens', 'Accessibility Engine', 'Navigation']
  }
];

const now = new Date();
const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();
const f = (daysAhead: number) => new Date(now.getTime() + daysAhead * 86400000).toISOString();

const rawIssues: Omit<Issue, 'risk'>[] = [
  {
    id: 'iss-101',
    key: 'WEB-101',
    title: 'Checkout fails for saved payment methods on 3D Secure v2',
    description: 'Returning shoppers experience an unhandled 502 Bad Gateway response when selecting tokenized credit cards during checkout verification.',
    status: 'OPEN',
    priority: 'CRITICAL',
    severity: 'CRITICAL',
    component: 'Payment Gateway',
    team: 'Checkout & Payments',
    assignee: MOCK_USERS[1], // Elena
    reporter: CURRENT_USER,
    createdAt: d(3),
    updatedAt: d(0.2),
    dueAt: d(1), // Overdue by 1 day!
    reopenedCount: 1,
    stepsToReproduce: '1. Log in with existing account\n2. Add item to cart\n3. Select saved Visa ending in 4242\n4. Submit order\n5. Observe 502 proxy error.',
    expectedResult: '3DS verification modal triggers and authorization callback completes smoothly.',
    actualResult: 'HTTP 502 proxy error returned from auth gateway; session drops.',
    environment: 'Production (us-east-1), Stripe API v2025-08',
    attentionReason: 'Directly impacts conversion funnel; currently 1.8% of checkout attempts fail.',
    comments: [
      {
        id: 'c-1',
        issueId: 'iss-101',
        author: MOCK_USERS[1],
        text: 'Identified an upstream timeout with Stripe webhook callbacks during peak spikes. Working on circuit breaker patch.',
        createdAt: d(0.8)
      },
      {
        id: 'c-2',
        issueId: 'iss-101',
        author: CURRENT_USER,
        text: 'Marked as priority blocker for release v2.4.0. Will monitor rollout in staging.',
        createdAt: d(0.2)
      }
    ]
  },
  {
    id: 'iss-102',
    key: 'WEB-102',
    title: 'Dashboard telemetry stream hangs after browser tab backgrounding',
    description: 'WebSocket telemetry event buffer fails to reconnect with exponential backoff when the browser tab transitions out of dormant state.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    severity: 'MEDIUM',
    component: 'Web App UI',
    team: 'Frontend Design System',
    assignee: MOCK_USERS[3], // Priya
    reporter: MOCK_USERS[2],
    createdAt: d(5),
    updatedAt: d(0.5),
    dueAt: f(3),
    reopenedCount: 0,
    stepsToReproduce: '1. Open real-time dashboard\n2. Switch to another tab for 15+ minutes\n3. Return to tab\n4. Observe stale data without reconnection attempt.',
    expectedResult: 'Heartbeat ping detects reconnection loss and re-establishes socket channel.',
    actualResult: 'UI remains frozen until user triggers manual full page reload.',
    environment: 'Chrome 128 / macOS Sequoia, Firefox 131',
    attentionReason: 'Customer support reported 14 inquiries about delayed telemetry graphs.',
    comments: [
      {
        id: 'c-3',
        issueId: 'iss-102',
        author: MOCK_USERS[3],
        text: 'Drafted visibilitychange event listener to trigger immediate reconnect handshakes.',
        createdAt: d(0.5)
      }
    ]
  },
  {
    id: 'iss-103',
    key: 'WEB-103',
    title: 'Search results produce duplicates after rapid filter toggles',
    description: 'Concurrent pagination requests race each other when multiple facets are checked quickly, interleaving older query chunks with newer results.',
    status: 'OPEN',
    priority: 'HIGH',
    severity: 'HIGH',
    component: 'Search API',
    team: 'Search & Discovery',
    assignee: MOCK_USERS[5], // Aisha
    reporter: MOCK_USERS[1],
    createdAt: d(4),
    updatedAt: d(1.2),
    dueAt: d(2), // Overdue by 2 days!
    reopenedCount: 2,
    stepsToReproduce: '1. Navigate to Catalog Search\n2. Quickly check 3 filter checkboxes\n3. Scroll down to trigger infinite scroll\n4. See duplicate cards.',
    expectedResult: 'In-flight queries are aborted with AbortController before triggering next chunk.',
    actualResult: 'Out-of-order promise resolution duplicates IDs in React state array.',
    environment: 'Staging & Production Web Client',
    attentionReason: 'Reopened twice; indicates missing cancellation token in client query client.',
    comments: []
  },
  {
    id: 'iss-104',
    key: 'WEB-104',
    title: 'Improve keyboard navigation & roving tab-indexes across navigation',
    description: 'Ensure full accessibility compliance (WCAG 2.1 AA) so power users and screen readers can traverse horizontal nav, dialogs, and tables seamlessly.',
    status: 'RESOLVED',
    priority: 'LOW',
    severity: 'LOW',
    component: 'Accessibility Engine',
    team: 'Frontend Design System',
    assignee: CURRENT_USER,
    reporter: MOCK_USERS[3],
    createdAt: d(9),
    updatedAt: d(1),
    dueAt: null,
    reopenedCount: 0,
    stepsToReproduce: 'N/A - Audited via axe-core scanner.',
    expectedResult: 'All interactive elements receive clear outline rings and keyboard shortcuts.',
    actualResult: 'Verified and passed accessibility compliance checks.',
    environment: 'All browsers',
    attentionReason: 'Core hygiene ticket for Q4 design system audit.',
    comments: [
      {
        id: 'c-4',
        issueId: 'iss-104',
        author: CURRENT_USER,
        text: 'Added skip-to-content links, aria-expanded attributes, and roving tab indices.',
        createdAt: d(1)
      }
    ]
  },
  {
    id: 'iss-105',
    key: 'WEB-105',
    title: 'Redis connection pool exhaustion during scheduled SLA scan jobs',
    description: 'BullMQ worker queue instances do not gracefully release idle socket leases during mass SLA scans, triggering ECONNRESET in surrounding microservices.',
    status: 'OPEN',
    priority: 'CRITICAL',
    severity: 'HIGH',
    component: 'Redis Cache',
    team: 'Platform & Infrastructure',
    assignee: MOCK_USERS[4], // Devon
    reporter: MOCK_USERS[2],
    createdAt: d(2),
    updatedAt: d(0.1),
    dueAt: f(1),
    reopenedCount: 0,
    stepsToReproduce: '1. Trigger POST /api/jobs/sla-scan with 500+ issues\n2. Observe Redis client pool spike to max 100 connections\n3. Redis rejects new connections.',
    expectedResult: 'Connection pool throttles concurrent scans and reuses multiplexed clients.',
    actualResult: 'Pool spikes to maximum limit, failing auth microservice queries.',
    environment: 'Redis 7.2 on AWS ElastiCache',
    attentionReason: 'High risk of cascading failure during automated hourly background runs.',
    comments: [
      {
        id: 'c-5',
        issueId: 'iss-105',
        author: MOCK_USERS[4],
        text: 'Applying IoRedis connection pooling config with maxConnectionAge parameter.',
        createdAt: d(0.1)
      }
    ]
  },
  {
    id: 'iss-106',
    key: 'WEB-106',
    title: 'Hydration mismatch on user avatar in server-rendered navigation bar',
    description: 'Dynamic user initials rendered on SSR mismatch the client-side localStorage fallback when cookies are partitioned in Safari Private Mode.',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    severity: 'LOW',
    component: 'Web App UI',
    team: 'Frontend Design System',
    assignee: CURRENT_USER,
    reporter: CURRENT_USER,
    createdAt: d(3),
    updatedAt: d(0.3),
    dueAt: f(4),
    reopenedCount: 0,
    stepsToReproduce: '1. Open Safari Private Window\n2. Load home page\n3. Check console for React hydration mismatch warning.',
    expectedResult: 'Clean mount without React error 418.',
    actualResult: 'Console logs React hydration warning for workspace initials.',
    environment: 'WebKit / Safari 18.1',
    attentionReason: 'Causes temporary layout shift on first contentful paint.',
    comments: []
  },
  {
    id: 'iss-107',
    key: 'WEB-107',
    title: 'Database migration dry-run deadlock on project membership foreign key',
    description: 'Alter table constraint locks the memberships table in exclusive mode while high-frequency webhook transactions are in flight.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    severity: 'HIGH',
    component: 'DB Migrations',
    team: 'Platform & Infrastructure',
    assignee: MOCK_USERS[2], // Marcus
    reporter: CURRENT_USER,
    createdAt: d(4),
    updatedAt: d(0.6),
    dueAt: f(2),
    reopenedCount: 1,
    stepsToReproduce: 'Run prisma migrate deploy while simulated webhook traffic runs.',
    expectedResult: 'Migration completes using concurrent index creation without locking write queries.',
    actualResult: 'Postgres transaction times out with lock_not_available.',
    environment: 'PostgreSQL 16.4 Aurora Serverless',
    attentionReason: 'Must be verified before executing release candidate schema update.',
    comments: []
  },
  {
    id: 'iss-108',
    key: 'WEB-108',
    title: 'Billing invoice PDF generator truncates international currency symbols',
    description: 'UTF-8 font embedding in pdfkit worker drops Japanese Yen and British Pound glyphs, substituting question marks on customer receipt downloads.',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    severity: 'MEDIUM',
    component: 'Billing Ledger',
    team: 'Checkout & Payments',
    assignee: MOCK_USERS[1],
    reporter: MOCK_USERS[5],
    createdAt: d(12),
    updatedAt: d(2),
    dueAt: d(3),
    reopenedCount: 0,
    stepsToReproduce: 'Generate receipt for GBP or JPY order.',
    expectedResult: 'Accurate currency glyph rendering.',
    actualResult: 'Shows ? instead of symbol.',
    environment: 'PDF Generation microservice',
    attentionReason: 'Customer invoices for international enterprise tier.',
    comments: []
  },
  {
    id: 'iss-109',
    key: 'WEB-109',
    title: 'Sentry alerts lack correlation trace IDs for unauthenticated API routes',
    description: 'Middleware error boundary does not populate baggage header when pre-auth 401 exceptions occur, leaving blind spots in telemetry breadcrumbs.',
    status: 'OPEN',
    priority: 'LOW',
    severity: 'LOW',
    component: 'Auth Worker',
    team: 'Platform & Infrastructure',
    assignee: MOCK_USERS[4],
    reporter: MOCK_USERS[2],
    createdAt: d(6),
    updatedAt: d(1.5),
    dueAt: f(5),
    reopenedCount: 0,
    stepsToReproduce: 'Trigger 401 from unauthorized curl script and inspect Sentry issue.',
    expectedResult: 'Sentry trace connects client request ID to API log.',
    actualResult: 'Missing span trace context.',
    environment: 'OpenTelemetry Express instrumentation',
    attentionReason: 'Minor observability gap during debugging.',
    comments: []
  },
  {
    id: 'iss-110',
    key: 'WEB-110',
    title: 'Stripe webhook replay attack vulnerability on unvalidated timestamps',
    description: 'Tolerance window on stripe-signature header was configured to 600s instead of recommended 300s, leaving potential exposure to replay payloads.',
    status: 'RESOLVED',
    priority: 'CRITICAL',
    severity: 'HIGH',
    component: 'Stripe Webhooks',
    team: 'Checkout & Payments',
    assignee: MOCK_USERS[1],
    reporter: CURRENT_USER,
    createdAt: d(14),
    updatedAt: d(5),
    dueAt: d(6),
    reopenedCount: 0,
    stepsToReproduce: 'Replay old signed webhook payload with expired timestamp.',
    expectedResult: 'Webhook rejects signature validation.',
    actualResult: 'Payload was accepted if under 10 minutes.',
    environment: 'Production Webhook Gateway',
    attentionReason: 'Security hardening requirement for SOC2 compliance.',
    comments: []
  },
  {
    id: 'iss-111',
    key: 'WEB-111',
    title: 'ElasticSearch memory pressure alert triggered on fuzzy wildcard queries',
    description: 'Unindexed lead wildcard queries `*keyword*` trigger expensive Lucene segment traversals, spiking heap utilization to 88%.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    severity: 'MEDIUM',
    component: 'ElasticSearch Cluster',
    team: 'Search & Discovery',
    assignee: MOCK_USERS[5],
    reporter: MOCK_USERS[4],
    createdAt: d(3),
    updatedAt: d(0.4),
    dueAt: f(3),
    reopenedCount: 0,
    stepsToReproduce: 'Perform catalog query with leading asterisk.',
    expectedResult: 'Query engine enforces prefix search or ngram analysis.',
    actualResult: 'Unbounded heap memory allocation in JVM.',
    environment: 'ElasticSearch 8.13 on AWS OpenSearch',
    attentionReason: 'Contributes to recurring query latency spikes on Friday afternoons.',
    comments: []
  },
  {
    id: 'iss-112',
    key: 'WEB-112',
    title: 'Audit log timestamp skew across distributed container timezones',
    description: 'Worker events formatted with local container timezone instead of strict ISO UTC, causing out-of-order event sequences in compliance exports.',
    status: 'OPEN',
    priority: 'MEDIUM',
    severity: 'LOW',
    component: 'Platform & Infrastructure',
    team: 'Platform & Infrastructure',
    assignee: CURRENT_USER,
    reporter: MOCK_USERS[1],
    createdAt: d(5),
    updatedAt: d(2),
    dueAt: f(6),
    reopenedCount: 0,
    stepsToReproduce: 'Export CSV audit trail and compare microsecond sort.',
    expectedResult: 'Strict ISO-8601 UTC timestamps.',
    actualResult: 'Contains non-UTC offsets in 3 worker records.',
    environment: 'Docker Alpine containers',
    attentionReason: 'Audit compliance requirement for enterprise tenants.',
    comments: []
  }
];

export const INITIAL_ISSUES: Issue[] = rawIssues.map(issue => ({
  ...issue,
  risk: calculateRisk({
    severity: issue.severity,
    priority: issue.priority,
    dueAt: issue.dueAt,
    status: issue.status,
    reopenedCount: issue.reopenedCount,
    createdAt: issue.createdAt
  })
}));

export const MOCK_PATTERNS: RecurringPattern[] = [
  {
    id: 'pat-1',
    title: 'Payment Gateway Timeout Cascade on 3DS Callbacks',
    relatedIssuesCount: 6,
    affectedComponents: ['Payment Gateway', 'Stripe Webhooks', 'Checkout'],
    trend: '+38% failure rate during traffic surges',
    trendDirection: 'up',
    lastSeen: '18 minutes ago',
    suggestedAction: 'Deploy circuit breaker middleware with Redis-backed dead letter queue and fallback idempotent retry backoff.',
    severity: 'CRITICAL'
  },
  {
    id: 'pat-2',
    title: 'ElasticSearch Heap Saturation on Lead Wildcard Tokens',
    relatedIssuesCount: 4,
    affectedComponents: ['Search API', 'ElasticSearch Cluster', 'Catalog Cache'],
    trend: 'Recurring every Friday release window',
    trendDirection: 'stable',
    lastSeen: '3 hours ago',
    suggestedAction: 'Enforce edge-ngram tokenization at mapping time; reject unvalidated leading wildcard expressions in Query Parser.',
    severity: 'HIGH'
  },
  {
    id: 'pat-3',
    title: 'Socket Pool Starvation During Mass Batch Job Scans',
    relatedIssuesCount: 3,
    affectedComponents: ['Redis Cache', 'Auth Worker', 'DB Migrations'],
    trend: '-12% after connection reuse patch',
    trendDirection: 'down',
    lastSeen: 'Yesterday at 17:40',
    suggestedAction: 'Set strict acquire timeouts (1500ms) and configure worker pool concurrency limits to prevent socket exhaustion.',
    severity: 'HIGH'
  },
  {
    id: 'pat-4',
    title: 'Safari Private Mode Storage Partition Hydration Desync',
    relatedIssuesCount: 2,
    affectedComponents: ['Web App UI', 'Design Tokens'],
    trend: 'Isolated to WebKit iOS 18',
    trendDirection: 'stable',
    lastSeen: '2 days ago',
    suggestedAction: 'Defer non-critical client token hydration until post-mount lifecycle hook using useSyncExternalStore.',
    severity: 'MEDIUM'
  }
];

export const MOCK_RELEASE: Release = {
  id: 'rel-240',
  name: 'Orion',
  version: 'v2.4.0-rc1',
  targetDate: '2026-10-18T18:00:00.000Z',
  status: 'rc',
  readinessScore: 78,
  blockersCount: 1,
  highPriorityCount: 3,
  overdueCount: 2,
  checklist: [
    {
      id: 'chk-1',
      title: 'Automated E2E test suite green on Chromium & WebKit',
      completed: true,
      required: true,
      category: 'Testing'
    },
    {
      id: 'chk-2',
      title: 'Zero open CRITICAL severity incidents in production or RC',
      completed: false, // Blocked by WEB-101
      required: true,
      category: 'Security'
    },
    {
      id: 'chk-3',
      title: 'Database schema migration dry-run executed on staging replica',
      completed: false, // Blocked by WEB-107
      required: true,
      category: 'Database'
    },
    {
      id: 'chk-4',
      title: 'Sentry error rate under 0.05% threshold across canary fleet',
      completed: true,
      required: true,
      category: 'Infrastructure'
    },
    {
      id: 'chk-5',
      title: 'API breaking change audit and OpenAPI documentation generated',
      completed: true,
      required: false,
      category: 'Documentation'
    },
    {
      id: 'chk-6',
      title: 'Redis connection pool limits validated under 2x simulated peak load',
      completed: false, // In progress
      required: true,
      category: 'Infrastructure'
    }
  ]
};

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'status_changed',
    actor: MOCK_USERS[1],
    target: 'WEB-101',
    targetKey: 'WEB-101',
    detail: 'Escalated severity to CRITICAL following customer payment timeout spike',
    timestamp: d(0.1)
  },
  {
    id: 'act-2',
    type: 'comment_added',
    actor: CURRENT_USER,
    target: 'WEB-101',
    targetKey: 'WEB-101',
    detail: 'Attached Sentry stack trace and flagged as hard blocker for Orion release',
    timestamp: d(0.2)
  },
  {
    id: 'act-3',
    type: 'sla_warning',
    actor: MOCK_USERS[4],
    target: 'WEB-103',
    targetKey: 'WEB-103',
    detail: 'SLA Scan Worker flagged search duplicate bug as 48 hours overdue',
    timestamp: d(0.4)
  },
  {
    id: 'act-4',
    type: 'status_changed',
    actor: MOCK_USERS[3],
    target: 'WEB-102',
    targetKey: 'WEB-102',
    detail: 'Moved dashboard telemetry stream bug to IN_PROGRESS',
    timestamp: d(0.5)
  },
  {
    id: 'act-5',
    type: 'checklist_updated',
    actor: MOCK_USERS[2],
    target: 'v2.4.0-rc1',
    detail: 'Marked "Canary Sentry Error Threshold" as passed on staging fleet',
    timestamp: d(0.9)
  },
  {
    id: 'act-6',
    type: 'resolved',
    actor: CURRENT_USER,
    target: 'WEB-104',
    targetKey: 'WEB-104',
    detail: 'Resolved keyboard navigation accessibility audit with 100% test coverage',
    timestamp: d(1.0)
  },
  {
    id: 'act-7',
    type: 'created',
    actor: CURRENT_USER,
    target: 'WEB-105',
    targetKey: 'WEB-105',
    detail: 'Filed redis connection pool exhaustion during scheduled SLA scan jobs',
    timestamp: d(2.0)
  },
  {
    id: 'act-8',
    type: 'resolved',
    actor: MOCK_USERS[1],
    target: 'WEB-110',
    targetKey: 'WEB-110',
    detail: 'Closed Stripe webhook signature replay vulnerability after patch deployment',
    timestamp: d(5.0)
  }
];

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'int-github',
    name: 'GitHub Enterprise',
    category: 'Source Control & CI',
    status: 'connected',
    lastSync: '2 minutes ago',
    latency: '84ms',
    description: 'Syncs commits, PR links, and branch heads to IssueFlow issue keys.'
  },
  {
    id: 'int-sentry',
    name: 'Sentry Observability',
    category: 'Crash Reporting',
    status: 'connected',
    lastSync: '1 minute ago',
    latency: '112ms',
    description: 'Ingests real-time runtime exceptions and correlates stack traces with active issues.'
  },
  {
    id: 'int-pagerduty',
    name: 'PagerDuty',
    category: 'Incident Management',
    status: 'connected',
    lastSync: '4 minutes ago',
    latency: '95ms',
    description: 'Triggers on-call pages when issues escalate to CRITICAL severity.'
  },
  {
    id: 'int-slack',
    name: 'Slack Engineering Hub',
    category: 'Team Communication',
    status: 'connected',
    lastSync: 'Just now',
    latency: '42ms',
    description: 'Broadcasts daily engineering pulse summaries and release blocker digests to #eng-triage.'
  },
  {
    id: 'int-datadog',
    name: 'Datadog APM',
    category: 'Infrastructure Telemetry',
    status: 'degraded',
    lastSync: '14 minutes ago',
    latency: '340ms',
    description: 'Polls p99 service response latencies and correlates latency anomalies with code releases.'
  },
  {
    id: 'int-linear',
    name: 'Linear Bi-directional Sync',
    category: 'Cross-team Sync',
    status: 'connected',
    lastSync: '6 minutes ago',
    latency: '130ms',
    description: 'Bridges design and product tickets into IssueFlow operational queues.'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical Blocker Alert',
    description: 'WEB-101 (Payment Gateway 3DS) is blocking release candidate v2.4.0-rc1.',
    timestamp: '12m ago',
    type: 'alert',
    read: false,
    linkRoute: 'issues',
    issueKey: 'WEB-101'
  },
  {
    id: 'notif-2',
    title: 'SLA Breach Warning',
    description: 'WEB-103 (Search duplicates) is past its target resolution date by 2 days.',
    timestamp: '45m ago',
    type: 'warning',
    read: false,
    linkRoute: 'issues',
    issueKey: 'WEB-103'
  },
  {
    id: 'notif-3',
    title: 'Release Readiness Update',
    description: 'Release score improved to 78% after keyboard accessibility fix was merged.',
    timestamp: '2h ago',
    type: 'info',
    read: true,
    linkRoute: 'releases'
  },
  {
    id: 'notif-4',
    title: 'Sentry Telemetry Correlated',
    description: '3 new stack traces linked to pattern "Payment Gateway Timeout Cascade".',
    timestamp: '4h ago',
    type: 'info',
    read: true,
    linkRoute: 'intelligence'
  }
];

export const TIME_SERIES_DATA: Record<'7d' | '14d' | '30d', { label: string; date: string; opened: number; resolved: number; netFlow: number; critical: number }[]> = {
  '7d': [
    { label: 'Mon', date: 'Oct 5', opened: 12, resolved: 8, netFlow: 4, critical: 1 },
    { label: 'Tue', date: 'Oct 6', opened: 9, resolved: 11, netFlow: -2, critical: 0 },
    { label: 'Wed', date: 'Oct 7', opened: 16, resolved: 10, netFlow: 6, critical: 2 },
    { label: 'Thu', date: 'Oct 8', opened: 8, resolved: 14, netFlow: -6, critical: 1 },
    { label: 'Fri', date: 'Oct 9', opened: 11, resolved: 15, netFlow: -4, critical: 0 },
    { label: 'Sat', date: 'Oct 10', opened: 4, resolved: 7, netFlow: -3, critical: 0 },
    { label: 'Sun', date: 'Oct 11', opened: 6, resolved: 9, netFlow: -3, critical: 1 }
  ],
  '14d': [
    { label: 'Sep 28', date: 'Sep 28', opened: 14, resolved: 12, netFlow: 2, critical: 1 },
    { label: 'Sep 30', date: 'Sep 30', opened: 11, resolved: 13, netFlow: -2, critical: 0 },
    { label: 'Oct 2', date: 'Oct 2', opened: 15, resolved: 9, netFlow: 6, critical: 2 },
    { label: 'Oct 4', date: 'Oct 4', opened: 7, resolved: 8, netFlow: -1, critical: 0 },
    { label: 'Oct 6', date: 'Oct 6', opened: 12, resolved: 14, netFlow: -2, critical: 1 },
    { label: 'Oct 8', date: 'Oct 8', opened: 8, resolved: 15, netFlow: -7, critical: 0 },
    { label: 'Oct 10', date: 'Oct 10', opened: 6, resolved: 9, netFlow: -3, critical: 1 }
  ],
  '30d': [
    { label: 'Wk 37', date: 'Sep 14', opened: 48, resolved: 42, netFlow: 6, critical: 4 },
    { label: 'Wk 38', date: 'Sep 21', opened: 52, resolved: 56, netFlow: -4, critical: 3 },
    { label: 'Wk 39', date: 'Sep 28', opened: 45, resolved: 49, netFlow: -4, critical: 2 },
    { label: 'Wk 40', date: 'Oct 5', opened: 41, resolved: 54, netFlow: -13, critical: 2 }
  ]
};
