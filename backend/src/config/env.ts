import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().default('bookyourday_jwt_secret_key_2026_default'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const env = envSchema.parse(process.env);
