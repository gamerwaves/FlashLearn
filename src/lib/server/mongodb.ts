import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://dwaitpandhi:69duAjl4j6r8BAnl@cluster0.z80toii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'flashlearn';

// Create a MongoDB client with proper configuration
const client = new MongoClient(MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000
});

// Connect to the MongoDB server
async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    return {
      db: client.db(DB_NAME),
      client
    };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Close the MongoDB connection
async function closeConnection() {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
}

export { connectToDatabase, closeConnection };
