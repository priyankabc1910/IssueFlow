import 'dotenv/config';
import { PrismaClient, Role, Priority, Severity, IssueStatus, IssueType } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const email = 'demo@issueflow.dev';
  const passwordHash = await bcrypt.hash('IssueFlowDemo!2026', 12);
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { name: 'Demo Engineer', email, passwordHash } });
  const workspace = await prisma.workspace.upsert({ where: { slug: 'acme-engineering' }, update: {}, create: { name: 'Acme Engineering', slug: 'acme-engineering' } });
  await prisma.membership.upsert({ where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } }, update: { role: Role.OWNER }, create: { userId: user.id, workspaceId: workspace.id, role: Role.OWNER } });
  const project = await prisma.project.upsert({ where: { workspaceId_key: { workspaceId: workspace.id, key: 'WEB' } }, update: {}, create: { name: 'Web Platform', key: 'WEB', description: 'Customer-facing web application', workspaceId: workspace.id, githubRepo: 'example/issueflow' } });
  const examples = [
    { key: 'WEB-101', title: 'Checkout fails for saved payment methods', description: 'Returning users see a server error when choosing a saved card.', severity: Severity.CRITICAL, priority: Priority.CRITICAL, status: IssueStatus.OPEN, component: 'Checkout', type: IssueType.BUG, dueAt: new Date(Date.now() - 86400000) },
    { key: 'WEB-102', title: 'Dashboard chart does not refresh', description: 'New data appears only after a full page reload.', severity: Severity.MEDIUM, priority: Priority.MEDIUM, status: IssueStatus.IN_PROGRESS, component: 'Analytics', type: IssueType.BUG, dueAt: new Date(Date.now() + 86400000 * 3) },
    { key: 'WEB-103', title: 'Search results repeat after reopening issue', description: 'Repeated result items appear after the filter is changed.', severity: Severity.HIGH, priority: Priority.HIGH, status: IssueStatus.OPEN, component: 'Search', type: IssueType.BUG, dueAt: new Date(Date.now() - 86400000 * 2) },
    { key: 'WEB-104', title: 'Improve keyboard navigation', description: 'Ensure all issue actions can be reached without a mouse.', severity: Severity.LOW, priority: Priority.LOW, status: IssueStatus.RESOLVED, component: 'Accessibility', type: IssueType.TASK, dueAt: null }
  ];
  for (const issue of examples) await prisma.issue.upsert({ where: { key: issue.key }, update: {}, create: { ...issue, projectId: project.id, reporterId: user.id, stepsToReproduce: '1. Open the page.\n2. Repeat the action.', expectedResult: 'The interface should behave consistently.', actualResult: issue.description, environment: 'Chrome / Windows' } });
  console.log('Seed complete. Demo login: demo@issueflow.dev / IssueFlowDemo!2026');
}
main().finally(() => prisma.$disconnect());
