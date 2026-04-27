#!/usr/bin/env bash
set -euo pipefail

CLOUD_NAME="dnqev5lr6"
PRESET="keur-bally"
ENDPOINT="https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIRS=("$ROOT/public/images/products" "$ROOT/public/images/packs")

ok=0
fail=0

for dir in "${DIRS[@]}"; do
  for file in "$dir"/*.{jpg,jpeg,png,webp}; do
    [ -f "$file" ] || continue
    name=$(basename "$file")
    echo -n "→ $name ... "
    response=$(curl -s -X POST "$ENDPOINT" \
      -F "upload_preset=${PRESET}" \
      -F "file=@${file}")
    url=$(echo "$response" | grep -o '"secure_url":"[^"]*"' | sed 's/"secure_url":"//;s/"$//')
    if [ -n "$url" ]; then
      echo "OK"
      echo "   $url"
      ok=$((ok+1))
    else
      echo "FAIL"
      echo "   $response"
      fail=$((fail+1))
    fi
  done
done

echo ""
echo "Done. Success: $ok, Failed: $fail"
