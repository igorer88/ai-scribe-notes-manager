#!/bin/sh
set -e

echo "🚀 Starting AI Scribe Notes Manager..."

# Resolve database credentials from DATABASE_URL (preferred) or DB_* env vars
resolve_db_credentials() {
  if [ -n "$DATABASE_URL" ]; then
    echo "📋 Using DATABASE_URL for database configuration"

    # Strip scheme (postgres:// or postgresql://) and query string
    rest="${DATABASE_URL#*://}"
    rest="${rest%%\?*}"

    # Extract auth part (user:password@) if present
    case "$rest" in
      *@*)
        auth="${rest%%@*}"
        hostport_db="${rest##*@}"
        DB_USER="${auth%%:*}"
        DB_PASSWORD="${auth#*:}"
        ;;
      *)
        hostport_db="$rest"
        ;;
    esac

    # Split host:port/database
    DB_HOST="${hostport_db%%:*}"
    DB_PORT="5432"
    DB_NAME=""
    case "$hostport_db" in
      *:*/*)
        DB_PORT="${hostport_db%%/*}"
        DB_PORT="${DB_PORT##*:}"
        DB_NAME="${hostport_db#*/}"
        ;;
      *:*)
        DB_PORT="${hostport_db##*:}"
        ;;
      *)
        DB_HOST="$hostport_db"
        ;;
    esac
    DB_HOST="${DB_HOST:-postgres}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-scribe_notes_manager}"
  else
    echo "📋 Using DB_* environment variables for database configuration"
    DB_HOST="${DB_HOST:-postgres}"
    DB_PORT="${DB_PORT:-5432}"
    DB_USER="${DB_USER:-postgres}"
    DB_NAME="${DB_NAME:-scribe_notes_manager}"
  fi

  export DB_HOST DB_PORT DB_USER DB_NAME DB_PASSWORD
  echo "→ host=$DB_HOST port=$DB_PORT db=$DB_NAME user=$DB_USER"
}

psql_exec() {
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "$1" 2>/dev/null
}

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."

  local max_attempts=30
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if PGPASSWORD="$DB_PASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
      echo "✅ Database is ready!"
      return 0
    fi

    echo "Attempt $attempt/$max_attempts: Database not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
  done

  echo "❌ Database failed to start after $max_attempts attempts"
  exit 1
}

# Check if the schema exists by looking for the users table
db_has_schema() {
  local result
  result=$(psql_exec "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';")
  [ "${result:-0}" -gt 0 ]
}

# Check if the users table is empty (fresh DB, never seeded)
db_is_empty() {
  local result
  result=$(psql_exec "SELECT COUNT(*) FROM users;")
  [ "${result:-0}" -eq 0 ]
}

run_migrations() {
  echo "📦 Running migrations..."
  if NO_COLOR=true pnpm migration:run; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migrations failed"
    exit 1
  fi
}

run_seeders() {
  echo "🌱 Running seeders..."
  if NO_COLOR=true pnpm seed; then
    echo "✅ Seeders completed successfully"
  else
    echo "❌ Seeders failed"
    exit 1
  fi
}

# Run database initialization based on current DB state
init_database() {
  if db_has_schema; then
    echo "🔍 Schema already exists"
    echo "📦 Running migrations (idempotent, applies only pending ones)..."
    run_migrations
    if db_is_empty; then
      echo "🌱 Schema present but empty, seeding..."
      run_seeders
    else
      echo "📋 Database already initialized, skipping seeders..."
    fi
  else
    echo "🔍 No schema found, running migrations and seeding..."
    run_migrations
    run_seeders
  fi
}

# Main execution
resolve_db_credentials
wait_for_db
init_database

echo "🏁 Starting application..."

# If no command is provided, default to starting the application
if [ $# -eq 0 ]; then
  echo "📋 No command provided, starting NestJS application..."
  echo "📋 Checking if dist/main.js exists..."
  if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js found, starting application..."
    exec node dist/main.js
  else
    echo "❌ dist/main.js not found!"
    exit 1
  fi
else
  exec "$@" || {
    echo "❌ Application failed to start with exit code $?"
    exit 1
  }
fi