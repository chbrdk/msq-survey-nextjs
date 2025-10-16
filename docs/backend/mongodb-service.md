# MongoDB Service - Datenbank-Integration

## 🎯 Übersicht

Das MSQ Survey System verwendet **MongoDB** für die Persistierung von Survey-Sessions und Ergebnissen. Der Service bietet eine robuste, skalierbare Datenbank-Integration mit automatischer Verbindungsverwaltung.

## 🏗️ Service-Architektur

### Service Interface

**Datei**: `src/server/services/mongoService.ts`

```typescript
interface MongoService {
  saveSession(userId: string, conversationState: ConversationState): Promise<void>;
  getSession(userId: string): Promise<any>;
  saveSurveyResult(userId: string, collectedData: any): Promise<void>;
  getSurveyResults(limit?: number, skip?: number): Promise<any[]>;
  getSurveyResultById(userId: string): Promise<any>;
}
```

## 🔧 Service Implementation

### Connection Management

```typescript
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
```

### Environment Configuration

```bash
# Development
MONGODB_URI=mongodb://localhost:27018/msq_survey

# Production
MONGODB_URI=mongodb://mongo:27017/msq_survey

# Cloud (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msq_survey?retryWrites=true&w=majority
```

## 📊 Datenmodell

### Session Collection

```typescript
interface SurveySession {
  _id?: ObjectId;
  userId: string;
  conversationState: ConversationState;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionDuration?: number;
  };
}
```

### Results Collection

```typescript
interface SurveyResult {
  _id?: ObjectId;
  userId: string;
  collectedData: Record<string, any>;
  completedAt: Date;
  metadata: {
    userAgent: string;
    duration: number;
    totalSteps: number;
    skippedSteps: number;
  };
  analytics?: {
    timePerStep: Record<string, number>;
    dropOffPoints: string[];
    completionRate: number;
  };
}
```

### Conversation State Interface

```typescript
interface ConversationState {
  currentPhase: string;
  currentStep: string;
  collectedData: Record<string, any>;
  validationHistory: ValidationError[];
  iterationState?: {
    currentPhase: string;
    completedPhases: string[];
  };
}
```

## 🔄 CRUD Operations

### 1. Save Session

```typescript
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
```

**Features:**
- **Upsert Operation**: Erstellt neue Session oder aktualisiert bestehende
- **Timestamp Tracking**: Automatische createdAt/updatedAt Verwaltung
- **Error Handling**: Graceful Fehlerbehandlung bei Verbindungsproblemen

### 2. Get Session

```typescript
export async function getSession(userId: string): Promise<any> {
  const db = await getDb();
  const session = await db.collection('sessions').findOne({ userId });
  
  if (session) {
    console.log(`📂 Session loaded for user: ${userId}`);
  }
  
  return session;
}
```

**Features:**
- **Single Document Query**: Effiziente Abfrage nach userId
- **Null Handling**: Graceful Behandlung von nicht existierenden Sessions
- **Logging**: Debug-Informationen für Session-Loading

### 3. Save Survey Result

```typescript
export async function saveSurveyResult(
  userId: string,
  collectedData: any
): Promise<void> {
  const db = await getDb();
  
  await db.collection('results').insertOne({
    userId,
    collectedData: collectedData,
    completedAt: new Date(),
    metadata: {
      userAgent: req.headers['user-agent'],
      duration: Date.now() - sessionStartTime,
      totalSteps: Object.keys(collectedData).length,
      skippedSteps: 0 // Calculate based on step definitions
    }
  });
  
  console.log(`✅ Survey result saved for user: ${userId}`);
}
```

**Features:**
- **Complete Data Storage**: Speichert alle gesammelten Antworten
- **Metadata Tracking**: Zusätzliche Informationen über die Session
- **Analytics Preparation**: Vorbereitung für spätere Analysen

### 4. Get Survey Results

```typescript
export async function getSurveyResults(
  limit: number = 50,
  skip: number = 0
): Promise<any[]> {
  const db = await getDb();
  
  const results = await db.collection('results')
    .find({})
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  console.log(`📊 Retrieved ${results.length} survey results`);
  return results;
}
```

**Features:**
- **Pagination Support**: Limit und Skip für große Datensätze
- **Sorting**: Neueste Ergebnisse zuerst
- **Performance**: Effiziente Abfrage mit Indizes

### 5. Get Survey Result by ID

```typescript
export async function getSurveyResultById(userId: string): Promise<any> {
  const db = await getDb();
  
  const result = await db.collection('results').findOne({ userId });
  
  if (result) {
    console.log(`📂 Retrieved survey result for user: ${userId}`);
  }
  
  return result;
}
```

## 🔍 Query Operations

### Advanced Queries

```typescript
// Get results by department
export async function getResultsByDepartment(department: string): Promise<any[]> {
  const db = await getDb();
  
  return await db.collection('results')
    .find({ 'collectedData.department': department })
    .sort({ completedAt: -1 })
    .toArray();
}

// Get results by role
export async function getResultsByRole(role: string): Promise<any[]> {
  const db = await getDb();
  
  return await db.collection('results')
    .find({ 'collectedData.role': role })
    .sort({ completedAt: -1 })
    .toArray();
}

// Get results by date range
export async function getResultsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  const db = await getDb();
  
  return await db.collection('results')
    .find({
      completedAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ completedAt: -1 })
    .toArray();
}
```

### Aggregation Queries

```typescript
// Get department statistics
export async function getDepartmentStats(): Promise<any[]> {
  const db = await getDb();
  
  return await db.collection('results').aggregate([
    {
      $group: {
        _id: '$collectedData.department',
        count: { $sum: 1 },
        avgDuration: { $avg: '$metadata.duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]).toArray();
}

// Get role statistics
export async function getRoleStats(): Promise<any[]> {
  const db = await getDb();
  
  return await db.collection('results').aggregate([
    {
      $group: {
        _id: '$collectedData.role',
        count: { $sum: 1 },
        avgDuration: { $avg: '$metadata.duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]).toArray();
}

// Get pain points analysis
export async function getPainPointsAnalysis(): Promise<any[]> {
  const db = await getDb();
  
  return await db.collection('results').aggregate([
    {
      $unwind: '$collectedData.time_wasters'
    },
    {
      $group: {
        _id: '$collectedData.time_wasters',
        count: { $sum: 1 },
        departments: { $addToSet: '$collectedData.department' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]).toArray();
}
```

## 🔧 Error Handling

### Connection Error Handling

```typescript
async function getDb() {
  try {
    const client = await clientPromise;
    return client.db('msq_survey');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('Database connection failed');
  }
}
```

### Operation Error Handling

```typescript
export async function saveSession(
  userId: string,
  conversationState: ConversationState
): Promise<void> {
  try {
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
  } catch (error) {
    console.error('❌ Error saving session:', error);
    throw new Error('Failed to save session');
  }
}
```

### Graceful Degradation

```typescript
// Graceful degradation when MongoDB is unavailable
export async function saveSession(
  userId: string,
  conversationState: ConversationState
): Promise<void> {
  try {
    const db = await getDb();
    // ... save operation
  } catch (error) {
    console.warn('⚠️ MongoDB not available, skipping session save');
    // Continue without saving - survey can still work
  }
}
```

## 📊 Performance Optimization

### Indexing Strategy

```typescript
// Create indexes for better performance
export async function createIndexes(): Promise<void> {
  const db = await getDb();
  
  // Session collection indexes
  await db.collection('sessions').createIndex({ userId: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ updatedAt: -1 });
  
  // Results collection indexes
  await db.collection('results').createIndex({ userId: 1 }, { unique: true });
  await db.collection('results').createIndex({ completedAt: -1 });
  await db.collection('results').createIndex({ 'collectedData.department': 1 });
  await db.collection('results').createIndex({ 'collectedData.role': 1 });
  
  console.log('📊 MongoDB indexes created');
}
```

### Connection Pooling

```typescript
// Configure connection pool
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false
});
```

### Query Optimization

```typescript
// Use projection to limit returned fields
export async function getSessionSummary(userId: string): Promise<any> {
  const db = await getDb();
  
  return await db.collection('sessions')
    .findOne(
      { userId },
      {
        projection: {
          userId: 1,
          currentStep: 1,
          currentPhase: 1,
          updatedAt: 1
        }
      }
    );
}
```

## 🔐 Security Considerations

### Input Validation

```typescript
// Validate user input before database operations
const validateUserId = (userId: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(userId) && userId.length <= 100;
};

const validateConversationState = (state: ConversationState): boolean => {
  return (
    typeof state.currentPhase === 'string' &&
    typeof state.currentStep === 'string' &&
    typeof state.collectedData === 'object'
  );
};
```

### Data Sanitization

```typescript
// Sanitize data before saving
const sanitizeConversationState = (state: ConversationState): ConversationState => {
  return {
    ...state,
    currentPhase: state.currentPhase.trim(),
    currentStep: state.currentStep.trim(),
    collectedData: sanitizeCollectedData(state.collectedData)
  };
};

const sanitizeCollectedData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().substring(0, 1000);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeCollectedData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
```

## 📈 Monitoring & Analytics

### Performance Metrics

```typescript
// Track database performance
const trackDbOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    console.log(`📊 ${operationName} completed in ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow database operation: ${operationName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
};
```

### Health Checks

```typescript
// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}
```

## 🔄 Backup & Recovery

### Backup Strategy

```typescript
// Create backup of survey results
export async function createBackup(): Promise<string> {
  const db = await getDb();
  const results = await db.collection('results').find({}).toArray();
  
  const backup = {
    timestamp: new Date(),
    count: results.length,
    data: results
  };
  
  const backupId = `backup_${Date.now()}`;
  await db.collection('backups').insertOne({
    _id: backupId,
    ...backup
  });
  
  console.log(`💾 Backup created: ${backupId}`);
  return backupId;
}
```

### Data Migration

```typescript
// Migrate data between collections
export async function migrateData(): Promise<void> {
  const db = await getDb();
  
  // Example: Migrate old session format to new format
  await db.collection('sessions').updateMany(
    { version: { $exists: false } },
    {
      $set: {
        version: '2.0',
        migratedAt: new Date()
      }
    }
  );
  
  console.log('🔄 Data migration completed');
}
```

---

**Nächste Schritte**: Siehe [Deployment & Infrastruktur](../deployment/docker-setup.md) für detaillierte Dokumentation des Docker-Setups.