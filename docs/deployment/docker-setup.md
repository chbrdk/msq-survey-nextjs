# Docker Setup - Container-Konfiguration

## 🎯 Übersicht

Das MSQ Survey System verwendet **Docker** und **Docker Compose** für Containerisierung und Orchestrierung. Das Setup umfasst zwei Container: Next.js App und MongoDB.

## 🐳 Container-Architektur

### Container-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Host                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Next.js App     │  │ MongoDB         │  │ Traefik Proxy   │ │
│  │ (Port 3000)     │  │ (Port 27017)    │  │ (Port 80/443)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Container-Details

| Container | Image | Port | Beschreibung |
|-----------|-------|------|--------------|
| `msq-survey-nextjs-app` | Custom Next.js | 3000 | Hauptanwendung |
| `msq-survey-nextjs-mongo` | mongo:7 | 27017 | Datenbank |
| `traefik` | traefik:latest | 80/443 | Reverse Proxy |

## 📁 Docker-Konfiguration

### 1. Dockerfile

**Datei**: `Dockerfile`

```dockerfile
# Multi-stage Dockerfile for Next.js

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build arguments for Next.js public env vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Features:**
- **Multi-stage Build**: Optimierte Image-Größe
- **Non-root User**: Sicherheit durch eingeschränkte Berechtigungen
- **Standalone Build**: Optimierte Next.js-Produktions-Builds
- **Build Arguments**: Konfigurierbare Umgebungsvariablen

### 2. Docker Compose (Development)

**Datei**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: msq-survey-nextjs-mongo
    restart: unless-stopped
    ports:
      - "27018:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: msq_survey
    networks:
      - survey-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/msq_survey --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: msq-survey-nextjs-app
    restart: unless-stopped
    ports:
      - "7016:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/msq_survey
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_API_URL=http://localhost:7016
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - survey-network
      - proxy-network

volumes:
  mongo_data:
    driver: local

networks:
  survey-network:
    driver: bridge
  proxy-network:
    external: true
```

### 3. Docker Compose (Production)

**Datei**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: msq-survey-nextjs-mongo
    restart: unless-stopped
    ports:
      - "27018:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: msq_survey
    networks:
      - survey-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/msq_survey --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      args:
        - NEXT_PUBLIC_API_URL=https://survey.plygrnd.tech
    container_name: msq-survey-nextjs-app
    restart: unless-stopped
    ports:
      - "7016:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/msq_survey
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_API_URL=https://survey.plygrnd.tech
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - survey-network
      - proxy-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.msq-survey-nextjs.rule=Host(`survey.plygrnd.tech`)"
      - "traefik.http.routers.msq-survey-nextjs.entrypoints=websecure"
      - "traefik.http.routers.msq-survey-nextjs.tls.certresolver=letsencrypt"
      - "traefik.http.services.msq-survey-nextjs.loadbalancer.server.port=3000"
      - "traefik.docker.network=proxy-network"

volumes:
  mongo_data:
    driver: local

networks:
  survey-network:
    driver: bridge
  proxy-network:
    external: true
```

## 🔧 Container-Konfiguration

### Next.js App Container

#### Build-Konfiguration
```yaml
app:
  build:
    context: .
    args:
      - NEXT_PUBLIC_API_URL=https://survey.plygrnd.tech
```

#### Environment Variables
```yaml
environment:
  - NODE_ENV=production
  - MONGODB_URI=mongodb://mongo:27017/msq_survey
  - OPENAI_API_KEY=${OPENAI_API_KEY}
  - NEXT_PUBLIC_API_URL=https://survey.plygrnd.tech
```

#### Port Mapping
```yaml
ports:
  - "7016:3000"  # External:Internal
```

#### Health Check
```yaml
depends_on:
  mongo:
    condition: service_healthy
```

### MongoDB Container

#### Image & Version
```yaml
mongo:
  image: mongo:7
  container_name: msq-survey-nextjs-mongo
```

#### Port Mapping
```yaml
ports:
  - "27018:27017"  # External:Internal
```

#### Volume Mounting
```yaml
volumes:
  - mongo_data:/data/db
```

#### Health Check
```yaml
healthcheck:
  test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/msq_survey --quiet
  interval: 10s
  timeout: 5s
  retries: 5
```

## 🌐 Netzwerk-Konfiguration

### Network-Topologie

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Networks                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ survey-network  │  │ proxy-network   │  │ bridge (default)│ │
│  │ (Internal)      │  │ (External)      │  │ (Host)          │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Network-Definitionen

#### Survey Network (Internal)
```yaml
networks:
  survey-network:
    driver: bridge
```

**Verwendung:**
- App ↔ MongoDB Kommunikation
- Interne Container-Kommunikation
- Isolierte Netzwerk-Umgebung

#### Proxy Network (External)
```yaml
networks:
  proxy-network:
    external: true
```

**Verwendung:**
- Traefik ↔ App Kommunikation
- Externe Reverse-Proxy-Integration
- SSL/TLS-Terminierung

### Container-Netzwerk-Zugehörigkeit

```yaml
# App Container
networks:
  - survey-network    # MongoDB access
  - proxy-network     # Traefik access

# MongoDB Container
networks:
  - survey-network    # App access only
```

## 💾 Volume-Management

### Volume-Definitionen

```yaml
volumes:
  mongo_data:
    driver: local
```

### Volume-Mounting

```yaml
# MongoDB Data Volume
volumes:
  - mongo_data:/data/db
```

### Volume-Backup

```bash
# Backup MongoDB data
docker run --rm -v msq-survey-nextjs_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_backup.tar.gz -C /data .

# Restore MongoDB data
docker run --rm -v msq-survey-nextjs_mongo_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongo_backup.tar.gz -C /data
```

## 🔐 Sicherheits-Konfiguration

### Container-Sicherheit

#### Non-root User
```dockerfile
# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Switch to non-root user
USER nextjs
```

#### Read-only Filesystem
```yaml
# Optional: Read-only root filesystem
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
  - /var/run
```

#### Resource Limits
```yaml
# Resource limits
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### Network-Sicherheit

#### Firewall-Regeln
```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 7016/tcp  # Development only
ufw allow 27018/tcp # Development only
```

#### Container-Isolation
```yaml
# Isolate containers
security_opt:
  - no-new-privileges:true
  - seccomp:unconfined
```

## 📊 Monitoring & Logging

### Container-Logging

```yaml
# Logging configuration
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Health Checks

```yaml
# App health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Monitoring-Integration

```yaml
# Prometheus metrics
labels:
  - "prometheus.io/scrape=true"
  - "prometheus.io/port=3000"
  - "prometheus.io/path=/metrics"
```

## 🚀 Deployment-Scripts

### Development Setup

```bash
#!/bin/bash
# dev-setup.sh

echo "🚀 Setting up MSQ Survey Development Environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  cat > .env.local << EOF
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=mongodb://localhost:27018/msq_survey
NEXT_PUBLIC_API_URL=http://localhost:7016
NODE_ENV=development
EOF
fi

# Start MongoDB
echo "🐳 Starting MongoDB..."
docker-compose up mongo -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Start development server
echo "🚀 Starting development server..."
npm run dev
```

### Production Deployment

```bash
#!/bin/bash
# deploy-prod.sh

echo "🚀 Deploying MSQ Survey to Production..."

# Set environment variables
export OPENAI_API_KEY="your-production-openai-key"
export NEXT_PUBLIC_API_URL="https://survey.plygrnd.tech"

# Build and start containers
echo "🐳 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 30

# Check container health
echo "🔍 Checking container health..."
docker-compose -f docker-compose.prod.yml ps

# Test application
echo "🧪 Testing application..."
curl -f http://localhost:7016/api/health || echo "❌ Health check failed"

echo "✅ Deployment complete!"
echo "🌐 Application: https://survey.plygrnd.tech"
```

### Backup Script

```bash
#!/bin/bash
# backup.sh

echo "💾 Creating backup..."

# Create backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup MongoDB
echo "📊 Backing up MongoDB..."
docker exec msq-survey-nextjs-mongo mongodump --out /tmp/backup
docker cp msq-survey-nextjs-mongo:/tmp/backup "$BACKUP_DIR/mongo"

# Backup application data
echo "📁 Backing up application data..."
docker cp msq-survey-nextjs-app:/app/.next "$BACKUP_DIR/app"

# Create archive
echo "📦 Creating archive..."
tar -czf "backup_$(date +%Y%m%d_%H%M%S).tar.gz" -C "$BACKUP_DIR" .

echo "✅ Backup complete: backup_$(date +%Y%m%d_%H%M%S).tar.gz"
```

## 🔧 Troubleshooting

### Common Issues

#### Container won't start
```bash
# Check container logs
docker-compose logs app
docker-compose logs mongo

# Check container status
docker-compose ps

# Restart containers
docker-compose restart
```

#### MongoDB connection issues
```bash
# Check MongoDB logs
docker logs msq-survey-nextjs-mongo

# Test MongoDB connection
docker exec msq-survey-nextjs-mongo mongosh --eval "db.runCommand('ping')"

# Check network connectivity
docker exec msq-survey-nextjs-app ping mongo
```

#### Port conflicts
```bash
# Check port usage
netstat -tulpn | grep :7016
netstat -tulpn | grep :27018

# Kill conflicting processes
sudo kill -9 $(lsof -t -i:7016)
sudo kill -9 $(lsof -t -i:27018)
```

### Debug Commands

```bash
# Enter container shell
docker exec -it msq-survey-nextjs-app sh
docker exec -it msq-survey-nextjs-mongo mongosh

# Check container resources
docker stats msq-survey-nextjs-app msq-survey-nextjs-mongo

# Inspect container configuration
docker inspect msq-survey-nextjs-app
docker inspect msq-survey-nextjs-mongo
```

---

**Nächste Schritte**: Siehe [Production Deployment](production.md) für detaillierte Dokumentation des Live-Server-Setups.