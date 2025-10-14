# MSQ Survey Next.js - Deployment Guide

## 🌐 Production URL
**https://survey.plygrnd.tech**

## Prerequisites

1. Docker & Docker Compose installed on the server
2. Traefik proxy running (for automatic HTTPS)
3. `proxy-network` Docker network created
4. OpenAI API Key

## Quick Deployment

### 1. Set Environment Variables

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

### 2. Run Deployment Script

```bash
./deploy.sh
```

That's it! The script will:
- Stop existing containers
- Build the new Docker image
- Start containers with health checks
- Configure Traefik routing automatically

## Manual Deployment

If you prefer manual control:

```bash
# Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker logs -f msq-survey-nextjs-app

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Useful Commands

### View Application Logs
```bash
docker logs -f msq-survey-nextjs-app
```

### View MongoDB Logs
```bash
docker logs -f msq-survey-nextjs-mongo
```

### Restart Application
```bash
docker-compose -f docker-compose.prod.yml restart app
```

### Access MongoDB Shell
```bash
docker exec -it msq-survey-nextjs-mongo mongosh msq_survey
```

### Stop Everything
```bash
docker-compose -f docker-compose.prod.yml down
```

### Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Application not accessible

1. Check if containers are running:
   ```bash
   docker ps | grep msq-survey
   ```

2. Check application logs:
   ```bash
   docker logs msq-survey-nextjs-app
   ```

3. Check if Traefik is routing correctly:
   ```bash
   docker logs traefik | grep survey.plygrnd.tech
   ```

### MongoDB connection issues

```bash
# Check MongoDB health
docker exec msq-survey-nextjs-mongo mongosh --eval "db.runCommand('ping')"
```

### SSL Certificate issues

Traefik should automatically request Let's Encrypt certificates. Check Traefik logs:
```bash
docker logs traefik | grep -i certificate
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API Key for AI features | `sk-...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/msq_survey` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `https://survey.plygrnd.tech` |

## Architecture

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB 7
- **Proxy**: Traefik (external, not included)
- **SSL**: Let's Encrypt via Traefik

## Port Mapping

- **App (External)**: 7016 → 3000 (internal)
- **MongoDB (External)**: 27018 → 27017 (internal)

## Networks

- `survey-network`: Internal network for app ↔ MongoDB communication
- `proxy-network`: External network for Traefik routing

## Health Checks

MongoDB has a health check that pings the database every 10 seconds. The app container waits for MongoDB to be healthy before starting.

## Updates

To deploy updates:

1. Pull latest code: `git pull`
2. Run deployment script: `./deploy.sh`

The script will rebuild the image and restart containers automatically.

