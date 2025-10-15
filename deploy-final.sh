#!/bin/bash

# ============================================
# MSQ Survey - Complete Server Deployment
# Single SSH session to avoid auth issues
# ============================================

set -e

SERVER="root@93.93.115.29"
PASSWORD="3561"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  MSQ Survey - Complete Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}📦 Step 1/3: Preparing files for upload...${NC}"

# Create temporary directory
TMP_DIR="/tmp/msq-survey-deploy-$$"
mkdir -p "$TMP_DIR"

# Copy files to temp directory
cp -r src/app/entries "$TMP_DIR/"
cp -r src/app/api/survey/results "$TMP_DIR/"
cp src/server/services/mongoService.ts "$TMP_DIR/"

echo "✅ Files prepared in $TMP_DIR"

# Step 2: Upload and deploy in single SSH session
echo ""
echo -e "${YELLOW}🚀 Step 2/3: Uploading and deploying to server...${NC}"

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'

echo "📁 Creating directories..."
mkdir -p /root/msq-survey-nextjs/src/app/entries
mkdir -p /root/msq-survey-nextjs/src/app/api/survey/results

echo "📥 Receiving files..."

# Receive entries page
cat > /root/msq-survey-nextjs/src/app/entries/page.tsx << 'ENDFILE'
ENTRIES_PAGE_CONTENT
ENDFILE

# Receive API route
cat > /root/msq-survey-nextjs/src/app/api/survey/results/route.ts << 'ENDFILE'
API_ROUTE_CONTENT
ENDFILE

# Receive mongoService
cat > /root/msq-survey-nextjs/src/server/services/mongoService.ts << 'ENDFILE'
MONGO_SERVICE_CONTENT
ENDFILE

echo "✅ Files received"

cd /root/msq-survey-nextjs

echo ""
echo "🔨 Building Docker image..."
docker compose -f docker-compose.prod.yml build app 2>&1 | tail -10

echo ""
echo "🚢 Restarting container..."
docker compose -f docker-compose.prod.yml down app 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d app
docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true

echo "⏳ Waiting for container to be ready..."
sleep 8

echo ""
echo "📊 Container status:"
docker ps | grep msq-survey-nextjs-app

echo ""
echo "📋 Container logs (last 10 lines):"
docker logs msq-survey-nextjs-app --tail 10

echo ""
echo "🔍 Testing /entries route..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7016/entries)
echo "Local test: HTTP $HTTP_CODE"

ENDSSH

# Step 3: Verify deployment
echo ""
echo -e "${YELLOW}🔍 Step 3/3: Verifying deployment...${NC}"
sleep 3

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://survey.plygrnd.tech/entries)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! Deployment complete!${NC}"
else
    echo -e "${RED}⚠️  WARNING: /entries returned HTTP $HTTP_STATUS${NC}"
    echo "Checking logs..."
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "docker logs msq-survey-nextjs-app --tail 15"
fi

# Cleanup
rm -rf "$TMP_DIR"

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}📊 Admin Dashboard:${NC} https://survey.plygrnd.tech/entries"
echo -e "${GREEN}🔌 API Endpoint:${NC}    https://survey.plygrnd.tech/api/survey/results"
echo -e "${GREEN}🏠 Survey:${NC}          https://survey.plygrnd.tech/glass"
echo ""

