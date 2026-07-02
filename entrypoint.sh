#!/bin/sh
set -e

echo "==> Nuvvi Frontend Entrypoint <=="

ENV_CONFIG="/usr/share/nginx/html/env-config.js"
echo "window.__ENV__ = {" > "$ENV_CONFIG"
echo "  VITE_APP_NAME: \"${VITE_APP_NAME:-Nuvvi}\"," >> "$ENV_CONFIG"
echo "  VITE_APP_ENV: \"${VITE_APP_ENV:-development}\"," >> "$ENV_CONFIG"
echo "  VITE_API_BASE_URL: \"${VITE_API_BASE_URL:-http://localhost:8000}\"," >> "$ENV_CONFIG"
echo "  VITE_API_PREFIX: \"${VITE_API_PREFIX:-/api}\"," >> "$ENV_CONFIG"
echo "  VITE_ENABLE_3D: \"${VITE_ENABLE_3D:-true}\"" >> "$ENV_CONFIG"
echo "};" >> "$ENV_CONFIG"

echo "Generated env-config.js"
exec "$@"
