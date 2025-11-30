#!/bin/sh

set -e

echo "Waiting for PostgreSQL to be ready..."
sleep 3

echo "Creating database if not exists..."
npm run db:create

echo "Running database migrations..."
npm run migrate

if [ ! -f /app/db/.seeded ]; then
  echo "Running database seeds..."
  npm run seed
  touch /app/db/.seeded
  echo "Seeds completed and flag created"
else
  echo "Seeds already applied, skipping..."
fi

echo "Starting Fastify app"
exec node dist/src/main.js
