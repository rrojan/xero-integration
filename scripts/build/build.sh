#!/usr/bin/env bash
set -Eeuo pipefail

echo "👷 Running build script for environment: ${VERCEL_ENV:-local}"

# Validate that all required environment variables are set for environment
pnpm tsx scripts/build/validateEnv.ts

# Apply database migrations
pnpm drizzle-kit migrate

# Build the project with turbopack
pnpm next build --turbopack
