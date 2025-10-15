#!/bin/bash

# ============================================
# MSQ Survey - Complete Server Deployment
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
echo -e "${BLUE}  MSQ Survey - Complete Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Step 1: Create directories
echo -e "${YELLOW}📁 Step 1/6: Creating directories on server...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
mkdir -p /root/msq-survey-nextjs/src/app/entries
mkdir -p /root/msq-survey-nextjs/src/app/api/survey/results
echo "✅ Directories created"
EOF

# Step 2: Copy entries page
echo -e "${YELLOW}📄 Step 2/6: Copying entries page...${NC}"
cat src/app/entries/page.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/app/entries/page.tsx"
echo "✅ entries/page.tsx copied"

# Step 3: Copy API route
echo -e "${YELLOW}📄 Step 3/6: Copying API route...${NC}"
cat src/app/api/survey/results/route.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/app/api/survey/results/route.ts"
echo "✅ api/survey/results/route.ts copied"

# Step 4: Copy mongoService
echo -e "${YELLOW}📄 Step 4/6: Updating mongoService...${NC}"
cat src/server/services/mongoService.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/services/mongoService.ts"
echo "✅ mongoService.ts updated"

# Step 5: Build Docker image
echo -e "${YELLOW}🔨 Step 5/6: Building Docker image (this may take 2-3 minutes)...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
cd /root/msq-survey-nextjs
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -20
EOF
echo "✅ Docker image built"

# Step 6: Restart container
echo -e "${YELLOW}🚢 Step 6/6: Restarting container...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
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
sleep 5

# Check container status
echo "📊 Container status:"
docker ps | grep msq-survey-nextjs-app || echo "⚠️  Container not running!"

# Check logs
echo ""
echo "📋 Last 10 log lines:"
docker logs msq-survey-nextjs-app --tail 10
EOF

# Verification
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Verification${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}🔍 Testing /entries route...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://survey.plygrnd.tech/entries)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! /entries route is live and working!${NC}"
else
    echo -e "${RED}❌ ERROR: /entries returned HTTP $HTTP_STATUS${NC}"
    echo -e "${YELLOW}Checking server logs...${NC}"
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "docker logs msq-survey-nextjs-app --tail 20"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}📊 Admin Dashboard:${NC} https://survey.plygrnd.tech/entries"
echo -e "${GREEN}🔌 API Endpoint:${NC}    https://survey.plygrnd.tech/api/survey/results"
echo -e "${GREEN}🏠 Survey:${NC}          https://survey.plygrnd.tech/glass"
echo ""

