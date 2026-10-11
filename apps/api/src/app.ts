import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from './db.js';
import { requireAuth, type AuthRequest } from './middleware/auth.js';
import { readinessScore, riskFor, similarity } from './services/intelligence.js';
import { enqueueSlaScan } from './workers/queue.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'issueflow-api', timestamp: new Date().toISOString() }));

const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(254), password: z.string().min(10).max(128), workspaceName: z.string().trim().min(2).max(80).default('My Workspace') });
app.post('/api/auth/register', async (req, res, next) => {
  try { const data = registerSchema.parse(req.body); const email = data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: 'Email is already registered' });
    const passwordHash = await bcrypt.hash(data.password, 12); const slug = `${data.workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'workspace'}-${Math.random().toString(36).slice(2, 7)}`;
    const user = await prisma.user.create({ data: { name: data.name, email, passwordHash, memberships: { create: { role: 'OWNER', workspace: { create: { name: data.workspaceName, slug, projects: { create: { name: 'Main Project', key: 'MAIN' } } } } } } });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '8h' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
app.post('/api/auth/login', async (req, res, next) => {
  try { const schema = z.object({ email: z.string().email(), password: z.string().min(1) }); const data = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '8h' }); res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

app.get('/api/me', requireAuth, async (req: AuthRequest, res, next) => { try { const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, memberships: { include: { workspace: { include: { projects: true } } } } } }); res.json(user); } catch (e) { next(e); } });

app.get('/api/issues', requireAuth, async (req: AuthRequest, res, next) => { try {
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const membership = await prisma.membership.findFirst({ where: { userId: req.user!.id }, include: { workspace: { include: { projects: { select: { id: true } } } } }, orderBy: { createdAt: 'asc' } });
  if (!membership) return res.json({ items: [], total: 0, page, limit });
  const projectIds = membership.workspace.projects.map(p => p.id); const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const where: any = { projectId: { in: projectIds }, ...(req.query.status ? { status: String(req.query.status) } : {}), ...(req.query.priority ? { priority: String(req.query.priority) } : {}), ...(req.query.component ? { component: String(req.query.component) } : {}), ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { key: { contains: q, mode: 'insensitive' } }] } : {}) };
  const [items, total] = await Promise.all([prisma.issue.findMany({ where, include: { reporter: { select: { id: true, name: true } }, assignee: { select: { id: true, name: true } }, project: { select: { name: true, key: true } } }, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.issue.count({ where })]);
  res.json({ items: items.map(i => ({ ...i, risk: riskFor(i) })), total, page, limit });
} catch (e) { next(e); } });

const issueSchema = z.object({ title: z.string().trim().min(5).max(160), description: z.string().trim().min(10).max(10000), stepsToReproduce: z.string().max(10000).optional(), expectedResult: z.string().max(5000).optional(), actualResult: z.string().max(5000).optional(), environment: z.string().max(250).optional(), priority: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).default('MEDIUM'), severity: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).default('MEDIUM'), type: z.enum(['BUG','TASK','FEATURE']).default('BUG'), component: z.string().max(80).optional(), githubIssueUrl: z.string().url().optional().or(z.literal('')), dueAt: z.string().datetime().optional(), assigneeId: z.string().optional(), projectId: z.string().optional() });
app.post('/api/issues', requireAuth, async (req: AuthRequest, res, next) => { try {
  const data = issueSchema.parse(req.body); const membership = await prisma.membership.findFirst({ where: { userId: req.user!.id }, include: { workspace: { include: { projects: true } } } }); if (!membership) return res.status(403).json({ error: 'Join a workspace before creating issues' }); if (membership.role === 'VIEWER') return res.status(403).json({ error: 'Viewer role cannot create issues' });
  const project = data.projectId ? membership.workspace.projects.find(p => p.id === data.projectId) : membership.workspace.projects[0]; if (!project) return res.status(400).json({ error: 'Invalid project for your workspace' }); if (data.assigneeId) { const allowed = await prisma.membership.findFirst({ where: { userId: data.assigneeId, workspaceId: membership.workspaceId } }); if (!allowed) return res.status(400).json({ error: 'Assignee must belong to your workspace' }); }
  const latest = await prisma.issue.count({ where: { projectId: project.id } }); const issue = await prisma.issue.create({ data: { ...data, dueAt: data.dueAt ? new Date(data.dueAt) : undefined, key: `${project.key}-${100 + latest + 1}`, projectId: project.id, reporterId: req.user!.id, assigneeId: data.assigneeId || undefined }, include: { reporter: { select: { id: true, name: true } }, assignee: { select: { id: true, name: true } } } });
  await prisma.auditEntry.create({ data: { issueId: issue.id, actorId: req.user!.id, action: 'ISSUE_CREATED', changes: { title: issue.title, status: issue.status } } }); res.status(201).json({ ...issue, risk: riskFor(issue) });
} catch (e) { next(e); } });

app.get('/api/issues/:id', requireAuth, async (req: AuthRequest, res, next) => { try { const issue = await prisma.issue.findUnique({ where: { id: req.params.id }, include: { project: { include: { workspace: { include: { memberships: { where: { userId: req.user!.id } } } } } }, reporter: { select: { id: true, name: true } }, assignee: { select: { id: true, name: true } }, auditEntries: { include: { actor: { select: { name: true } } }, orderBy: { createdAt: 'desc' } } } }); if (!issue || !issue.project.workspace.memberships.length) return res.status(404).json({ error: 'Issue not found' }); res.json({ ...issue, risk: riskFor(issue) }); } catch (e) { next(e); } });

app.patch('/api/issues/:id', requireAuth, async (req: AuthRequest, res, next) => { try { const data = issueSchema.partial().extend({ status: z.enum(['OPEN','IN_PROGRESS','IN_REVIEW','RESOLVED','CLOSED']).optional(), reopenedCount: z.number().int().min(0).optional() }).parse(req.body); const existing = await prisma.issue.findUnique({ where: { id: req.params.id }, include: { project: { include: { workspace: { include: { memberships: { where: { userId: req.user!.id } } } } } } }); if (!existing || !existing.project.workspace.memberships.length) return res.status(404).json({ error: 'Issue not found' }); const membershipRole = existing.project.workspace.memberships[0]?.role; if (membershipRole === 'VIEWER') return res.status(403).json({ error: 'Viewer role cannot update issues' }); if (data.projectId && data.projectId !== existing.projectId) return res.status(400).json({ error: 'Moving issues between projects is not supported by this endpoint' }); if (data.assigneeId) { const allowed = await prisma.membership.findFirst({ where: { userId: data.assigneeId, workspaceId: existing.project.workspaceId } }); if (!allowed) return res.status(400).json({ error: 'Assignee must belong to your workspace' }); }
  const patch: any = { ...data, projectId: undefined, dueAt: data.dueAt ? new Date(data.dueAt) : undefined }; if (data.status === 'RESOLVED' || data.status === 'CLOSED') patch.resolvedAt = new Date(); if (data.status && ['RESOLVED','CLOSED'].includes(existing.status) && ['OPEN','IN_PROGRESS','IN_REVIEW'].includes(data.status)) { patch.reopenedCount = existing.reopenedCount + 1; patch.resolvedAt = null; }
  const updated = await prisma.issue.update({ where: { id: existing.id }, data: patch }); const changes: Record<string, { from: unknown; to: unknown }> = {}; for (const [key, value] of Object.entries(data)) if ((existing as any)[key] !== value) changes[key] = { from: (existing as any)[key], to: value }; await prisma.auditEntry.create({ data: { issueId: updated.id, actorId: req.user!.id, action: 'ISSUE_UPDATED', changes } }); res.json({ ...updated, risk: riskFor(updated) });
} catch (e) { next(e); } });

app.get('/api/analytics/overview', requireAuth, async (req: AuthRequest, res, next) => { try { const membership = await prisma.membership.findFirst({ where: { userId: req.user!.id }, include: { workspace: { include: { projects: { select: { id: true } } } } } }); if (!membership) return res.json({ total: 0, open: 0, critical: 0, overdue: 0, reopened: 0, readiness: { score: 100, label: 'Ready', blockers: { critical: 0, overdue: 0, reopened: 0, active: 0 } }, components: [] }); const ids = membership.workspace.projects.map(p => p.id); const issues = await prisma.issue.findMany({ where: { projectId: { in: ids } } }); const active = issues.filter(i => !['RESOLVED','CLOSED'].includes(i.status)); const overdue = active.filter(i => i.dueAt && i.dueAt < new Date()); const byComponent = new Map<string, number>(); for (const i of issues) if (i.component) byComponent.set(i.component, (byComponent.get(i.component) || 0) + 1); res.json({ total: issues.length, open: active.length, critical: active.filter(i => i.severity === 'CRITICAL').length, overdue: overdue.length, reopened: issues.filter(i => i.reopenedCount > 0).length, readiness: readinessScore(issues), components: [...byComponent].map(([component, count]) => ({ component, count })).sort((a,b) => b.count-a.count).slice(0,6), recent: issues.sort((a,b) => b.updatedAt.getTime()-a.updatedAt.getTime()).slice(0,5).map(i => ({ id: i.id, key: i.key, title: i.title, status: i.status, priority: i.priority, risk: riskFor(i) })) }); } catch (e) { next(e); } });

app.get('/api/issues/:id/similar', requireAuth, async (req: AuthRequest, res, next) => { try { const issue = await prisma.issue.findUnique({ where: { id: req.params.id }, include: { project: { include: { workspace: { include: { memberships: { where: { userId: req.user!.id } } } } } } }); if (!issue || !issue.project.workspace.memberships.length) return res.status(404).json({ error: 'Issue not found' }); const others = await prisma.issue.findMany({ where: { projectId: issue.projectId, id: { not: issue.id } }, take: 100, orderBy: { createdAt: 'desc' } }); res.json(others.map(other => ({ id: other.id, key: other.key, title: other.title, status: other.status, similarity: Math.round(similarity(issue.title + ' ' + issue.description, other.title + ' ' + other.description) * 100) })).filter(x => x.similarity >= 15).sort((a,b) => b.similarity-a.similarity).slice(0,5)); } catch (e) { next(e); } });

app.get('/api/notifications', requireAuth, async (req: AuthRequest, res, next) => { try { const notifications = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50, include: { issue: { select: { id: true, key: true, title: true, status: true } } } }); res.json(notifications); } catch (e) { next(e); } });
app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthRequest, res, next) => { try { const result = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id, readAt: null }, data: { readAt: new Date() } }); if (!result.count) return res.status(404).json({ error: 'Unread notification not found' }); res.json({ updated: true }); } catch (e) { next(e); } });

app.post('/api/jobs/sla-scan', requireAuth, async (_req, res, next) => { try { const jobId = await enqueueSlaScan(); res.status(202).json({ queued: true, jobId }); } catch (e) { next(e); } });

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => { if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })) }); console.error(err); res.status(500).json({ error: 'Internal server error' }); });
