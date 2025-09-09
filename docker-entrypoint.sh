#!/bin/sh
set -e

echo "🚀 Starting SeekSphere Real Estate App..."

# Ensure DATABASE_URL is available
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is required"
  exit 1
fi

echo "📝 Using DATABASE_URL for database connection"

# Wait for database to be ready (simplified check)
echo "⏳ Waiting for database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database is ready!"
    break
  fi
  
  echo "Database is unavailable - attempt $attempt/$max_attempts"
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "❌ Database connection failed after $max_attempts attempts"
  exit 1
fi

# Always recreate database and generate fresh data
echo "🎲 Generating fresh database with sample data (this may take a few minutes)..."
echo "⚠️  This will clear any existing data and create fresh tables and data"

# The generate-data script now handles table creation and data generation
npm run generate-data
echo "✅ Fresh database and sample data generated!"

# Quick connection test
echo "🔍 Testing database connection..."
npm run test:connection

echo "🌟 Starting Next.js application..."

# Check if we're using standalone build
if [ -f "server.js" ]; then
  exec node server.js
else
  exec npm start
fi