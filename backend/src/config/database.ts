import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

export async function connectDatabase(): Promise<boolean> {
  const uri = env.MONGODB_URI;

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

  if (!uri || uri.trim() === '' || uri.includes('<USE_THE_MONGODB_ATLAS_URI')) {
    if (isProduction) {
      console.error('❌ [Database] MONGODB_URI is not configured in production environment.');
      return false;
    }
    console.log('ℹ️ [Database] MONGODB_URI not configured. Running in development fallback mode.');
    return false;
  }

  try {
    const options: mongoose.ConnectOptions = {
      dbName: 'book-your-day',
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`✅ [Database] MongoDB Atlas Connected successfully! Host: ${conn.connection.host} | DB: book-your-day`);
    return true;
  } catch (error: any) {
    // Sanitize error message to ensure credentials in connection string are never logged
    const safeErrorMessage = error?.message ? error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : 'Connection failed';

    if (isProduction) {
      console.error(`❌ [Database] Production MongoDB connection failed: ${safeErrorMessage}`);
    } else {
      console.warn(`⚠️ [Database] Connection warning: ${safeErrorMessage}. Falling back to development in-memory store.`);
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
