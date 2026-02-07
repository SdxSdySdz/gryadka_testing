#!/bin/bash
set -e

DOMAIN=$(grep "^DOMAIN=" .env | cut -d '=' -f2)
EMAIL="admin@${DOMAIN}"

echo "=== SSL Setup for ${DOMAIN} ==="

# Create dirs
mkdir -p certbot/conf certbot/www

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Switch to SSL nginx config
cp docker/nginx/nginx-ssl.conf docker/nginx/nginx.conf

# Restart everything
docker compose up --build -d

echo ""
echo "=== SSL configured! ==="
echo "Site: https://${DOMAIN}"
echo ""
echo "Now set Mini App URL in @BotFather:"
echo "  https://${DOMAIN}"
echo ""
