import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<boolean> {
  if (!env.MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI not set. Running backend in mock in-memory database mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.log(`ℹ️ MongoDB connection unavailable (${error?.message || 'Connection failed'}). Falling back to mock in-memory database store.`);
    return false;
  }
}
