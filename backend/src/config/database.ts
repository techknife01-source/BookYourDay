import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';
import { MovieModel } from '../models/Movie.js';

let hasAttemptedConnection = false;
let connectionResult = false;

export async function connectDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;
  if (hasAttemptedConnection && connectionResult) return true;
  hasAttemptedConnection = true;
  mongoose.set('bufferCommands', false);

  const isProduction = env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';
  const rawUri = (process.env.MONGODB_URI || env.MONGODB_URI || '').trim();

  // In production, MONGODB_URI is strictly required and cannot be empty, localhost, or placeholder
  if (isProduction) {
    if (!rawUri || rawUri.includes('<USE_THE_MONGODB_ATLAS_URI') || rawUri.includes('127.0.0.1') || rawUri.includes('localhost')) {
      const msg = '❌ [Database] MONGODB_URI is required and must point to a valid MongoDB Atlas cluster in production. Startup aborted.';
      console.error(msg);
      throw new Error(msg);
    }
  }

  // Use configured URI or fallback to local default for development/test
  const uri = rawUri !== '' && !rawUri.includes('<USE_THE_MONGODB_ATLAS_URI')
    ? rawUri
    : 'mongodb://127.0.0.1:27017/bookyourday';

  // Configure optional custom DNS servers (useful for Atlas SRV lookups on restricted DNS environments)
  const rawDnsServers = env.MONGODB_DNS_SERVERS || process.env.MONGODB_DNS_SERVERS || '';
  if (rawDnsServers.trim().length > 0) {
    const servers = rawDnsServers
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (servers.length > 0) {
      try {
        dns.setServers(servers);
        console.log(`🌐 [Database] Configured custom DNS servers: ${servers.join(', ')}`);
      } catch (dnsErr: any) {
        console.warn(`⚠️ [Database] Failed to set custom DNS servers (${servers.join(', ')}): ${dnsErr?.message}`);
      }
    }
  }

  const options: mongoose.ConnectOptions = {
    dbName: 'book-your-day',
    serverSelectionTimeoutMS: isProduction ? 10000 : 3000,
    connectTimeoutMS: isProduction ? 10000 : 3000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`✅ [Database] MongoDB Connected successfully! Host: ${conn.connection.host} | DB: book-your-day`);

    // In development or when explicitly allowed, check if initial seeding is required
    if (!isProduction || process.env.ALLOW_PRODUCTION_SEED === 'true') {
      const movieCount = await (MovieModel as any).countDocuments().catch(() => 0);
      if (movieCount === 0) {
        console.log('🌱 [Database] Collections empty. Auto-seeding initial marketplace data into MongoDB...');
        try {
          const { runSeed } = await import('../seed/seed.js');
          await runSeed();
        } catch (seedErr: any) {
          console.warn(`⚠️ [Database] Seed trigger info: ${seedErr?.message}`);
        }
      }
    }

    connectionResult = true;
    return true;
  } catch (error: any) {
    const safeErrorMessage = error?.message
      ? error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@')
      : 'Connection failed';

    if (isProduction) {
      console.error(`❌ [Database] Production MongoDB Atlas connection failed: ${safeErrorMessage}`);
      connectionResult = false;
      throw new Error(`Production MongoDB Atlas connection failed: ${safeErrorMessage}`);
    } else {
      console.warn(`⚠️ [Database] Development MongoDB connection to ${uri} failed: ${safeErrorMessage}`);
      connectionResult = false;
      return false;
    }
  }
}

export function getDatabaseStatus(): 'connected' | 'disconnected' | 'connecting' {
  const state = mongoose.connection.readyState;
  if (state === 1) return 'connected';
  if (state === 2) return 'connecting';
  return 'disconnected';
}
