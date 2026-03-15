#!/bin/bash
# Switch Prisma schema between SQLite (local) and PostgreSQL (production)
# Usage: ./scripts/switch-db.sh [sqlite|postgres]

set -e

TARGET=${1:-sqlite}
PRISMA_DIR="prisma"
SCHEMA_FILE="$PRISMA_DIR/schema.prisma"
SQLITE_SCHEMA="$PRISMA_DIR/schema.sqlite.prisma"
POSTGRES_SCHEMA="$PRISMA_DIR/schema.postgres.prisma"

echo "🔄 Switching Prisma schema to: $TARGET"

if [ "$TARGET" = "sqlite" ]; then
  if [ ! -f "$SQLITE_SCHEMA" ]; then
    echo "❌ SQLite schema not found: $SQLITE_SCHEMA"
    exit 1
  fi
  cp "$SQLITE_SCHEMA" "$SCHEMA_FILE"
  echo "DATABASE_URL=\"file:./dev.db\"" > .env
  echo "NEXTAUTH_SECRET=\"dev-secret-for-testing-only-12345678\"" >> .env
  echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env
  
elif [ "$TARGET" = "postgres" ]; then
  if [ ! -f "$POSTGRES_SCHEMA" ]; then
    echo "❌ PostgreSQL schema not found: $POSTGRES_SCHEMA"
    exit 1
  fi
  cp "$POSTGRES_SCHEMA" "$SCHEMA_FILE"
  echo "DATABASE_URL=\"postgresql://user:pass@host:5432/db?sslmode=require\"" > .env
  echo "DIRECT_URL=\"postgresql://user:pass@host:5432/db?sslmode=require\"" >> .env
  echo "NEXTAUTH_SECRET=\"change-this-in-production\"" >> .env
  echo "NEXTAUTH_URL=\"https://your-domain.com\"" >> .env
  
else
  echo "❌ Unknown target: $TARGET"
  echo "Usage: $0 [sqlite|postgres]"
  exit 1
fi

# Regenerate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo "✅ Done! Schema switched to $TARGET"
echo ""
echo "Next steps:"
if [ "$TARGET" = "sqlite" ]; then
  echo "  1. npx prisma db push"
  echo "  2. npm run dev"
else
  echo "  1. Update .env with your Neon/PostgreSQL credentials"
  echo "  2. npx prisma db push"
  echo "  3. npm run build"
fi
