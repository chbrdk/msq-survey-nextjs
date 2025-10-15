#!/bin/bash

# SCP-based deployment for intro step

SERVER="root@93.93.115.29"
PASSWORD="3561"

echo "🚀 MSQ Survey - SCP Deployment"
echo "==============================="
echo ""

echo "📤 Uploading files via SCP..."

# Upload each file individually
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  src/server/config/stepDefinitions.ts \
  $SERVER:/root/msq-survey-nextjs/src/server/config/stepDefinitions.ts

sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  src/app/api/survey/init/route.ts \
  $SERVER:/root/msq-survey-nextjs/src/app/api/survey/init/route.ts

sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  src/server/utils/phaseMapper.ts \
  $SERVER:/root/msq-survey-nextjs/src/server/utils/phaseMapper.ts

sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  src/components/interactive/udg-glass-info-message.tsx \
  $SERVER:/root/msq-survey-nextjs/src/components/interactive/udg-glass-info-message.tsx

sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  src/utils/progressCalculator.ts \
  $SERVER:/root/msq-survey-nextjs/src/utils/progressCalculator.ts

echo "✅ Files uploaded"
echo ""

# Now rebuild and restart
echo "🔨 Building on server..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /root/msq-survey-nextjs
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -15
docker compose -f docker-compose.prod.yml down app 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true
sleep 8
docker logs msq-survey-nextjs-app --tail 10
ENDSSH

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "🎯 Test: https://survey.plygrnd.tech/glass"
echo ""


