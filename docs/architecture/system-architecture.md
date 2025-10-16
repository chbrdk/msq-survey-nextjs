# System-Architektur

## 🏗️ Gesamtübersicht

Das MSQ Survey Next.js System ist eine **Full-Stack Web-Anwendung** mit AI-Integration für Workflow-Analysen in Marketing-Agenturen.

## 📊 Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React 19 + TypeScript + Tailwind CSS)      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Glass Container │  │ Interactive     │  │ State Management│ │
│  │ (Main UI)       │  │ Components      │  │ (Zustand)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Server-side)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ /api/survey/init│  │ /api/survey/    │  │ /api/health     │ │
│  │ (Initialize)    │  │ process         │  │ (Health Check)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  Step Processor (Master Controller)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Static Handler  │  │ Dynamic Handler │  │ Iterative       │ │
│  │ (Direct Logic)  │  │ (AI-powered)    │  │ Handler         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ OpenAI Service  │  │ MongoDB Service │  │ Validation      │ │
│  │ (GPT-4 AI)      │  │ (Data Storage)  │  │ Service         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Docker          │  │ Traefik Proxy   │  │ Let's Encrypt   │ │
│  │ (Containerization)│  │ (Load Balancer) │  │ (SSL Certs)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. Survey Initialization
```
Client → /api/survey/init → Step Processor → Static Handler → Response
```

### 2. User Response Processing
```
Client → /api/survey/process → Step Processor → Handler Selection → AI/Static → Response
```

### 3. AI-Powered Steps
```
Client → /api/survey/process → Dynamic Handler → OpenAI Service → Response
```

## 🧩 Komponenten-Architektur

### Frontend-Komponenten
```
GlassContainer (Root)
├── GlassHeader (Navigation)
├── GlassCenteredView (Main Content)
│   ├── InteractiveComponent (Dynamic UI)
│   └── MessageList (Chat History)
├── HistoryPanel (Sidebar)
├── BackButton (Navigation)
└── VoiceIndicator (Debug Mode)
```

### Backend-Handler
```
StepProcessor (Master Switch)
├── StaticHandler (11 Steps)
├── DynamicHandler (5 AI Steps)
│   ├── RoleHandler
│   ├── ToolsHandler
│   ├── PainPointsHandler
│   ├── AutomationHandler
│   └── RecapHandler
└── IterativeHandler (Phase-based)
    ├── DeepDiveHandler
    ├── MapToolsHandler
    └── PhaseAllocationHandler
```

## 📊 Datenmodell

### Conversation State
```typescript
interface ConversationState {
  currentPhase: string;        // 'intro' | 'phase1' | 'phase2' | ...
  currentStep: string;         // 'greeting_agency' | 'role' | ...
  collectedData: Record<string, any>;  // User responses
  validationHistory: any[];    // Validation errors
  iterationState?: {           // For iterative steps
    currentPhase: string;
    completedPhases: string[];
  };
}
```

### Step Definition
```typescript
interface StepDefinition {
  type: 'static' | 'dynamic' | 'iterative';
  handler?: string;            // Handler function name
  question?: string;           // Display question
  component?: ComponentConfig; // UI component
  nextStep: string;           // Next step ID
  iterateOver?: string;       // For iterative steps
}
```

## 🔐 Sicherheits-Architektur

### API Security
- **Input Validation**: Zod schemas für alle Eingaben
- **Error Handling**: Graceful error responses
- **Rate Limiting**: Via Traefik (optional)
- **CORS**: Konfiguriert für Production

### Data Security
- **MongoDB**: Authentifizierte Verbindungen
- **API Keys**: Nur im Backend, nie im Frontend
- **Session Management**: UUID-basierte User IDs
- **Data Encryption**: HTTPS/TLS für alle Verbindungen

## 🚀 Performance-Architektur

### Frontend Optimierung
- **Next.js 15**: App Router mit Server Components
- **Code Splitting**: Automatisch via Next.js
- **Image Optimization**: Next.js Image Component
- **Caching**: Browser + CDN Caching

### Backend Optimierung
- **MongoDB Indexing**: Optimierte Datenbankabfragen
- **OpenAI Caching**: Response Caching (optional)
- **Connection Pooling**: MongoDB Connection Pool
- **Error Recovery**: Graceful degradation

## 🔄 State Management

### Client State (Zustand)
```typescript
interface ChatState {
  messages: Message[];           // Chat history
  currentComponent: Component;   // Active UI component
  isLoading: boolean;           // Loading state
  conversationState: ConversationState; // Server state
  progress: number;             // Survey progress
  isComplete: boolean;          // Completion status
}
```

### Server State (MongoDB)
```typescript
interface SurveySession {
  userId: string;               // Unique user ID
  conversationState: ConversationState; // Current state
  createdAt: Date;             // Session start
  updatedAt: Date;             // Last activity
}

interface SurveyResult {
  userId: string;               // User ID
  collectedData: Record<string, any>; // All responses
  completedAt: Date;           // Completion timestamp
  metadata: {                  // Additional data
    userAgent: string;
    duration: number;
  };
}
```

## 🌐 Deployment-Architektur

### Production Setup
```
Internet → Traefik Proxy → Docker Container → Next.js App
                ↓
         Let's Encrypt SSL
                ↓
         MongoDB Container
```

### Development Setup
```
Local Machine → Next.js Dev Server → MongoDB (Docker)
```

## 📈 Monitoring & Logging

### Application Logs
- **Console Logging**: Strukturierte Logs mit Levels
- **Error Tracking**: Try-catch mit detaillierten Fehlermeldungen
- **Performance Metrics**: Response time tracking

### Infrastructure Monitoring
- **Docker Health Checks**: Container status monitoring
- **MongoDB Health**: Database connection monitoring
- **Traefik Metrics**: Request/response monitoring

## 🔧 Konfiguration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-...           # OpenAI API Key
MONGODB_URI=mongodb://...       # MongoDB Connection
NEXT_PUBLIC_API_URL=https://... # Public API URL

# Optional
NODE_ENV=production             # Environment
PORT=3000                      # Server Port
```

### Docker Configuration
- **Multi-stage Build**: Optimierte Image-Größe
- **Health Checks**: Container health monitoring
- **Volume Mounts**: Persistent data storage
- **Network Isolation**: Secure container communication

## 🚀 Skalierbarkeit

### Horizontal Scaling
- **Stateless Design**: Keine Server-side Sessions
- **Load Balancing**: Via Traefik
- **Database Scaling**: MongoDB Replica Sets (optional)

### Vertical Scaling
- **Resource Limits**: Docker memory/CPU limits
- **Caching**: Response caching strategies
- **Database Optimization**: Query optimization

## 🔄 Backup & Recovery

### Data Backup
- **MongoDB Dumps**: Regelmäßige Datenbank-Backups
- **Volume Snapshots**: Docker volume backups
- **Configuration Backup**: Environment + Docker configs

### Disaster Recovery
- **Container Restart**: Automatic container restart
- **Database Recovery**: MongoDB restore procedures
- **Configuration Recovery**: Environment restoration

---

**Nächste Schritte**: Siehe [Datenfluss](data-flow.md) für detaillierte Request/Response-Flows.