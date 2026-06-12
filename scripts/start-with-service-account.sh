#!/usr/bin/env bash
set -euo pipefail

# Helper to start the backend server using a service account JSON stored in ./credentials
KEY_PATH="$(pwd)/credentials/service-account.json"

if [ ! -f "$KEY_PATH" ]; then
  echo "Service account JSON not found at $KEY_PATH"
  echo "Place your service account JSON at credentials/service-account.json and try again."
  exit 1
fi

export GOOGLE_APPLICATION_CREDENTIALS="$KEY_PATH"

echo "Using GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"

echo "Starting backend server..."
npm run server
