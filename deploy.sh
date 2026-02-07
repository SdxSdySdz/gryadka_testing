#!/bin/bash
set -e

echo "=== Грядка — Deploy ==="

# 1. Pull latest code
echo "[1/5] Pulling latest code..."
git pull origin main

# 2. Build frontend
echo "[2/5] Building frontend..."
cd frontend
npm install --production=false
npm run build
cd ..

# 3. Build and start Docker
echo "[3/5] Building and starting containers..."
docker compose down
docker compose up --build -d

# 4. Wait for Django to be ready
echo "[4/5] Waiting for services..."
sleep 10

# 5. Set webhook
echo "[5/5] Setting Telegram webhook..."
DOMAIN=$(grep "^DOMAIN=" .env | cut -d '=' -f2)
TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d '=' -f2)

if [ -n "$DOMAIN" ] && [ -n "$TOKEN" ]; then
    # First delete any existing webhook
    curl -s "https://api.telegram.org/bot${TOKEN}/deleteWebhook" > /dev/null
    echo "Webhook deleted (bot runs in polling mode)"
fi

echo ""
echo "=== Deploy complete! ==="
echo "Site: http://${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Point domain DNS A record to this server IP"
echo "  2. Run: ./setup-ssl.sh  (to get HTTPS certificate)"
echo "  3. Configure Mini App URL in @BotFather"
echo ""
