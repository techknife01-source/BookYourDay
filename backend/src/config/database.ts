import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<boolean> {
  const uri = env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<USE_THE_MONGODB_ATLAS_URI')) {
    console.log('ℹ️ [Database] MONGODB_URI not configured. Running in fallback mode with mock data store.');
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
    console.warn(`⚠️ [Database] Connection warning: ${safeErrorMessage}. Falling back to in-memory store.`);
    return false;
  }
}

export function getDatabaseStatus(): 'connected' | 'disconnected' | 'connecting' {
  const state = mongoose.connection.readyState;
  if (state === 1) return 'connected';
  if (state === 2) return 'connecting';
  return 'disconnected';
}
