#!/bin/bash

# Ultra-simple deployment using base64 encoding
# Avoids all heredoc and escape issues

SERVER="root@93.93.115.29"
PASSWORD="3561"

echo "🚀 MSQ Survey - Deployment Script"
echo "=================================="
echo ""

# Encode files to base64
echo "📦 Encoding files..."
ENTRIES_B64=$(base64 < src/app/entries/page.tsx)
API_B64=$(base64 < src/app/api/survey/results/route.ts)
MONGO_B64=$(base64 < src/server/services/mongoService.ts)

echo "✅ Files encoded"
echo ""

# Single SSH session that does everything
echo "🚀 Deploying to server..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER bash << ENDSSH

set -e

echo "📁 Creating directories..."
mkdir -p /root/msq-survey-nextjs/src/app/entries
mkdir -p /root/msq-survey-nextjs/src/app/api/survey/results  
mkdir -p /root/msq-survey-nextjs/src/server/services

echo "📄 Writing entries page..."
echo "$ENTRIES_B64" | base64 -d > /root/msq-survey-nextjs/src/app/entries/page.tsx

echo "📄 Writing API route..."
echo "$API_B64" | base64 -d > /root/msq-survey-nextjs/src/app/api/survey/results/route.ts

echo "📄 Writing mongoService..."
echo "$MONGO_B64" | base64 -d > /root/msq-survey-nextjs/src/server/services/mongoService.ts

echo "✅ All files written"
echo ""

cd /root/msq-survey-nextjs

echo "🔨 Building Docker image (this takes 2-3 minutes)..."
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -10

echo ""
echo "🚢 Restarting container..."
docker compose -f docker-compose.prod.yml down app 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true

echo "⏳ Waiting 8 seconds..."
sleep 8

echo ""
echo "📊 Container Status:"
docker ps | grep msq-survey

echo ""
echo "📋 Container Logs (last 10 lines):"
docker logs msq-survey-nextjs-app --tail 10

echo ""
echo "🔍 Testing /entries route..."
HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7016/entries)
echo "HTTP Status: \$HTTP_CODE"

if [ "\$HTTP_CODE" = "200" ]; then
    echo "✅ /entries is working!"
else
    echo "⚠️  /entries returned \$HTTP_CODE"
fi

ENDSSH

echo ""
echo "🔍 Testing HTTPS endpoint..."
sleep 2

HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://survey.plygrnd.tech/entries)

echo ""
echo "=================================="
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✅ DEPLOYMENT SUCCESSFUL!"
else
    echo "⚠️  HTTPS Status: $HTTPS_STATUS"
fi
echo "=================================="
echo ""
echo "📊 Admin Dashboard: https://survey.plygrnd.tech/entries"
echo "🔌 API Endpoint:    https://survey.plygrnd.tech/api/survey/results"  
echo "🏠 Survey:          https://survey.plygrnd.tech/glass"
echo ""

