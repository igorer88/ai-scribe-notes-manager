#!/bin/sh
set -e

echo "🚀 Starting AI Scribe Notes Manager..."

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for database to be ready..."

  # Adjust attempts based on BUILD_STAGE
  local max_attempts
  if [ "$BUILD_STAGE" = "prod" ]; then
    max_attempts=5  # Reduced attempts for production
  else
    max_attempts=30
  fi

  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    # Try to connect to database using psql
    if echo "SELECT 1;" | PGPASSWORD="$DB_PASSWORD" psql -h postgres -p 5432 -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
      echo "✅ Database is ready!"
      return 0
    fi

    echo "Attempt $attempt/$max_attempts: Database not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
  done

  if [ "$BUILD_STAGE" = "prod" ]; then
    echo "❌ Database failed to start after $max_attempts attempts in production mode"
    exit 1  # Exit with failure in production
  else
    echo "❌ Database failed to start after $max_attempts attempts"
    exit 1
  fi
}

# Check if this is the first run (no migrations table exists)
is_first_run() {
  echo "🔍 Checking if this is first run..."

  # Check if migrations have been run by looking for the flag file in persistent location
  if [ -f "config/db/pg_data/.db_initialized" ]; then
    echo "📋 .db_initialized flag exists, database already initialized"
    return 1  # Not first run
  fi

  echo "📋 No .db_initialized flag found, this is first run"
  return 0  # First run
}

# Run database initialization
init_database() {
  echo "🗄️  Initializing database..."

  echo "📦 Running migrations..."
  if NO_COLOR=true pnpm migration:run; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migrations failed"
    exit 1
  fi

  echo "🌱 Running seeders..."
  if NO_COLOR=true pnpm seed; then
    echo "✅ Seeders completed successfully"
  else
    echo "❌ Seeders failed"
    exit 1
  fi

  # Create flag file to indicate database is initialized
  touch config/db/pg_data/.db_initialized
  echo "🎉 Database initialization completed!"
  echo "📋 Created .db_initialized flag file in config/db/pg_data/"
}

# Main execution
if is_first_run; then
  if wait_for_db; then
    init_database
  else
    echo "⚠️  Skipping database initialization due to connection failure..."
    echo "📋 Application will handle database connections gracefully..."
  fi
else
  echo "📋 Database already initialized, skipping setup..."
fi

echo "🏁 Starting application..."
echo "📋 Executing command: $@"

# If no command is provided, default to starting the application
if [ $# -eq 0 ]; then
  echo "📋 No command provided, starting NestJS application..."
  echo "📋 Checking if dist/main.js exists..."
  if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js found, starting application..."
    exec node dist/main.js || {
      echo "❌ Application failed to start with exit code $?"
      exit 1
    }
  else
    echo "❌ dist/main.js not found!"
    ls -la dist/
    exit 1
  fi
else
  exec "$@" || {
    echo "❌ Application failed to start with exit code $?"
    exit 1
  }
fi
