#!/bin/bash

set -e

APP_DIR="/var/www/myapp"

echo "Switching to app directory..."
cd $APP_DIR

exec > >(tee -i deploy.log)
exec 2>&1

echo "Fetching latest code..."
git fetch origin

echo "Resetting to origin/develop..."
git reset --hard origin/develop

echo "Installing backend dependencies..."
cd application/backend
npm ci

echo "Restarting backend..."
pm2 restart vibe-backend

echo "Installing frontend dependencies..."
cd ../frontend
npm ci

echo "Building frontend..."
npm run build

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Deployment complete."
