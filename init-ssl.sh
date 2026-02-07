#!/bin/bash
# Initialize SSL certificate using certbot
# Run this once on the server before the first deploy

set -e

DOMAIN=${1:-hghgfhtfg.ru}
EMAIL=${2:-admin@$DOMAIN}

echo "=== SSL Certificate Setup for $DOMAIN ==="

# Create required directories
mkdir -p docker/nginx/certbot/conf
mkdir -p docker/nginx/certbot/www

# Get certificate using standalone mode
docker run --rm \
  -v "$(pwd)/docker/nginx/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/docker/nginx/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "=== SSL Certificate obtained! ==="
echo "Now run: docker-compose up --build -d"
