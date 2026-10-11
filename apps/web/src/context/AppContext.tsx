import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Issue,
  User,
  Team,
  RecurringPattern,
  Release,
  ActivityEvent,
  Integration,
  NotificationItem,
  RouteId,
  IssueFilterState,
  IssueStatus,
  Priority,
  Severity
} from '../types';
import {
  CURRENT_USER,
  MOCK_USERS,
  MOCK_TEAMS,
  INITIAL_ISSUES,
  MOCK_PATTERNS,
  MOCK_RELEASE,
  MOCK_ACTIVITY,
  MOCK_INTEGRATIONS,
  MOCK_NOTIFICATIONS
} from '../data/mockData';
import { calculateRisk, calculateReadiness } from '../services/intelligence';

interface AppContextValue {
  user: User;
  users: User[];
  issues: Issue[];
  teams: Team[];
  patterns: RecurringPattern[];
  release: Release;
  activity: ActivityEvent[];
  integrations: Integration[];
  notifications: NotificationItem[];
  activeRoute: RouteId;
  setActiveRoute: (route: RouteId) => void;
  filterState: IssueFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<IssueFilterState>>;
  selectedIssue: Issue | null;
  setSelectedIssue: (issue: Issue | null) => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  showSearchModal: boolean;
  setShowSearchModal: (show: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notice: string;
  setNotice: (msg: string) => void;
  apiOnline: boolean;
  // Actions
  createIssue: (form: {
    title: string;
    description: string;
    severity: Severity;
    priority: Priority;
    component: string;
    team?: string;
    assigneeId?: string;
    dueAt?: string | null;
  }) => void;
  updateIssueStatus: (issueId: string, nextStatus: IssueStatus) => void;
  updateIssuePriority: (issueId: string, nextPriority: Priority) => void;
  updateIssueAssignee: (issueId: string, assigneeId: string) => void;
  addComment: (issueId: string, text: string) => void;
  toggleReleaseChecklist: (itemId: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  navigateToFilteredIssues: (filters: Partial<IssueFilterState>) => void;
  scrollToSection: (sectionId: string) => void;
  // Computed helpers
  computedReadiness: ReturnType<typeof calculateReadiness>;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_FILTERS: IssueFilterState = {
  query: '',
  status: 'ALL',
  priority: 'ALL',
  severity: 'ALL',
  team: 'ALL',
  component: 'ALL',
  assignee: 'ALL'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>(CURRENT_USER);
  const [users] = useState<User[]>(MOCK_USERS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [patterns] = useState<RecurringPattern[]>(MOCK_PATTERNS);
  const [release, setRelease] = useState<Release>(MOCK_RELEASE);
  const [activity, setActivity] = useState<ActivityEvent[]>(MOCK_ACTIVITY);
  const [integrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const [activeRoute, setActiveRoute] = useState<RouteId>('overview');
  const [filterState, setFilterState] = useState<IssueFilterState>(DEFAULT_FILTERS);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notice, setNotice] = useState<string>('');
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  // Check backend health silently
  useEffect(() => {
    let mounted = true;
    const checkApi = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/health', { signal: AbortSignal.timeout(1500) });
        if (mounted) setApiOnline(res.ok);
      } catch {
        if (mounted) setApiOnline(false);
      }
    };
    checkApi();
    return () => { mounted = false; };
  }, []);

  // Keyboard shortcut for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowCreateModal(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live readiness based on stateful issues
  const computedReadiness = useMemo(() => {
    return calculateReadiness(issues);
  }, [issues]);

  // Synchronize release score with computed readiness
  useEffect(() => {
    setRelease(prev => ({
      ...prev,
      readinessScore: computedReadiness.score,
      blockersCount: computedReadiness.blockers.critical,
      overdueCount: computedReadiness.blockers.overdue
    }));
  }, [computedReadiness]);

  // Issue Creation
  const createIssue = useCallback((form: {
    title: string;
    description: string;
    severity: Severity;
    priority: Priority;
    component: string;
    team?: string;
    assigneeId?: string;
    dueAt?: string | null;
  }) => {
    const nextIndex = issues.length + 101;
    const newKey = `WEB-${nextIndex}`;
    const assignedUser = users.find(u => u.id === form.assigneeId) || user;
    const chosenTeam = form.team || 'Platform & Infrastructure';
    const nowIso = new Date().toISOString();

    const newIssueWithoutRisk: Omit<Issue, 'risk'> = {
      id: `iss-${Date.now()}`,
      key: newKey,
      title: form.title,
      description: form.description,
      status: 'OPEN',
      priority: form.priority,
      severity: form.severity,
      component: form.component || 'Web App',
      team: chosenTeam,
      assignee: assignedUser,
      reporter: user,
      createdAt: nowIso,
      updatedAt: nowIso,
      dueAt: form.dueAt || null,
      reopenedCount: 0,
      stepsToReproduce: 'Reported via IssueFlow intake modal.',
      expectedResult: 'System functions in accordance with specification.',
      actualResult: form.description,
      environment: 'Web Browser / Production',
      attentionReason: `Newly logged ${form.severity.toLowerCase()} issue awaiting triage.`,
      comments: []
    };

    const newIssue: Issue = {
      ...newIssueWithoutRisk,
      risk: calculateRisk({
        severity: newIssueWithoutRisk.severity,
        priority: newIssueWithoutRisk.priority,
        dueAt: newIssueWithoutRisk.dueAt,
        status: newIssueWithoutRisk.status,
        reopenedCount: 0,
        createdAt: nowIso
      })
    };

    setIssues(prev => [newIssue, ...prev]);

    // Add activity record
    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'created',
      actor: user,
      target: newKey,
      targetKey: newKey,
      detail: `Created issue "${form.title}" (${form.severity})`,
      timestamp: nowIso
    };
    setActivity(prev => [newActivity, ...prev]);

    // Update team open count
    setTeams(prev => prev.map(t => t.name === chosenTeam ? { ...t, openIssuesCount: t.openIssuesCount + 1 } : t));

    setNotice(`Created issue ${newKey} successfully.`);
    setShowCreateModal(false);
  }, [issues.length, users, user]);

  // Update Status
  const updateIssueStatus = useCallback((issueId: string, nextStatus: IssueStatus) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id !== issueId) return iss;
      const isReopening = iss.status === 'RESOLVED' && nextStatus === 'OPEN';
      const updatedReopenedCount = isReopening ? iss.reopenedCount + 1 : iss.reopenedCount;
      const updatedRisk = calculateRisk({
        severity: iss.severity,
        priority: iss.priority,
        dueAt: iss.dueAt,
        status: nextStatus,
        reopenedCount: updatedReopenedCount,
        createdAt: iss.createdAt
      });
      return {
        ...iss,
        status: nextStatus,
        reopenedCount: updatedReopenedCount,
        risk: updatedRisk,
        updatedAt: new Date().toISOString()
      };
    }));

    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
      const nowIso = new Date().toISOString();
      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: nextStatus === 'RESOLVED' ? 'resolved' : 'status_changed',
        actor: user,
        target: targetIssue.key,
        targetKey: targetIssue.key,
        detail: `Transitioned status to ${nextStatus.replace('_', ' ')}`,
        timestamp: nowIso
      };
      setActivity(prev => [newActivity, ...prev]);
      setNotice(`${targetIssue.key} status changed to ${nextStatus.replace('_', ' ')}`);

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    }
  }, [issues, user, selectedIssue]);

  // Update Priority
  const updateIssuePriority = useCallback((issueId: string, nextPriority: Priority) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id !== issueId) return iss;
      const updatedRisk = calculateRisk({
        severity: iss.severity,
        priority: nextPriority,
        dueAt: iss.dueAt,
        status: iss.status,
        reopenedCount: iss.reopenedCount,
        createdAt: iss.createdAt
      });
      return {
        ...iss,
        priority: nextPriority,
        risk: updatedRisk,
        updatedAt: new Date().toISOString()
      };
    }));

    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
      const nowIso = new Date().toISOString();
      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'priority_changed',
        actor: user,
        target: targetIssue.key,
        targetKey: targetIssue.key,
        detail: `Adjusted priority to ${nextPriority}`,
        timestamp: nowIso
      };
      setActivity(prev => [newActivity, ...prev]);
      setNotice(`${targetIssue.key} priority updated to ${nextPriority}`);

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, priority: nextPriority } : null);
      }
    }
  }, [issues, user, selectedIssue]);

  // Update Assignee
  const updateIssueAssignee = useCallback((issueId: string, assigneeId: string) => {
    const nextUser = users.find(u => u.id === assigneeId) || user;
    setIssues(prev => prev.map(iss => iss.id === issueId ? { ...iss, assignee: nextUser, updatedAt: new Date().toISOString() } : iss));
    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
      setNotice(`Reassigned ${targetIssue.key} to ${nextUser.name}`);
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, assignee: nextUser } : null);
      }
    }
  }, [issues, users, user, selectedIssue]);

  // Add Comment
  const addComment = useCallback((issueId: string, text: string) => {
    if (!text.trim()) return;
    const nowIso = new Date().toISOString();
    const comment = {
      id: `comm-${Date.now()}`,
      issueId,
      author: user,
      text: text.trim(),
      createdAt: nowIso
    };

    setIssues(prev => prev.map(iss => {
      if (iss.id !== issueId) return iss;
      const comments = iss.comments ? [...iss.comments, comment] : [comment];
      return { ...iss, comments, updatedAt: nowIso };
    }));

    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
      setActivity(prev => [
        {
          id: `act-${Date.now()}`,
          type: 'comment_added',
          actor: user,
          target: targetIssue.key,
          targetKey: targetIssue.key,
          detail: `Commented: "${text.slice(0, 48)}${text.length > 48 ? '...' : ''}"`,
          timestamp: nowIso
        },
        ...prev
      ]);

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, comments: prev.comments ? [...prev.comments, comment] : [comment] } : null);
      }
      setNotice(`Comment added to ${targetIssue.key}`);
    }
  }, [issues, user, selectedIssue]);

  // Toggle Release Checklist Item
  const toggleReleaseChecklist = useCallback((itemId: string) => {
    setRelease(prev => {
      const updatedChecklist = prev.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return { ...prev, checklist: updatedChecklist };
    });

    const item = release.checklist.find(c => c.id === itemId);
    if (item) {
      const stateLabel = !item.completed ? 'completed' : 'unmarked';
      setActivity(prev => [
        {
          id: `act-${Date.now()}`,
          type: 'checklist_updated',
          actor: user,
          target: release.version,
          detail: `${stateLabel.toUpperCase()} release checklist item "${item.title}"`,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
      setNotice(`Updated release checklist item`);
    }
  }, [release, user]);

  // Notifications
  const markNotificationRead = useCallback((notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotice('All notifications marked as read.');
  }, []);

  // Filter and Navigate
  const navigateToFilteredIssues = useCallback((filters: Partial<IssueFilterState>) => {
    setFilterState(prev => ({
      ...prev,
      ...filters
    }));
    setActiveRoute('issues');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Smooth scroll to an Overview section
  const scrollToSection = useCallback((sectionId: string) => {
    if (activeRoute !== 'overview') {
      setActiveRoute('overview');
      // allow React to render Overview before scrolling
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoute]);

  const value: AppContextValue = {
    user,
    users,
    issues,
    teams,
    patterns,
    release,
    activity,
    integrations,
    notifications,
    activeRoute,
    setActiveRoute,
    filterState,
    setFilterState,
    selectedIssue,
    setSelectedIssue,
    showCreateModal,
    setShowCreateModal,
    showSearchModal,
    setShowSearchModal,
    showNotifications,
    setShowNotifications,
    notice,
    setNotice,
    apiOnline,
    createIssue,
    updateIssueStatus,
    updateIssuePriority,
    updateIssueAssignee,
    addComment,
    toggleReleaseChecklist,
    markNotificationRead,
    markAllNotificationsRead,
    navigateToFilteredIssues,
    scrollToSection,
    computedReadiness
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
