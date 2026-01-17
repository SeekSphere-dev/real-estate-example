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

# Create database schema if it doesn't exist
echo "📋 Setting up database schema..."
if [ -f "schema.sql" ]; then
  echo "   Running schema.sql to create tables..."
  psql "$DATABASE_URL" -f schema.sql > /dev/null 2>&1 || {
    echo "   ⚠️  Schema may already exist or there was an error (this is OK if tables already exist)"
  }
  echo "✅ Database schema ready"
else
  echo "   ⚠️  schema.sql not found, skipping schema creation"
fi

# Generate fresh data
echo "🎲 Generating fresh database with sample data (this may take a few minutes)..."
echo "⚠️  This will clear any existing data and create fresh tables and data"

# The generate-data script handles data generation
# Use python3 directly since npm may not be available in standalone build
python3 scripts/generate_data.py --database-url "$DATABASE_URL" --force
echo "✅ Fresh database and sample data generated!"

# Quick connection test
echo "🔍 Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1 as test;" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "⚠️  Database connection test had issues, but continuing..."
fi

echo "🌟 Starting Next.js application..."

# Check if we're using standalone build
if [ -f "server.js" ]; then
  exec node server.js
else
  exec npm start
fi