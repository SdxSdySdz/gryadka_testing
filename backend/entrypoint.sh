#!/bin/bash
set -e

echo "Waiting for postgres..."
while ! python -c "import socket; s = socket.socket(); s.connect(('${POSTGRES_HOST:-postgres}', ${POSTGRES_PORT:-5432})); s.close()" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready"

echo "Creating migrations..."
python manage.py makemigrations --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Seeding default settings..."
python manage.py seed_defaults

echo "Starting server..."
exec "$@"
