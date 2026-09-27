#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Move into the folder where manage.py lives
cd /app/bookmarks

echo "==> Running Database Migrations..."
python manage.py migrate --noinput

echo "==> Starting Gunicorn Application Server..."
exec gunicorn config.wsgi:application \
     --bind 0.0.0.0:8000 \
     --workers 3 \
     --timeout 60 \
     --access-logfile - \
     --error-logfile -