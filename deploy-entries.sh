#!/bin/bash

# Deploy entries page to server via SSH
SERVER="root@93.93.115.29"
PASSWORD="3561"
BASE_DIR="/root/msq-survey-nextjs"

echo "🚀 Deploying /entries page to server..."

# Create directories
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $BASE_DIR/src/app/entries"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $BASE_DIR/src/app/api/survey/results"

# Copy entries page via cat
echo "📄 Creating entries/page.tsx..."
cat src/app/entries/page.tsx | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/app/entries/page.tsx"

# Copy API route via cat  
echo "📄 Creating api/survey/results/route.ts..."
cat src/app/api/survey/results/route.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/app/api/survey/results/route.ts"

# Copy mongoService via cat
echo "📄 Updating mongoService.ts..."
cat src/server/services/mongoService.ts | sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cat > $BASE_DIR/src/server/services/mongoService.ts"

echo "✅ Files copied successfully!"
echo "🔨 Building Docker image..."

# Build and restart
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cd $BASE_DIR && docker compose -f docker-compose.prod.yml build app"

echo "🚢 Restarting container..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cd $BASE_DIR && docker compose -f docker-compose.prod.yml up -d app && docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true"

echo "✅ Deployment complete!"
echo "📊 Access at: https://survey.plygrnd.tech/entries"

