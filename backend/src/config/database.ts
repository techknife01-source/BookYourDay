import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';
import { MovieModel } from '../models/Movie.js';

export async function connectDatabase(): Promise<boolean> {
  mongoose.set('bufferCommands', true);
  const rawUri = env.MONGODB_URI || process.env.MONGODB_URI || '';
  const uri = rawUri.trim() !== '' && !rawUri.includes('<USE_THE_MONGODB_ATLAS_URI') 
    ? rawUri 
    : 'mongodb://127.0.0.1:27017/bookyourday';

  // Configure optional custom DNS servers if MONGODB_DNS_SERVERS environment variable is set
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

  const isProduction = env.NODE_ENV === 'production';

  if (!uri || uri.trim() === '') {
    if (isProduction) {
      console.error('❌ [Database] MONGODB_URI is not configured in production environment.');
      return false;
    }
    console.log('ℹ️ [Database] MONGODB_URI not configured. Attempting connection to local MongoDB...');
  }

  try {
    const options: mongoose.ConnectOptions = {
      dbName: 'book-your-day',
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`✅ [Database] MongoDB Atlas Connected successfully! Host: ${conn.connection.host} | DB: book-your-day`);

    // Check if initial seeding is required
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

    return true;
  } catch (error: any) {
    const safeErrorMessage = error?.message ? error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : 'Connection failed';

    if (isProduction) {
      console.error(`❌ [Database] Production MongoDB connection failed: ${safeErrorMessage}`);
    } else {
      console.warn(`⚠️ [Database] Connection warning: ${safeErrorMessage}. Running in development fallback mode.`);
    }
    return false;
  }
}

export function getDatabaseStatus(): 'connected' | 'disconnected' | 'connecting' {
  const state = mongoose.connection.readyState;
  if (state === 1) return 'connected';
  if (state === 2) return 'connecting';
  return 'disconnected';
}
