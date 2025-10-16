# Production Deployment - Live-Server Setup

## 🎯 Übersicht

Das MSQ Survey System ist in der Produktion auf **https://survey.plygrnd.tech** live und verwendet Traefik als Reverse Proxy mit automatischer SSL-Zertifikatsverwaltung.

## 🌐 Production-Architektur

### Server-Infrastruktur

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production Server                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Traefik Proxy   │  │ MSQ Survey App  │  │ MongoDB         │ │
│  │ (Port 80/443)   │  │ (Port 3000)     │  │ (Port 27017)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Let's Encrypt   │  │ DNS (Cloudflare)│  │ CDN (Optional)  │ │
│  │ SSL Certs       │  │ survey.plygrnd  │  │ Performance     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Domain-Konfiguration

| Service | Domain | Port | SSL | Beschreibung |
|---------|--------|------|-----|--------------|
| **Survey App** | `survey.plygrnd.tech` | 443 | ✅ | Hauptanwendung |
| **Dashboard** | `survey.plygrnd.tech/entries` | 443 | ✅ | Ergebnisse-Dashboard |
| **Health Check** | `survey.plygrnd.tech/api/health` | 443 | ✅ | System-Status |

## 🚀 Deployment-Prozess

### 1. Server-Vorbereitung

#### System-Requirements
```bash
# Ubuntu 20.04+ oder Debian 11+
# Docker 20.10+
# Docker Compose 2.0+
# 2GB RAM minimum
# 10GB Disk space minimum
```

#### Docker Installation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Traefik Setup
```bash
# Create Traefik network
docker network create proxy-network

# Create Traefik configuration
mkdir -p /opt/traefik
cat > /opt/traefik/traefik.yml << EOF
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: proxy-network

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
EOF

# Create Let's Encrypt directory
mkdir -p /opt/traefik/letsencrypt
touch /opt/traefik/letsencrypt/acme.json
chmod 600 /opt/traefik/letsencrypt/acme.json
```

### 2. Application Deployment

#### Repository Setup
```bash
# Clone repository
git clone https://github.com/your-org/msq-survey-nextjs.git
cd msq-survey-nextjs

# Create production environment
cat > .env.production << EOF
OPENAI_API_KEY=your-production-openai-key
MONGODB_URI=mongodb://mongo:27017/msq_survey
NEXT_PUBLIC_API_URL=https://survey.plygrnd.tech
NODE_ENV=production
EOF
```

#### Docker Compose Production
```yaml
# docker-compose.prod.yml
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

### 3. Deployment-Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying MSQ Survey to Production..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found. Please create it first."
  exit 1
fi

# Load environment variables
export $(cat .env.production | xargs)

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY not set in .env.production"
  exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

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
curl -f https://survey.plygrnd.tech/api/health || echo "❌ Health check failed"

echo "✅ Deployment complete!"
echo "🌐 Application: https://survey.plygrnd.tech"
echo "📊 Dashboard: https://survey.plygrnd.tech/entries"
```

## 🔐 SSL/TLS-Konfiguration

### Let's Encrypt Integration

#### Traefik Labels
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.msq-survey-nextjs.rule=Host(`survey.plygrnd.tech`)"
  - "traefik.http.routers.msq-survey-nextjs.entrypoints=websecure"
  - "traefik.http.routers.msq-survey-nextjs.tls.certresolver=letsencrypt"
  - "traefik.http.services.msq-survey-nextjs.loadbalancer.server.port=3000"
  - "traefik.docker.network=proxy-network"
```

#### SSL-Zertifikat-Verwaltung
```bash
# Check SSL certificate status
docker exec traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates'

# Renew certificates manually
docker exec traefik traefik --configFile=/etc/traefik/traefik.yml --log.level=DEBUG
```

### HTTPS-Redirect

```yaml
# Traefik configuration for HTTPS redirect
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
```

## 📊 Monitoring & Logging

### Container-Monitoring

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View container logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f mongo

# Monitor resource usage
docker stats msq-survey-nextjs-app msq-survey-nextjs-mongo
```

### Application Health Checks

```bash
# Health check endpoint
curl -f https://survey.plygrnd.tech/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "mongodb": "connected",
    "openai": "available"
  },
  "version": "1.0.0"
}
```

### Log Management

```bash
# View application logs
docker logs -f msq-survey-nextjs-app

# View MongoDB logs
docker logs -f msq-survey-nextjs-mongo

# View Traefik logs
docker logs -f traefik

# Log rotation
docker-compose -f docker-compose.prod.yml logs --tail=1000 > logs/app-$(date +%Y%m%d).log
```

## 🔄 Backup & Recovery

### Automated Backup

```bash
#!/bin/bash
# backup-prod.sh

echo "💾 Creating production backup..."

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

# Backup environment files
echo "🔐 Backing up environment files..."
cp .env.production "$BACKUP_DIR/"

# Create archive
echo "📦 Creating archive..."
tar -czf "backup_$(date +%Y%m%d_%H%M%S).tar.gz" -C "$BACKUP_DIR" .

# Upload to cloud storage (optional)
# aws s3 cp "backup_$(date +%Y%m%d_%H%M%S).tar.gz" s3://your-backup-bucket/

echo "✅ Backup complete: backup_$(date +%Y%m%d_%H%M%S).tar.gz"
```

### Recovery Process

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

echo "🔄 Restoring from backup: $BACKUP_FILE"

# Extract backup
tar -xzf "$BACKUP_FILE"

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Restore MongoDB
echo "📊 Restoring MongoDB..."
docker run --rm -v msq-survey-nextjs_mongo_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongo.tar.gz -C /data

# Restore application
echo "📁 Restoring application..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Restore complete!"
```

## 🔧 Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
```bash
# Check container health
docker-compose -f docker-compose.prod.yml ps

# Check disk space
df -h

# Check memory usage
free -h

# Check application logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=100 app | grep -i error
```

#### Weekly Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker images
docker system prune -f

# Check SSL certificate expiry
openssl s_client -connect survey.plygrnd.tech:443 -servername survey.plygrnd.tech | openssl x509 -noout -dates

# Backup database
./backup-prod.sh
```

#### Monthly Tasks
```bash
# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Review and rotate logs
docker-compose -f docker-compose.prod.yml logs --tail=1000 > logs/monthly-$(date +%Y%m).log

# Security audit
docker-compose -f docker-compose.prod.yml exec app npm audit
```

### Performance Monitoring

```bash
# Monitor container performance
docker stats --no-stream

# Check application response time
curl -w "@curl-format.txt" -o /dev/null -s https://survey.plygrnd.tech/api/health

# Monitor database performance
docker exec msq-survey-nextjs-mongo mongosh --eval "db.runCommand({serverStatus: 1})"
```

## 🚨 Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs app

# Check environment variables
docker-compose -f docker-compose.prod.yml exec app env | grep -E "(OPENAI|MONGODB|NEXT_PUBLIC)"

# Restart container
docker-compose -f docker-compose.prod.yml restart app
```

#### SSL certificate issues
```bash
# Check Traefik logs
docker logs traefik | grep -i certificate

# Check certificate status
docker exec traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates'

# Force certificate renewal
docker exec traefik rm /letsencrypt/acme.json
docker-compose -f docker-compose.prod.yml restart traefik
```

#### Database connection issues
```bash
# Check MongoDB logs
docker logs msq-survey-nextjs-mongo

# Test MongoDB connection
docker exec msq-survey-nextjs-mongo mongosh --eval "db.runCommand('ping')"

# Check network connectivity
docker exec msq-survey-nextjs-app ping mongo
```

### Emergency Procedures

#### Rollback to previous version
```bash
# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Restore from backup
./restore.sh backup_20240101_120000.tar.gz

# Start containers
docker-compose -f docker-compose.prod.yml up -d
```

#### Database recovery
```bash
# Stop application
docker-compose -f docker-compose.prod.yml stop app

# Restore database
docker exec msq-survey-nextjs-mongo mongorestore /backup/mongo

# Start application
docker-compose -f docker-compose.prod.yml start app
```

---

**Nächste Schritte**: Siehe [Environment Configuration](environment.md) für detaillierte Dokumentation der Umgebungsvariablen.