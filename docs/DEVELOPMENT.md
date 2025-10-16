# Development Guide - Entwicklungsanleitung

## 🎯 Übersicht

Dieses Dokument bietet eine vollständige Anleitung für die Entwicklung am MSQ Survey Next.js Projekt.

## 🚀 Quick Start

### 1. Repository klonen
```bash
git clone <repository-url>
cd msq-survey-nextjs
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment konfigurieren
```bash
cp .env.example .env.local
# Bearbeite .env.local mit deinen Werten
```

### 4. MongoDB starten
```bash
docker-compose up mongo -d
```

### 5. Development Server starten
```bash
npm run dev
```

## 🔧 Development Setup

### Voraussetzungen

- **Node.js**: >= 18
- **npm**: >= 8
- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=mongodb://localhost:27018/msq_survey
NEXT_PUBLIC_API_URL=http://localhost:7016
NODE_ENV=development
```

### Development Commands

```bash
# Development Server
npm run dev

# Build für Production
npm run build

# Start Production Server
npm start

# Type Checking
npm run type-check

# Linting
npm run lint
```

## 🏗️ Projekt-Struktur

```
msq-survey-nextjs/
├── docs/                    # Vollständige Dokumentation
│   ├── architecture/        # System-Architektur
│   ├── components/          # Frontend-Komponenten
│   ├── backend/            # Backend-Services
│   ├── deployment/         # Deployment & Infrastruktur
│   └── survey/             # Survey-Logik
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── entries/        # Dashboard
│   │   └── page.tsx        # Hauptseite
│   ├── components/         # React Komponenten
│   │   ├── glass/          # Glassmorphism UI
│   │   ├── interactive/    # Umfrage-Komponenten
│   │   └── layout/         # Layout-Komponenten
│   ├── server/             # Backend-Logik
│   │   ├── handlers/       # API-Handler
│   │   ├── services/       # Services (OpenAI, MongoDB)
│   │   ├── config/         # Konfiguration
│   │   └── types/          # TypeScript Types
│   ├── stores/             # State Management
│   ├── hooks/              # Custom Hooks
│   ├── services/           # Frontend Services
│   ├── types/              # TypeScript Types
│   └── utils/              # Utility Functions
├── public/                 # Statische Assets
├── docker-compose.yml      # Development Docker
├── docker-compose.prod.yml # Production Docker
├── Dockerfile             # Container Definition
└── package.json           # Dependencies
```

## 🧩 Komponenten-Entwicklung

### Glassmorphism Design System

Alle Komponenten folgen dem Glassmorphism Design System:

```typescript
// Beispiel: Neue Komponente erstellen
export const MyGlassComponent = ({ data }: MyComponentProps) => {
  return (
    <div className="glass-card glass-gradient-border">
      {/* Komponenten-Inhalt */}
    </div>
  );
};
```

### Component Naming Convention

- **Prefix**: Alle Komponenten beginnen mit `udg-glass-`
- **PascalCase**: Komponenten-Namen in PascalCase
- **Descriptive**: Namen beschreiben die Funktionalität

```typescript
// ✅ Korrekt
export const UdgGlassButtonGroup = ({ data }: ButtonGroupProps) => { ... }

// ❌ Falsch
export const ButtonGroup = ({ data }: ButtonGroupProps) => { ... }
```

### Component Props Interface

```typescript
// Immer Props-Interface definieren
interface MyComponentProps {
  data: MyComponentData;
  onAction?: (value: any) => void;
  isLoading?: boolean;
}

// Komponente mit Props
export const MyComponent = ({ data, onAction, isLoading = false }: MyComponentProps) => {
  // Komponenten-Logik
};
```

## 🔧 Backend-Entwicklung

### Handler-Pattern

Neue Handler folgen dem etablierten Pattern:

```typescript
// src/server/handlers/myHandler.ts
export async function handleMyStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  // 1. Check if user already answered
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    return {
      assistantMessage: "Got it. Moving on...",
      skipGPT: true,
      nextStep: 'next_step',
      conversationState: {
        ...conversationState,
        currentStep: 'next_step',
        collectedData: {
          ...conversationState.collectedData,
          my_step: userResponse
        }
      }
    };
  }

  // 2. Call AI if needed
  const gptResponse = await callOpenAI(systemPrompt, userPrompt);
  
  // 3. Return response
  return {
    assistantMessage: gptResponse.assistantMessage,
    component: gptResponse.component,
    nextStep: gptResponse.nextStep,
    conversationState: conversationState
  };
}
```

### AI-Integration

```typescript
// System Prompt Template
const systemPrompt = `You are a workflow interviewer for marketing agencies.

USER CONTEXT:
- Role: "${role}"
- Department: "${department}"

TASK: [Beschreibung der Aufgabe]

EXAMPLES by role:
- Designer: ["Example 1", "Example 2", "Other"]
- Developer: ["Example 1", "Example 2", "Other"]

IMPORTANT:
- [Wichtige Hinweise]
- [Formatierungsregeln]

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Question text",
  "component": {
    "type": "component-type",
    "props": {
      // Component props
    }
  },
  "nextStep": "next_step_id"
}`;
```

### Database Integration

```typescript
// MongoDB Service verwenden
import { saveSession, saveSurveyResult } from '@/server/services/mongoService';

// Session speichern
await saveSession(userId, conversationState);

// Ergebnis speichern
await saveSurveyResult(userId, collectedData);
```

## 🎨 UI/UX-Entwicklung

### Design Tokens

```css
/* Glassmorphism-Effekte */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.glass-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}
```

### Animation Patterns

```typescript
// Framer Motion Animation
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 1.1, y: -20 }}
  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
>
  {/* Komponenten-Inhalt */}
</motion.div>
```

### Responsive Design

```typescript
// Mobile-First Approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive Grid */}
</div>
```

## 🧪 Testing

### Unit Tests

```typescript
// Beispiel: Handler Test
import { handleMyStep } from '@/server/handlers/myHandler';

describe('MyHandler', () => {
  it('should process user response correctly', async () => {
    const userResponse = 'test response';
    const conversationState = {
      currentPhase: 'test',
      currentStep: 'my_step',
      collectedData: {}
    };

    const result = await handleMyStep(userResponse, conversationState);
    
    expect(result.assistantMessage).toBeDefined();
    expect(result.nextStep).toBe('next_step');
  });
});
```

### Integration Tests

```typescript
// Beispiel: API Route Test
import { POST } from '@/app/api/survey/process/route';

describe('/api/survey/process', () => {
  it('should process survey step', async () => {
    const request = new Request('http://localhost:3000/api/survey/process', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'test-user',
        userResponse: 'test',
        conversationState: {
          currentPhase: 'test',
          currentStep: 'test_step',
          collectedData: {}
        }
      })
    });

    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.assistantMessage).toBeDefined();
  });
});
```

## 🔍 Debugging

### Development Tools

```bash
# Container-Logs anzeigen
docker-compose logs -f app
docker-compose logs -f mongo

# Container-Shell öffnen
docker exec -it msq-survey-nextjs-app sh
docker exec -it msq-survey-nextjs-mongo mongosh

# Container-Status prüfen
docker-compose ps
```

### Debug-Modus

```bash
# Debug-Modus aktivieren
http://localhost:7016?debug=true

# Voice-Features aktivieren
http://localhost:7016?debug=true&voice=true
```

### Logging

```typescript
// Strukturiertes Logging
console.log('📊 Processing step:', stepId, { userResponse });
console.log('🤖 OpenAI response:', gptResponse);
console.log('💾 Session saved for user:', userId);
```

## 📊 Performance-Optimierung

### Bundle-Size-Optimierung

```typescript
// Lazy Loading für große Komponenten
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Dynamic Imports für Services
const { callOpenAI } = await import('@/server/services/openaiService');
```

### Database-Optimierung

```typescript
// Indexes für bessere Performance
await db.collection('sessions').createIndex({ userId: 1 }, { unique: true });
await db.collection('results').createIndex({ completedAt: -1 });
```

### Caching

```typescript
// Response Caching
const cacheKey = `ai_response_${stepId}_${JSON.stringify(userResponse)}`;
const cachedResponse = cache.get(cacheKey);

if (cachedResponse) {
  return cachedResponse;
}
```

## 🔐 Sicherheit

### Input Validation

```typescript
// Zod Schema für Input-Validation
import { z } from 'zod';

const surveyResponseSchema = z.object({
  userId: z.string().min(1).max(100),
  userResponse: z.any(),
  conversationState: z.object({
    currentPhase: z.string(),
    currentStep: z.string(),
    collectedData: z.record(z.any())
  })
});
```

### API Security

```typescript
// Rate Limiting
const rateLimit = new Map();

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const userRequests = rateLimit.get(userId) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < 60000);
  
  if (recentRequests.length >= 10) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimit.set(userId, recentRequests);
};
```

## 🚀 Deployment

### Development Deployment

```bash
# Lokale Entwicklung
npm run dev

# Docker Development
docker-compose up -d
```

### Production Deployment

```bash
# Production Build
npm run build

# Docker Production
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📚 Dokumentation

### Code-Dokumentation

```typescript
/**
 * Handles user response for a specific survey step
 * @param userResponse - The user's response to the current step
 * @param conversationState - Current conversation state
 * @returns Promise<StepResponse> - Next step configuration
 */
export async function handleMyStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  // Implementation
}
```

### README-Updates

```markdown
## Neue Features

### Feature Name
- Beschreibung der neuen Funktionalität
- Verwendung und Beispiele
- Breaking Changes (falls vorhanden)
```

## 🤝 Contributing

### Git Workflow

```bash
# Feature Branch erstellen
git checkout -b feature/new-feature

# Commits erstellen
git add .
git commit -m "feat: add new feature"

# Push und Pull Request
git push origin feature/new-feature
```

### Code Review

- [ ] Code folgt den etablierten Patterns
- [ ] Tests sind vorhanden und bestehen
- [ ] Dokumentation ist aktualisiert
- [ ] Performance-Impact ist berücksichtigt
- [ ] Sicherheitsaspekte sind geprüft

---

**Weitere Informationen**: Siehe die vollständige Dokumentation in `/docs` für detaillierte Anleitungen zu allen Aspekten des Projekts.