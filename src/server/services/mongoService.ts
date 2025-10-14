// MongoDB Service for Session & Result Persistence
import { MongoClient } from 'mongodb';
import { ConversationState } from '../types/survey.types';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

// In development, use a global variable to preserve the client across hot reloads
if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

async function getDb() {
  const client = await clientPromise;
  return client.db('msq_survey');
}

export async function saveSession(
  userId: string,
  conversationState: ConversationState
): Promise<void> {
  const db = await getDb();
  
  await db.collection('sessions').updateOne(
    { userId },
    {
      $set: {
        conversationState,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
  
  console.log(`💾 Session saved for user: ${userId}`);
}

export async function getSession(userId: string): Promise<any> {
  const db = await getDb();
  const session = await db.collection('sessions').findOne({ userId });
  
  if (session) {
    console.log(`📂 Session loaded for user: ${userId}`);
  }
  
  return session;
}

export async function saveSurveyResult(
  userId: string,
  collectedData: any
): Promise<void> {
  const db = await getDb();
  
  await db.collection('results').insertOne({
    userId,
    data: collectedData,
    completedAt: new Date()
  });
  
  console.log(`✅ Survey result saved for user: ${userId}`);
}

