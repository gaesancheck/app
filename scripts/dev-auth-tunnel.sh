#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if ! command -v cloudflared >/dev/null 2>&1; then
    echo "cloudflared is required. Install it with: brew install cloudflared" >&2
    exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v curl >/dev/null 2>&1; then
    echo "This script requires Node.js and curl." >&2
    exit 1
fi

if [[ ! -f .env.local ]]; then
    echo ".env.local is missing. Create it with: cp .env.example .env.local" >&2
    exit 1
fi

AUTH_PORT="$(node --env-file=.env.local -e 'process.stdout.write(process.env.AUTH_PORT || "3000")')"
if [[ ! "$AUTH_PORT" =~ ^[0-9]+$ ]]; then
    echo "AUTH_PORT in .env.local must be a port number." >&2
    exit 1
fi

TEMP_DIR="$(mktemp -d)"
TUNNEL_LOG="$TEMP_DIR/cloudflared.log"
TUNNEL_PID=""
AUTH_PID=""

cleanup() {
    local status=$?
    trap - EXIT INT TERM
    for pid in "$AUTH_PID" "$TUNNEL_PID"; do
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    for pid in "$AUTH_PID" "$TUNNEL_PID"; do
        if [[ -n "$pid" ]]; then
            wait "$pid" 2>/dev/null || true
        fi
    done
    rm -rf "$TEMP_DIR"
    return "$status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

cloudflared tunnel --no-autoupdate --url "http://127.0.0.1:${AUTH_PORT}" >"$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!

TUNNEL_URL=""
for _ in {1..60}; do
    TUNNEL_URL="$(sed -nE 's#.*(https://[[:alnum:]-]+\.trycloudflare\.com).*#\1#p' "$TUNNEL_LOG" | head -n 1 || true)"
    if [[ -n "$TUNNEL_URL" ]]; then
        break
    fi
    if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
        break
    fi
    sleep 1
done

if [[ -z "$TUNNEL_URL" ]]; then
    echo "Could not start a Cloudflare Quick Tunnel." >&2
    cat "$TUNNEL_LOG" >&2
    exit 1
fi

node - "$TUNNEL_URL" <<'NODE'
const fs = require("node:fs");
const file = ".env.local";
const tunnelUrl = process.argv[2];
let contents = fs.readFileSync(file, "utf8");

for (const key of ["PUBLIC_BASE_URL", "EXPO_PUBLIC_API_BASE_URL"]) {
    const assignment = new RegExp(`^${key}=.*$`, "m");
    if (assignment.test(contents)) {
        contents = contents.replace(assignment, `${key}=${tunnelUrl}`);
    } else {
        if (contents.length > 0 && !contents.endsWith("\n")) contents += "\n";
        contents += `${key}=${tunnelUrl}\n`;
    }
}

fs.writeFileSync(file, contents);
NODE

echo "Cloudflare URL: $TUNNEL_URL"
echo "Google callback: $TUNNEL_URL/v1/auth/oauth/google/callback"
echo "Updated PUBLIC_BASE_URL and EXPO_PUBLIC_API_BASE_URL in .env.local."

node --env-file=.env.local server/dev-oauth-server.mjs &
AUTH_PID=$!

AUTH_READY=0
for _ in {1..30}; do
    if curl --silent --show-error --fail "http://127.0.0.1:${AUTH_PORT}/health" >/dev/null 2>&1; then
        AUTH_READY=1
        break
    fi
    if ! kill -0 "$AUTH_PID" 2>/dev/null; then
        break
    fi
    sleep 1
done

if [[ "$AUTH_READY" != "1" ]]; then
    echo "OAuth server did not become ready on port ${AUTH_PORT}." >&2
    exit 1
fi

echo "OAuth server is ready on port ${AUTH_PORT}. Press Ctrl+C to stop both services."

while kill -0 "$TUNNEL_PID" 2>/dev/null && kill -0 "$AUTH_PID" 2>/dev/null; do
    sleep 1
done

echo "The tunnel or OAuth server exited unexpectedly." >&2
exit 1
