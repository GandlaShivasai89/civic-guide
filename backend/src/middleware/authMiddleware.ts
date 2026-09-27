import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DatabaseAdapter } from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'civicguide_super_secure_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'citizen' | 'admin';
    full_name: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: 'citizen' | 'admin'; full_name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. Missing bearer token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await DatabaseAdapter.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account no longer exists.' });
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    };
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await DatabaseAdapter.findUserById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      };
    }
  } catch {
    // Ignore invalid token for optional auth
  }
  next();
}
