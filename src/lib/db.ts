import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

function checkRequiredEnvVars() {
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'AUTHORIZED_EMAIL',
    ];

    const missingVars = requiredVars.filter(v => !process.env[v] || process.env[v]?.startsWith('YOUR_'));
    
    if (missingVars.length > 0) {
        let message = `The following required environment variables are missing or are using placeholder values in your .env.local file:\n`;
        message += `\n${missingVars.join('\n')}\n`;
        message += `\nPlease create a .env.local file, copy the contents from .env.local.example, and fill in the correct values.`;
        throw new Error(message);
    }
}

async function connectToDatabase() {
  // Check for all required env vars.
  // This allows the app to start and show a helpful error message on the dashboard
  // instead of crashing on boot if the variable is not set.
  checkRequiredEnvVars();
  
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    if (e.name === 'MongooseServerSelectionError') {
        throw new Error('MongoDB connection failed. Please ensure your MongoDB server is running and the MONGODB_URI in `.env.local` is correct. The specific error was: ' + e.message);
    }
    throw e;
  }
  
  return cached.conn;
}

export default connectToDatabase;
