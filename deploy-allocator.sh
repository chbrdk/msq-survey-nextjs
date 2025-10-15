#!/bin/bash

# Deploy GlassPercentageAllocator with Custom-Entry Support

SERVER="root@93.93.115.29"
PASSWORD="3561"

echo "🚀 Deploying GlassPercentageAllocator..."

# Upload files
cat src/components/glass/GlassPercentageAllocator.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/glass/GlassPercentageAllocator.tsx" && echo "✅ GlassPercentageAllocator.tsx"

cat src/components/glass/GlassComponentRenderer.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/glass/GlassComponentRenderer.tsx" && echo "✅ GlassComponentRenderer.tsx"

# Build and restart
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /root/msq-survey-nextjs
echo "🔨 Building..."
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -15
echo "🚢 Restarting..."
docker compose -f docker-compose.prod.yml down app
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true
sleep 8
docker logs msq-survey-nextjs-app --tail 10
ENDSSH

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🎯 Test: https://survey.plygrnd.tech/glass"
echo ""

