#!/usr/bin/env bash
# Pre-flight check. Prints OK/FAIL per item and exits non-zero if a required one fails.
MODEL="${WORKSHOP_MODEL:-gemma4:e4b}"
fail=0
ok()   { printf '  \033[32mOK\033[0m    %s\n' "$*"; }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$*"; fail=1; }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$*"; }

echo "Required"
if command -v node >/dev/null; then
  major=$(node -v | sed 's/v\([0-9]*\).*/\1/')
  [ "$major" -ge 20 ] && ok "node $(node -v)" || bad "node $(node -v) is too old (need >= 20)"
else bad "node not found"; fi

if command -v opencode >/dev/null; then ok "opencode $(opencode --version 2>&1 | head -1)"
else bad "opencode not found (run ./setup/install.sh)"; fi

command -v git >/dev/null && ok "git $(git --version | awk '{print $3}')" || bad "git not found"

echo "Local track (Ollama)"
if command -v ollama >/dev/null; then
  ok "ollama $(ollama --version 2>&1 | awk '{print $NF}')"
  if curl -fs http://localhost:11434/api/tags >/dev/null 2>&1; then
    ok "ollama server reachable on :11434"
    ollama list 2>/dev/null | awk 'NR>1{print $1}' | grep -qx "$MODEL" \
      && ok "model $MODEL pulled" || warn "model $MODEL not pulled (ollama pull $MODEL)"
  else warn "ollama server not running (ollama serve)"; fi
else warn "ollama not installed (only needed for the local track)"; fi

echo "Cloud track"
cloud=false
for v in ANTHROPIC_API_KEY OPENAI_API_KEY OPENROUTER_API_KEY GEMINI_API_KEY; do
  [ -n "${!v}" ] && { ok "$v is set"; cloud=true; }
done
for f in "$HOME/.local/share/opencode/auth.json"; do
  [ -s "$f" ] && { ok "credentials saved via /connect"; cloud=true; }
done
$cloud || warn "no cloud credentials found yet (run /connect inside opencode)"

echo "Demo project"
if [ -f "$(dirname "$0")/../demo/package.json" ]; then
  (cd "$(dirname "$0")/../demo" && npm test >/dev/null 2>&1) \
    && warn "demo tests pass (expected: 2 failing tests at the start)" \
    || ok "demo tests fail as planned (2 bugs to fix)"
fi

exit $fail
