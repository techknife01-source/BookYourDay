import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'partner' | 'admin';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
