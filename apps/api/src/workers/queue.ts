import { Queue } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
export const slaQueue = new Queue('sla-monitor', { connection });
export async function enqueueSlaScan() { const job = await slaQueue.add('scan-overdue-issues', { requestedAt: new Date().toISOString() }, { removeOnComplete: 100, removeOnFail: 100 }); return job.id; }
