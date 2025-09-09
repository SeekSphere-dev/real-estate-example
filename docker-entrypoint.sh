#!/bin/sh
set -e

echo "🚀 Starting SeekSphere Real Estate App..."

# Parse DATABASE_URL if provided (Railway format)
if [ -n "$DATABASE_URL" ]; then
  echo "📝 Parsing DATABASE_URL for connection details..."
  
  # Extract components from DATABASE_URL
  # Format: postgresql://user:password@host:port/database
  DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
  DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
  
  export DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME
  
  echo "✅ Database connection details parsed from DATABASE_URL"
fi

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Check if database is initialized
echo "🔍 Checking database initialization..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -eq "0" ]; then
  echo "📊 Initializing database schema..."
  psql "$DATABASE_URL" -f schema.sql
  echo "✅ Database schema created!"
  
  echo "🎲 Generating sample data..."
  node scripts/generate-data.js
  echo "✅ Sample data generated!"
else
  echo "✅ Database already initialized with $TABLE_COUNT tables"
  
  # Test connection and validate data
  echo "🔍 Testing database connection..."
  node scripts/test-connection.js
fi

echo "🌟 Starting Next.js application..."
exec node server.js