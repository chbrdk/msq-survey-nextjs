# MSQ Survey - Next.js Version

Modernisierte Version des MSQ Survey Tools - **ohne n8n**, direkt mit Next.js API Routes, MongoDB und OpenAI Integration.

## 🎯 Was ist neu?

Diese Version ersetzt die n8n-basierte Architektur durch:
- ✅ **Next.js API Routes** statt n8n Webhooks
- ✅ **MongoDB** für Session & Result Persistence
- ✅ **Direkte OpenAI Integration** im Backend
- ✅ **TypeScript** durchgehend (Frontend + Backend)
- ✅ **Standalone Deployment** - kein n8n Server nötig

## 🚀 Quick Start

### Voraussetzungen

- Node.js >= 18
- Docker & Docker Compose (optional)
- OpenAI API Key

### 1. Installation

```bash
cd /Users/m4mini/Desktop/DOCKER-local/msq-survey-nextjs
npm install
```

### 2. Environment Setup

Erstelle `.env.local` basierend auf `ENV-SETUP.md`:

```bash
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=mongodb://localhost:27018/msq_survey
NEXT_PUBLIC_API_URL=http://localhost:7016
NODE_ENV=development
```

### 3. MongoDB starten

```bash
# Mit Docker Compose
docker-compose up mongo -d

# Oder MongoDB lokal installieren
brew install mongodb-community@7
brew services start mongodb-community
```

### 4. Development Server

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Komplettes Setup mit Docker Compose

```bash
# Build & Start
docker-compose up -d

# Logs anzeigen
docker-compose logs -f app

# Stoppen
docker-compose down
```

App läuft auf: **http://localhost:7016**
MongoDB läuft auf: **Port 27018**

## 📁 Projekt-Struktur

```
msq-survey-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── survey/
│   │   │   │   ├── init/       # Initialize survey
│   │   │   │   └── process/    # Process user responses
│   │   │   └── health/         # Health check
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── server/                 # Backend Logik
│   │   ├── handlers/           # 6 Handler (static + 5 dynamic)
│   │   ├── services/           # OpenAI, MongoDB, StepProcessor
│   │   ├── config/             # StepDefinitions, Manifest
│   │   └── types/
│   ├── components/             # React Components (kopiert von alt)
│   ├── stores/                 # Zustand State Management
│   ├── services/               # API Service
│   ├── types/                  # TypeScript Types
│   ├── utils/                  # Helper Functions
│   └── lib/                    # Utilities
├── public/
├── docker-compose.yml
├── Dockerfile
├── next.config.js
└── package.json
```

## 🔧 Architektur

### API Routes

**POST /api/survey/init**
- Initialisiert neue Survey-Session
- Generiert User ID
- Speichert in MongoDB
- Returns: First question + component

**POST /api/survey/process**
- Verarbeitet User Response
- Routing zu Static/Dynamic Handlers
- OpenAI Calls für Dynamic Steps
- Speichert Progress in MongoDB

**GET /api/health**
- Health Check Endpoint

### Step Flow

16 Steps total:
- **11 Static Steps**: Direkte Responses ohne AI
- **5 Dynamic Steps**: AI-powered (OpenAI GPT-4)
  - Role suggestions (dept-based)
  - Tools suggestions (role-based)
  - Pain points (role-based)
  - Automation ideas
  - Recap summary

### Handler System

```
Master Switch (stepProcessor.ts)
    ↓
Static Handler → Direkte Antwort
    OR
Dynamic Handler → OpenAI Call → Parsed Response
```

## 🔄 Migration von Alt zu Neu

### Unterschiede

| Alt (Vite + n8n) | Neu (Next.js) |
|------------------|---------------|
| Vite Frontend | Next.js App Router |
| n8n Webhooks | Next.js API Routes |
| n8n Workflows | TypeScript Handlers |
| LocalStorage only | MongoDB + LocalStorage |
| Webhook URLs | API Routes |

### Vorteile

1. **Weniger Komplexität**: Kein n8n-Layer
2. **Bessere DX**: Full-Stack TypeScript
3. **Performance**: Direkter API Call
4. **Skalierbar**: MongoDB Persistence
5. **Deployment**: Standalone Container

## 📊 Port Mapping

- **MSQ-SURVEY (alt)**: Port 7015
- **MSQ-SURVEY-NEXTJS (neu)**: Port 7016
- **MongoDB**: Port 27018

## 🧪 Testing

### Health Check

```bash
curl http://localhost:7016/api/health
```

### Init Survey

```bash
curl -X POST http://localhost:7016/api/survey/init \
  -H "Content-Type: application/json"
```

### Process Response

```bash
curl -X POST http://localhost:7016/api/survey/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "...",
    "userResponse": "UDG",
    "conversationState": {...}
  }'
```

## 📝 Environment Variables

Siehe `ENV-SETUP.md` für Details.

Erforderlich:
- `OPENAI_API_KEY` - OpenAI API Key
- `MONGODB_URI` - MongoDB Connection String
- `NEXT_PUBLIC_API_URL` - Public API URL

## 🔐 Security

- ✅ API Keys nur im Backend
- ✅ MongoDB Authentifizierung
- ✅ CORS konfiguriert
- ✅ Input Validation
- ✅ Error Handling

## 📚 Weitere Dokumentation

- [ENV-SETUP.md](./ENV-SETUP.md) - Environment Variables
- [Migration Plan](../n8n-zu-next-js-migration.plan.md) - Vollständiger Migrationsplan

## 🆘 Troubleshooting

### MongoDB Connection Error

```bash
# Prüfe ob MongoDB läuft
docker ps | grep mongo

# Starte MongoDB
docker-compose up mongo -d
```

### OpenAI API Error

Prüfe:
1. API Key in `.env.local` gesetzt?
2. API Credits vorhanden?
3. Korrekte Permissions?

### Build Errors

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# TypeScript Errors prüfen
npm run build
```

## 🚢 Production Deployment

1. Update `.env.local` mit Production-Werten
2. Build: `npm run build`
3. Deploy: `docker-compose up -d`

Oder manuell:
```bash
npm run build
npm start
```

## 👨‍💻 Development

Entwickelt als separates, standalone Tool parallel zum alten MSQ-SURVEY.

- Kein Breaking Change am alten Tool
- Parallel Testing möglich
- Schrittweise Migration

---

**Built with ❤️ using Next.js, TypeScript, MongoDB & OpenAI**
