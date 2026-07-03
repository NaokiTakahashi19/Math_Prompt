#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
pid_file=".run/server.pid"

if [ ! -f "$pid_file" ]; then
  echo "local server supervisor is not running"
  exit 0
fi

pid="$(cat "$pid_file" 2>/dev/null || true)"
if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
  kill "$pid"
  echo "local server supervisor stopped: ${pid}"
else
  echo "stale pid file removed"
fi

rm -f "$pid_file"
