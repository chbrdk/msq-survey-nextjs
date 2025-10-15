#!/usr/bin/env python3
"""
MSQ Survey - Complete Server Deployment Script
Uploads files via SSH and rebuilds Docker container
"""

import subprocess
import sys
import time

# Server config
SERVER = "root@93.93.115.29"
PASSWORD = "3561"
BASE_DIR = "/root/msq-survey-nextjs"

# Colors
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
RED = '\033[0;31m'
NC = '\033[0m'

def run_ssh(command):
    """Execute command on remote server"""
    cmd = f'sshpass -p "{PASSWORD}" ssh -o StrictHostKeyChecking=no {SERVER} "{command}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result

def copy_file(local_path, remote_path):
    """Copy file to remote server using cat over SSH"""
    with open(local_path, 'r') as f:
        content = f.read()
    
    # Escape single quotes in content
    escaped_content = content.replace("'", "'\\''")
    
    cmd = f"sshpass -p '{PASSWORD}' ssh -o StrictHostKeyChecking=no {SERVER} \"cat > {remote_path}\" << 'ENDOFFILE'\n{content}\nENDOFFILE"
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.returncode == 0

print(f"{BLUE}============================================{NC}")
print(f"{BLUE}  MSQ Survey - Complete Deployment{NC}")
print(f"{BLUE}============================================{NC}\n")

# Step 1: Create directories
print(f"{YELLOW}📁 Step 1/6: Creating directories on server...{NC}")
run_ssh(f"mkdir -p {BASE_DIR}/src/app/entries")
run_ssh(f"mkdir -p {BASE_DIR}/src/app/api/survey/results")
run_ssh(f"mkdir -p {BASE_DIR}/src/server/services")
print("✅ Directories created\n")

# Step 2-4: Copy files
files_to_copy = [
    ("src/app/entries/page.tsx", f"{BASE_DIR}/src/app/entries/page.tsx", "entries page"),
    ("src/app/api/survey/results/route.ts", f"{BASE_DIR}/src/app/api/survey/results/route.ts", "API route"),
    ("src/server/services/mongoService.ts", f"{BASE_DIR}/src/server/services/mongoService.ts", "mongoService"),
]

for i, (local, remote, name) in enumerate(files_to_copy, 2):
    print(f"{YELLOW}📄 Step {i}/6: Copying {name}...{NC}")
    if copy_file(local, remote):
        print(f"✅ {name} copied\n")
    else:
        print(f"{RED}❌ Failed to copy {name}{NC}")
        sys.exit(1)

# Step 5: Build Docker image
print(f"{YELLOW}🔨 Step 5/6: Building Docker image (2-3 minutes)...{NC}")
result = run_ssh(f"cd {BASE_DIR} && docker compose -f docker-compose.prod.yml build app 2>&1 | tail -15")
print(result.stdout)
print("✅ Docker image built\n")

# Step 6: Restart container
print(f"{YELLOW}🚢 Step 6/6: Restarting container...{NC}")

commands = [
    f"cd {BASE_DIR}",
    "docker compose -f docker-compose.prod.yml down app 2>/dev/null || true",
    "docker compose -f docker-compose.prod.yml up -d app",
    "docker network connect n8n_default msq-survey-nextjs-app 2>/dev/null || true",
    "sleep 5",
    "docker ps | grep msq-survey-nextjs-app",
]

result = run_ssh(" && ".join(commands))
print(result.stdout)
print("✅ Container restarted\n")

# Verification
print(f"{BLUE}============================================{NC}")
print(f"{BLUE}  Verification{NC}")
print(f"{BLUE}============================================{NC}\n")

print(f"{YELLOW}🔍 Testing /entries route...{NC}")
time.sleep(3)

# Test local on server
result = run_ssh("curl -s -o /dev/null -w '%{http_code}' http://localhost:7016/entries")
local_status = result.stdout.strip()
print(f"Local (7016): HTTP {local_status}")

# Test via HTTPS
try:
    import urllib.request
    req = urllib.request.Request('https://survey.plygrnd.tech/entries')
    with urllib.request.urlopen(req, timeout=10) as response:
        https_status = response.status
except Exception as e:
    https_status = str(e)

print(f"HTTPS: {https_status}")

if str(local_status) == "200":
    print(f"\n{GREEN}✅ SUCCESS! Deployment complete!{NC}\n")
else:
    print(f"\n{RED}⚠️  WARNING: Issues detected{NC}")
    print(f"{YELLOW}Checking container logs...{NC}\n")
    result = run_ssh("docker logs msq-survey-nextjs-app --tail 20")
    print(result.stdout)

print(f"{BLUE}============================================{NC}")
print(f"{BLUE}  Deployment Complete!{NC}")
print(f"{BLUE}============================================{NC}\n")
print(f"{GREEN}📊 Admin Dashboard:{NC} https://survey.plygrnd.tech/entries")
print(f"{GREEN}🔌 API Endpoint:{NC}    https://survey.plygrnd.tech/api/survey/results")
print(f"{GREEN}🏠 Survey:{NC}          https://survey.plygrnd.tech/glass\n")

