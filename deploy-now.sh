#!/bin/bash

# Simple deployment script using rsync
# Works reliably with sshpass

SERVER="root@93.93.115.29"
PASSWORD="3561"
REMOTE_DIR="/root/msq-survey-nextjs"

echo "🚀 MSQ Survey - Quick Deployment"
echo "================================="
echo ""

echo "📦 Syncing files to server..."

# Sync all changed files
rsync -avz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  -e "sshpass -p '$PASSWORD' ssh -o StrictHostKeyChecking=no" \
  src/ $SERVER:$REMOTE_DIR/src/

echo "✅ Files synced!"
echo ""

echo "🔨 Building and restarting on server..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'

cd /root/msq-survey-nextjs

echo "Building Docker image..."
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -10

echo ""
echo "Restarting container..."
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true

echo "Waiting 5 seconds..."
sleep 5

echo ""
echo "Container status:"
docker ps | grep msq-survey-nextjs-app

echo ""
echo "Testing routes..."
echo "- /glass: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:7016/glass)"
echo "- /entries: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:7016/entries)"

ENDSSH

echo ""
echo "================================="
echo "✅ Deployment complete!"
echo "================================="
echo ""
echo "🏠 Survey:          https://survey.plygrnd.tech/glass"
echo "📊 Admin Dashboard: https://survey.plygrnd.tech/entries"
echo ""

