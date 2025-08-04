import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MongoClient } from 'mongodb';

// Environment configuration - using import.meta.env in SvelteKit
const MONGODB_URI = 'mongodb+srv://dwaitpandhi:69duAjl4j6r8BAnl@cluster0.z80toii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true';
const DB_NAME = 'flashlearn';

// Type for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

// Type for our response data
interface TestResponse {
  success: boolean;
  message: string;
  details?: {
    mongodb?: string;
    collections?: string[];
    connectionDetails?: Record<string, unknown>;
  };
  error?: {
    code?: string | number;
    message: string;
    stack?: string;
  };
}

export const GET: RequestHandler = async () => {
  let client: MongoClient | null = null;
  
  try {
    // Validate MongoDB URI
    if (!MONGODB_URI || MONGODB_URI === 'your-mongodb-uri') {
      throw new Error('MongoDB connection string is not configured');
    }

    // Configure MongoDB client with connection options
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,  // 5 seconds timeout for server selection
      connectTimeoutMS: 10000,         // 10 seconds timeout for initial connection
      socketTimeoutMS: 45000,          // 45 seconds timeout for socket operations
      retryWrites: true,
      retryReads: true,
      // @ts-ignore - These options are valid but not in the type definition
      useNewUrlParser: true,
      // @ts-ignore
      useUnifiedTopology: true
    });

    // Test MongoDB connection
    await client.connect();
    
    // Verify connection is established
    await client.db('admin').command({ ping: 1 });
    
    // Test database access
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    
    // Get server status for additional diagnostics
    const serverStatus = await db.command({ serverStatus: 1 });
    
    const response: TestResponse = {
      success: true,
      message: 'Server is operational',
      details: {
        mongodb: 'Connected successfully',
        collections: collections.map(c => c.name),
        connectionDetails: {
          host: client.options.srvHost || 'localhost',
          database: DB_NAME,
          serverVersion: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        }
      }
    };
    
    return json(response);
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    
    const errorResponse: TestResponse = {
      success: false,
      message: 'Server test failed',
      error: {
        message: 'An unexpected error occurred'
      }
    };
    
    let statusCode = 500;
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      errorResponse.error = errorResponse.error || { message: 'Unknown error' };
      errorResponse.error.message = error.message;
      
      // Add stack trace in development
      if (import.meta.env.DEV) {
        errorResponse.error.stack = error.stack;
      }
      
      // Handle MongoDB specific errors
      if ('code' in error && typeof error.code === 'number') {
        errorResponse.error.code = error.code;
        
        // Authentication errors
        if (error.code === 18) {
          errorResponse.error.message = 'Authentication failed - invalid credentials';
          statusCode = 401;
        }
        // Network/connection errors
        else if ([6, 7, 89, 9001].includes(error.code)) {
          errorResponse.error.message = 'Could not connect to MongoDB server';
          statusCode = 503;
        }
      }
    }
    
    return json(errorResponse, { status: statusCode });
    
  } finally {
    // Ensure the client is properly closed
    try {
      if (client) {
        await client.close().catch(closeError => {
          console.error('Error closing MongoDB connection:', closeError);
        });
      }
    } catch (closeError) {
      console.error('Error during MongoDB connection cleanup:', closeError);
    }
  }
};