import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
export type AuthRequest = Request & { user?: { id: string; email: string } };
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization'); const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string }; next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
