#!/bin/bash
set -e

echo "🚀 Starting AI Scribe Notes Manager..."

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for database to be ready..."
  local max_attempts=30
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if pg_isready -h database -p 5432 -U "$DB_USER" >/dev/null 2>&1; then
      echo "✅ Database is ready!"
      return 0
    fi

    echo "Attempt $attempt/$max_attempts: Database not ready yet..."
    sleep 2
    ((attempt++))
  done

  echo "❌ Database failed to start after $max_attempts attempts"
  exit 1
}

# Check if this is the first run (no migrations table exists)
is_first_run() {
  if [ ! -f "dist/database/migrations" ] || [ ! -d "dist/database/migrations" ]; then
    return 0  # First run
  fi

  # Check if migrations have been run by looking for the flag file
  if [ ! -f ".db_initialized" ]; then
    return 0  # First run
  fi

  return 1  # Not first run
}

# Run database initialization
init_database() {
  echo "🗄️  Initializing database..."

  echo "📦 Running migrations..."
  if pnpm migration:run; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migrations failed"
    exit 1
  fi

  echo "🌱 Running seeders..."
  if pnpm seed; then
    echo "✅ Seeders completed successfully"
  else
    echo "❌ Seeders failed"
    exit 1
  fi

  # Create flag file to indicate database is initialized
  touch .db_initialized
  echo "🎉 Database initialization completed!"
}

# Main execution
if is_first_run; then
  wait_for_db
  init_database
else
  echo "📋 Database already initialized, skipping setup..."
fi

echo "🏁 Starting application..."
exec "$@"
