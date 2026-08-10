import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load backend/.env file
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config(); // fallback to current CWD .env

const envSchema = z.object({
  MONGODB_URI: z.string().optional().default(''),
  MONGODB_DNS_SERVERS: z.string().optional().default(''),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('bookyourday_jwt_secret_key_2026_default'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const env = envSchema.parse(process.env);

export function validateEnv() {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ [ENV WARNING] MONGODB_URI is not set in environment. Backend will operate with fallback mock dataset if database connection fails.');
  }
}
