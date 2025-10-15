#!/bin/bash

# Deploy Intro Step changes
# Includes: stepDefinitions, init route, phaseMapper, info-message component

SERVER="root@93.93.115.29"
PASSWORD="3561"

echo "🚀 MSQ Survey - Intro Step Deployment"
echo "======================================"
echo ""

# Encode files to base64
echo "📦 Encoding files..."
STEP_DEFS_B64=$(base64 < src/server/config/stepDefinitions.ts)
INIT_ROUTE_B64=$(base64 < src/app/api/survey/init/route.ts)
PHASE_MAPPER_B64=$(base64 < src/server/utils/phaseMapper.ts)
INFO_MSG_B64=$(base64 < src/components/interactive/udg-glass-info-message.tsx)
PROGRESS_CALC_B64=$(base64 < src/utils/progressCalculator.ts)

echo "✅ Files encoded"
echo ""

# Single SSH session that does everything
echo "🚀 Deploying to server..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER bash << 'ENDSSH'

set -e

echo "📁 Creating directories..."
mkdir -p /root/msq-survey-nextjs/src/server/config
mkdir -p /root/msq-survey-nextjs/src/app/api/survey/init
mkdir -p /root/msq-survey-nextjs/src/server/utils
mkdir -p /root/msq-survey-nextjs/src/components/interactive
mkdir -p /root/msq-survey-nextjs/src/utils

echo "📄 Writing stepDefinitions.ts..."
echo "$STEP_DEFS_B64" | base64 -d > /root/msq-survey-nextjs/src/server/config/stepDefinitions.ts

echo "📄 Writing init route..."
echo "$INIT_ROUTE_B64" | base64 -d > /root/msq-survey-nextjs/src/app/api/survey/init/route.ts

echo "📄 Writing phaseMapper..."
echo "$PHASE_MAPPER_B64" | base64 -d > /root/msq-survey-nextjs/src/server/utils/phaseMapper.ts

echo "📄 Writing info-message component..."
echo "$INFO_MSG_B64" | base64 -d > /root/msq-survey-nextjs/src/components/interactive/udg-glass-info-message.tsx

echo "📄 Writing progressCalculator..."
echo "$PROGRESS_CALC_B64" | base64 -d > /root/msq-survey-nextjs/src/utils/progressCalculator.ts

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
echo "📋 Container Logs (last 15 lines):"
docker logs msq-survey-nextjs-app --tail 15

echo ""
echo "🔍 Testing /api/survey/init route..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:7016/api/survey/init)
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Init route is working!"
else
    echo "⚠️  Init route returned $HTTP_CODE"
fi

ENDSSH

echo ""
echo "🔍 Testing HTTPS endpoint..."
sleep 2

HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://survey.plygrnd.tech/api/survey/init)

echo ""
echo "======================================"
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✅ DEPLOYMENT SUCCESSFUL!"
else
    echo "⚠️  HTTPS Status: $HTTPS_STATUS"
fi
echo "======================================"
echo ""
echo "🎯 Test the intro step:"
echo "   https://survey.plygrnd.tech/glass"
echo ""
echo "💡 Clear browser cache or use Incognito mode!"
echo ""


