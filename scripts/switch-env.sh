#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-}"

if [[ -z "$PROFILE" ]]; then
  echo "Usage: ./scripts/switch-env.sh <dev|prod>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_FILE="$ROOT_DIR/config/env/$PROFILE.env"
TARGET_FILE="$ROOT_DIR/.env.local"

if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "Environment profile not found: $SOURCE_FILE"
  exit 1
fi

cp "$SOURCE_FILE" "$TARGET_FILE"
echo "Switched environment profile to '$PROFILE' -> $TARGET_FILE"
echo "Active NEXT_PUBLIC_API_URL:"
grep '^NEXT_PUBLIC_API_URL=' "$TARGET_FILE" || true
