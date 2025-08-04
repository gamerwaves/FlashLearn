import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://dwaitpandhi:69duAjl4j6r8BAnl@cluster0.z80toii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true';
const DB_NAME = 'flashlearn';

// Create a MongoDB client with proper configuration
  /**
   * Creates a new instance of MongoClient with the configuration for connecting to MongoDB
   * @param {string} MONGODB_URI - The connection string for the MongoDB server
   * @param {Object} [options] - Optional configuration for the MongoClient
   * @param {boolean} [options.tls=true] - Whether to use TLS (SSL) when connecting
   * @param {boolean} [options.tlsAllowInvalidCertificates=true] - Whether to allow invalid certificates when connecting with TLS
   * @param {number} [options.serverSelectionTimeoutMS=5000] - The timeout in milliseconds for selecting a server for the initial connection
   * @param {number} [options.connectTimeoutMS=10000] - The timeout in milliseconds for establishing a connection to a server
   * @param {number} [options.socketTimeoutMS=45000] - The timeout in milliseconds for socket operations
   */
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
