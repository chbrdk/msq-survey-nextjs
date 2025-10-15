#!/bin/bash

# Simple one-command deployment
# Uses heredoc to create files directly on server

SERVER="root@93.93.115.29"
PASSWORD="3561"

echo "🚀 Starting deployment..."
echo ""

# Read file contents
ENTRIES_PAGE=$(cat src/app/entries/page.tsx)
API_ROUTE=$(cat src/app/api/survey/results/route.ts)
MONGO_SERVICE=$(cat src/server/services/mongoService.ts)

# Deploy everything in one SSH session
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER bash << 'ENDSSH'

echo "📁 Creating directories..."
mkdir -p /root/msq-survey-nextjs/src/app/entries
mkdir -p /root/msq-survey-nextjs/src/app/api/survey/results
mkdir -p /root/msq-survey-nextjs/src/server/services

echo "📄 Creating files..."

# Create entries/page.tsx
cat > /root/msq-survey-nextjs/src/app/entries/page.tsx << 'ENDENTRIESPAGE'
ENTRIES_PAGE_PLACEHOLDER
ENDENTRIESPAGE

# Create api/survey/results/route.ts
cat > /root/msq-survey-nextjs/src/app/api/survey/results/route.ts << 'ENDAPIFILE'
API_ROUTE_PLACEHOLDER
ENDAPIFILE

# Create mongoService.ts
cat > /root/msq-survey-nextjs/src/server/services/mongoService.ts << 'ENDMONGOFILE'
MONGO_SERVICE_PLACEHOLDER
ENDMONGOFILE

echo "✅ Files created successfully"

cd /root/msq-survey-nextjs

echo ""
echo "🔨 Building Docker image..."
docker compose -f docker-compose.prod.yml build app 2>&1 | grep -E "(Step|Successfully|DONE|Compiling|finished)" | tail -15

echo ""
echo "🚢 Restarting container..."
docker compose -f docker-compose.prod.yml down app 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true

echo "⏳ Waiting 8 seconds for container startup..."
sleep 8

echo ""
echo "✅ Container status:"
docker ps | grep msq-survey-nextjs-app || echo "⚠️  Container not found!"

echo ""
echo "📋 Last 15 log lines:"
docker logs msq-survey-nextjs-app --tail 15

echo ""
echo "🔍 Testing /entries route locally..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7016/entries)
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ /entries is working!"
else
    echo "⚠️  /entries returned $HTTP_CODE"
fi

ENDSSH

echo ""
echo "🔍 Testing HTTPS endpoint..."
sleep 2
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://survey.plygrnd.tech/entries)

if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✅ SUCCESS! Deployment complete!"
    echo ""
    echo "============================================"
    echo "  Available URLs:"
    echo "============================================"
    echo "📊 Admin Dashboard: https://survey.plygrnd.tech/entries"
    echo "🔌 API Endpoint:    https://survey.plygrnd.tech/api/survey/results"
    echo "🏠 Survey:          https://survey.plygrnd.tech/glass"
else
    echo "⚠️  HTTPS test: HTTP $HTTPS_STATUS"
    echo "Please check the logs above"
fi

echo ""

