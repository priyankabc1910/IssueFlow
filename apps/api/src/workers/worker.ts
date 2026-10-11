import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../db.js';
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const worker = new Worker('sla-monitor', async job => {
  const now = new Date(); const overdue = await prisma.issue.findMany({ where: { dueAt: { lt: now }, status: { notIn: ['RESOLVED','CLOSED'] } }, include: { assignee: true, reporter: true } });
  for (const issue of overdue) { const target = issue.assigneeId || issue.reporterId; const exists = await prisma.notification.findFirst({ where: { userId: target, issueId: issue.id, title: 'Issue overdue', readAt: null } }); if (!exists) await prisma.notification.create({ data: { userId: target, issueId: issue.id, title: 'Issue overdue', body: `${issue.key} — ${issue.title} is past its due date.` } }); }
  return { scanned: overdue.length, run: job.id };
}, { connection });
worker.on('completed', job => console.log(`SLA scan ${job.id} completed`)); worker.on('failed', (job, err) => console.error(`SLA scan failed`, job?.id, err));
console.log('IssueFlow SLA worker running');
