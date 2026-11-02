#!/bin/bash
# Germany Migration Intelligence Dashboard Launch Script
set -e

cd "$(dirname "$0")"

echo "=========================================================="
echo " 🇩🇪 德国移民数据智能分析平台 (Germany Migration Dashboard)"
echo "=========================================================="
PY_BIN="python3"
if [ -x "/opt/homebrew/bin/python3" ]; then
  PY_BIN="/opt/homebrew/bin/python3"
fi

echo "1. Checking environment..."
$PY_BIN --version

echo "2. Validating local Destatis official datasets..."
$PY_BIN etl/validate_data.py

echo "3. Starting Web Server on http://localhost:8080 ..."
open "http://localhost:8080" 2>/dev/null || true
$PY_BIN server.py
