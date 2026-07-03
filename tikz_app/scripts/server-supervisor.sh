#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
mkdir -p .run

child=""
stop() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] stopping local server supervisor"
  if [ -n "$child" ]; then
    kill "$child" 2>/dev/null || true
  fi
  exit 0
}

trap stop INT TERM

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] starting node server.js"
  node server.js &
  child="$!"
  set +e
  wait "$child"
  status="$?"
  set -e
  child=""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] server exited with status ${status}; restarting in 2s"
  sleep 2
done
