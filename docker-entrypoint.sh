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

# Check if database is initialized
echo "🔍 Checking database initialization..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
  echo "📊 Initializing database schema..."
  psql "$DATABASE_URL" -f schema.sql
  echo "✅ Database schema created!"
  
  echo "🎲 Generating sample data (this may take a few minutes)..."
  npm run generate-data
  echo "✅ Sample data generated!"
else
  echo "✅ Database already initialized with $TABLE_COUNT tables"
  
  # Quick connection test
  echo "🔍 Testing database connection..."
  npm run test:connection
fi

echo "🌟 Starting Next.js application..."

# Check if we're using standalone build
if [ -f "server.js" ]; then
  exec node server.js
else
  exec npm start
fi