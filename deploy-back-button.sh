#!/bin/bash

# ============================================
# MSQ Survey - Back Button Deployment
# ============================================

set -e

SERVER="root@93.93.115.29"
PASSWORD="3561"
BASE_DIR="/root/msq-survey-nextjs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  MSQ Survey - Updates${NC}"
echo -e "${BLUE}  - Back Button${NC}"
echo -e "${BLUE}  - AI Integration Fix${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Step 1: Copy updated chatStore
echo -e "${YELLOW}📄 Step 1/6: Copying updated chatStore.ts...${NC}"
cat src/stores/chatStore.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/stores/chatStore.ts"
echo "✅ chatStore.ts updated"

# Step 2: Copy new BackButton component
echo -e "${YELLOW}📄 Step 2/6: Copying BackButton.tsx...${NC}"
cat src/components/glass/BackButton.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/components/glass/BackButton.tsx"
echo "✅ BackButton.tsx created"

# Step 3: Copy updated GlassContainer
echo -e "${YELLOW}📄 Step 3/6: Copying updated GlassContainer.tsx...${NC}"
cat src/components/glass/GlassContainer.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/components/glass/GlassContainer.tsx"
echo "✅ GlassContainer.tsx updated"

# Step 4: Copy updated GlassHeader (Voice toggle removed)
echo -e "${YELLOW}📄 Step 4/6: Copying updated GlassHeader.tsx...${NC}"
cat src/components/glass/GlassHeader.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/components/glass/GlassHeader.tsx"
echo "✅ GlassHeader.tsx updated"

# Step 5: Copy updated stepDefinitions (AI integration is now dynamic)
echo -e "${YELLOW}📄 Step 5/6: Copying updated stepDefinitions.ts...${NC}"
cat src/server/config/stepDefinitions.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/config/stepDefinitions.ts"
echo "✅ stepDefinitions.ts updated"

# Step 6: Copy updated aiIntegrationHandler (conditional routing)
echo -e "${YELLOW}📄 Step 6/7: Copying updated aiIntegrationHandler.ts...${NC}"
cat src/server/handlers/aiIntegrationHandler.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/handlers/aiIntegrationHandler.ts"
echo "✅ aiIntegrationHandler.ts updated"

# Step 7: Copy updated toolsHandler (direct routing to ai_integration)
echo -e "${YELLOW}📄 Step 7/8: Copying updated toolsHandler.ts...${NC}"
cat src/server/handlers/toolsHandler.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/handlers/toolsHandler.ts"
echo "✅ toolsHandler.ts updated"

# Step 8: Copy updated button-group (arrow for single-select)
echo -e "${YELLOW}📄 Step 8/9: Copying updated udg-glass-button-group.tsx...${NC}"
cat src/components/interactive/udg-glass-button-group.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/components/interactive/udg-glass-button-group.tsx"
echo "✅ udg-glass-button-group.tsx updated"

# Step 9: Copy updated aiIntegrationHandler (debug logs)
echo -e "${YELLOW}📄 Step 9/10: Copying updated aiIntegrationHandler.ts...${NC}"
cat src/server/handlers/aiIntegrationHandler.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/handlers/aiIntegrationHandler.ts"
echo "✅ aiIntegrationHandler.ts updated"

# Step 10: Copy updated stepProcessor (debug logs)
echo -e "${YELLOW}📄 Step 10/11: Copying updated stepProcessor.ts...${NC}"
cat src/server/services/stepProcessor.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/services/stepProcessor.ts"
echo "✅ stepProcessor.ts updated"

# Step 11: Copy updated aiIntegrationHandler (direct return fix)
echo -e "${YELLOW}📄 Step 11/12: Copying updated aiIntegrationHandler.ts...${NC}"
cat src/server/handlers/aiIntegrationHandler.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/handlers/aiIntegrationHandler.ts"
echo "✅ aiIntegrationHandler.ts updated"

# Step 12: Copy updated GlassCenteredView with loading text
echo -e "${YELLOW}📄 Step 12/13: Copying updated GlassCenteredView.tsx...${NC}"
cat src/components/glass/GlassCenteredView.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/components/glass/GlassCenteredView.tsx"
echo "✅ GlassCenteredView.tsx updated"

# Step 13: Copy middleware with updated password
echo -e "${YELLOW}📄 Step 13/13: Copying updated middleware...${NC}"
cat src/middleware.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/middleware.ts"
echo "✅ Middleware updated with new password"

echo ""
echo -e "${YELLOW}🔨 Building Docker image on server...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /root/msq-survey-nextjs
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -20
ENDSSH
echo "✅ Docker image built"

echo ""
echo -e "${YELLOW}🚢 Restarting container...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /root/msq-survey-nextjs

# Stop old container
docker compose -f docker-compose.prod.yml down app 2>/dev/null || true

# Start new container
docker compose -f docker-compose.prod.yml up -d app

# Connect to network
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true

echo "✅ Container restarted"

# Wait for container to be ready
echo "⏳ Waiting for container to start..."
sleep 8

# Check container status
echo "📊 Container status:"
docker ps | grep msq-survey-nextjs-app || echo "⚠️  Container not running!"

# Check logs
echo ""
echo "📋 Last 15 log lines:"
docker logs msq-survey-nextjs-app --tail 15
ENDSSH

# Verification
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Verification${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}🔍 Testing main route...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://survey.plygrnd.tech/)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! Application is live!${NC}"
else
    echo -e "${RED}❌ ERROR: Application returned HTTP $HTTP_STATUS${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✨ Updates Deployed!${NC}"
echo -e "${GREEN}🏠 Survey:${NC}          https://survey.plygrnd.tech/"
echo -e "${GREEN}📊 Dashboard:${NC}       https://survey.plygrnd.tech/entries"
echo ""
echo -e "${YELLOW}New Features:${NC}"
echo -e "  ⬅️  Back button (bottom left) - go back one step"
echo -e "  🔧 AI Integration fix - skip tools question if 'No' selected"
echo -e "  ➡️  Single-select buttons now show arrow instead of circle"
echo ""

