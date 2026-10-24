#!/usr/bin/env bash
# Workshop installer for macOS / Linux. Idempotent: skips what is already installed.
# Usage: ./setup/install.sh [--local] [--cloud]   (default: both)
set -euo pipefail

want_local=false; want_cloud=false
for a in "$@"; do case "$a" in --local) want_local=true;; --cloud) want_cloud=true;; esac; done
if ! $want_local && ! $want_cloud; then want_local=true; want_cloud=true; fi

MODEL="${WORKSHOP_MODEL:-gemma4:e4b}"
say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

say "Node.js (needed by the demo project and for npm-based installs)"
if command -v node >/dev/null; then echo "node $(node -v) ok"; else
  echo "Node.js >= 20 is missing. Install it from https://nodejs.org (or: brew install node)"; exit 1; fi

say "OpenCode"
if command -v opencode >/dev/null; then echo "opencode $(opencode --version) already installed"; else
  # V2 installer. If this URL ever 404s, fall back to: npm install -g @opencode/cli
  curl -fsSL https://opencode.ai/v2/install | bash || npm install -g @opencode/cli
  echo "Open a NEW terminal (or 'source ~/.zshrc') if 'opencode' is not found yet."
fi

if $want_local; then
  say "Ollama + local model ($MODEL)"
  if ! command -v ollama >/dev/null; then
    if command -v brew >/dev/null; then brew install ollama
    else curl -fsSL https://ollama.com/install.sh | sh; fi
  fi
  curl -fs http://localhost:11434/api/tags >/dev/null 2>&1 || {
    echo "Starting 'ollama serve' in the background..."
    (nohup ollama serve >/dev/null 2>&1 &); sleep 3; }
  ollama pull "$MODEL"
fi

if $want_cloud; then
  say "Cloud provider"
  echo "Nothing to install. Inside OpenCode run /connect and pick a provider (see setup/SETUP.md)."
fi

say "Done. Verify with: ./setup/check.sh"
