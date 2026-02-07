#!/bin/bash
# Deploy script for Gryadka TMA
# Usage: ./deploy.sh

set -e

echo "=== Грядка Deploy Script ==="

# 1. Pull latest code
echo "Pulling latest code..."
git pull origin main

# 2. Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# 3. Build and start Docker
echo "Building and starting Docker containers..."
docker-compose down
docker-compose up --build -d

# 4. Set up webhook
echo "Setting up Telegram webhook..."
DOMAIN=$(grep DOMAIN .env | cut -d '=' -f2)
TOKEN=$(grep TELEGRAM_BOT_TOKEN .env | cut -d '=' -f2)
curl -s "https://api.telegram.org/bot${TOKEN}/setWebhook?url=https://${DOMAIN}/api/bot/webhook/"

echo ""
echo "=== Deploy complete! ==="
echo "App: https://${DOMAIN}"
echo ""
