#!/bin/bash

# Port to check
PORT=3000
echo "[pre-test] Checking if port $PORT is in use..."

PIDS=$(lsof -t -i:$PORT)

if [ -n "$PIDS" ]; then
  echo "[pre-test] Port $PORT is in use by PIDs: $PIDS. Checking server health..."
  
  # Try to curl the root URL with a 2-second timeout
  STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 2 http://localhost:$PORT/ 2>/dev/null)
  
  if [ -z "$STATUS" ] || [ "$STATUS" = "000" ] || [ "$STATUS" = "failed" ]; then
    echo "[pre-test] Server on port $PORT is unresponsive (status: $STATUS). Force-killing process(es)..."
    for pid in $PIDS; do
      if ps -p $pid > /dev/null; then
        echo "[pre-test] Killing PID $pid..."
        kill -9 $pid 2>/dev/null
      fi
    done
    sleep 1
    echo "[pre-test] Port $PORT cleared successfully."
  else
    echo "[pre-test] Server on port $PORT is healthy (HTTP $STATUS). Reusing existing server."
  fi
else
  echo "[pre-test] Port $PORT is free. Ready for test run."
fi

# Check if auth files are fresh and export PLAYWRIGHT_SKIP_SETUP
if node -e "
  const fs = require('fs');
  const checkFresh = (p) => {
    if (!fs.existsSync(p)) process.exit(1);
    const c = JSON.parse(fs.readFileSync(p,'utf-8'));
    const exp = (c.cookies||[]).find(x=>x.name==='grip_store_access_token_expires_at');
    if (!exp || Number(exp.value) < Date.now() + 300000) process.exit(1);
  };
  checkFresh('./playwright/src/fixtures/.auth/admin.json');
  checkFresh('./playwright/src/fixtures/.auth/user.json');
" 2>/dev/null; then
  export PLAYWRIGHT_SKIP_SETUP=true
  echo "[pre-test] Auth fresh — setup will be skipped"
fi
