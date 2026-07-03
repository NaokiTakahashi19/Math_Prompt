#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
mkdir -p .run

pid_file=".run/server.pid"
log_file=".run/server.log"

if [ -f "$pid_file" ]; then
  old_pid="$(cat "$pid_file" 2>/dev/null || true)"
  if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
    echo "local server supervisor is already running: ${old_pid}"
    exit 0
  fi
fi

nohup ./scripts/server-supervisor.sh >> "$log_file" 2>&1 &
echo "$!" > "$pid_file"
echo "local server supervisor started: $(cat "$pid_file")"
echo "log: $(pwd)/${log_file}"
