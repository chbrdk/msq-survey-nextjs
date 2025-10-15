#!/bin/bash

# Complete Deployment - All recent changes
# - Intro step
# - Agencies/Departments/Job Levels updates
# - time_in_role removed
# - Voice flow implementation
# - Descriptions in components
# - / is now Glass version

SERVER="root@93.93.115.29"
PASSWORD="3561"

echo "🚀 MSQ Survey - Complete Deployment"
echo "====================================="
echo ""

echo "📤 Uploading files via SSH..."

# Server Config Files
cat src/server/config/manifest.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/server/config/manifest.ts" && echo "✅ manifest.ts"

cat src/server/config/stepDefinitions.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/server/config/stepDefinitions.ts" && echo "✅ stepDefinitions.ts"

cat src/server/utils/phaseMapper.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/server/utils/phaseMapper.ts" && echo "✅ phaseMapper.ts"

# API Routes
cat src/app/api/survey/init/route.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/app/api/survey/init/route.ts" && echo "✅ init/route.ts"

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p /root/msq-survey-nextjs/src/app/api/voice/token"

cat src/app/api/voice/token/route.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/app/api/voice/token/route.ts" && echo "✅ voice/token/route.ts"

# Main App Page
cat src/app/page.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/app/page.tsx" && echo "✅ page.tsx"

# Utils
cat src/utils/progressCalculator.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/utils/progressCalculator.ts" && echo "✅ progressCalculator.ts"

cat src/utils/voiceParser.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/utils/voiceParser.ts" && echo "✅ voiceParser.ts"

# Hooks
cat src/hooks/useVoice.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/hooks/useVoice.ts" && echo "✅ useVoice.ts"

cat src/hooks/useRealtimeService.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/hooks/useRealtimeService.ts" && echo "✅ useRealtimeService.ts"

cat src/hooks/useVoiceFlow.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/hooks/useVoiceFlow.ts" && echo "✅ useVoiceFlow.ts"

# Services
cat src/services/openaiWebRTCService.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/services/openaiWebRTCService.ts" && echo "✅ openaiWebRTCService.ts"

# Components - Glass
cat src/components/glass/GlassContainer.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/glass/GlassContainer.tsx" && echo "✅ GlassContainer.tsx"

cat src/components/glass/GlassCenteredView.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/glass/GlassCenteredView.tsx" && echo "✅ GlassCenteredView.tsx"

cat src/components/glass/GlassPercentageAllocator.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/glass/GlassPercentageAllocator.tsx" && echo "✅ GlassPercentageAllocator.tsx"

cat src/components/glass/GlassComponentRenderer.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/glass/GlassComponentRenderer.tsx" && echo "✅ GlassComponentRenderer.tsx"

# Components - Interactive
cat src/components/interactive/udg-glass-info-message.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/interactive/udg-glass-info-message.tsx" && echo "✅ udg-glass-info-message.tsx"

cat src/components/interactive/udg-glass-multi-select.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/interactive/udg-glass-multi-select.tsx" && echo "✅ udg-glass-multi-select.tsx"

cat src/components/interactive/udg-glass-percentage-table.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/components/interactive/udg-glass-percentage-table.tsx" && echo "✅ udg-glass-percentage-table.tsx"

# Types
cat src/types/message.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > /root/msq-survey-nextjs/src/types/message.ts" && echo "✅ message.ts"

# Delete old glass route
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "rm -f /root/msq-survey-nextjs/src/app/glass/page.tsx 2>/dev/null && echo '✅ glass/page.tsx deleted'" || echo "⚠️ glass/page.tsx already deleted"

echo ""
echo "🔨 Building on server..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /root/msq-survey-nextjs
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -20
echo ""
echo "🚢 Restarting container..."
docker compose -f docker-compose.prod.yml down app
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true
sleep 10
echo ""
echo "📋 Container Status:"
docker ps | grep msq-survey
echo ""
echo "📊 Container Logs:"
docker logs msq-survey-nextjs-app --tail 15
ENDSSH

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "🎯 Survey: https://survey.plygrnd.tech/"
echo "📊 Entries: https://survey.plygrnd.tech/entries"
echo ""
echo "🎤 Voice Mode: Add ?debug=true"
echo "   https://survey.plygrnd.tech/?debug=true"
echo ""

