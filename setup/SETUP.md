# Setup guide (do this BEFORE the workshop, ~15 min)

You can follow the **local track** (free, offline, private), the **cloud track** (stronger models), or both.
Doing both is recommended: the workshop compares them side by side.

## 0. Requirements

| Item | Needed for | Notes |
|---|---|---|
| Node.js 20+ | demo project | `node -v` |
| git | everything | `git --version` |
| A modern terminal | OpenCode TUI | iTerm2, WezTerm, Ghostty, Alacritty, Kitty |
| 8 GB RAM free (16 GB total) | local track | for a ~4B-parameter model; see the table below |
| ~10 GB disk | local track | model weights |
| A provider API key or account | cloud track | see section 3 |

Windows: use WSL2 (Ubuntu) and run everything inside it.

## 1. One-shot install (macOS / Linux)

```bash
git clone <this-repo> && cd workshop_open_code_2026
./setup/install.sh            # both tracks
./setup/install.sh --local    # only Ollama + model
./setup/install.sh --cloud    # only OpenCode
./setup/check.sh              # verify
```

Manual equivalents:

```bash
# OpenCode (v2 line, the one this workshop uses)
curl -fsSL https://opencode.ai/v2/install | bash
#   or: npm install -g @opencode/cli     (NOT `opencode-ai`: that npm package is still V1, 1.19.x)
#   or: brew install opencode          (Homebrew's default formula is V2)

# Ollama (local track)
brew install ollama            # or: curl -fsSL https://ollama.com/install.sh | sh
ollama serve &                 # skip if the desktop app already runs it
ollama pull gemma4:e4b
```

> **Version note.** OpenCode 2.x replaced 1.x in October 2026 under the same `opencode` command, and the
> two are not installable side by side. The V1 installer (`curl -fsSL https://opencode.ai/install | bash`) may still
> give you 1.x. Check with `opencode --version`. This workshop was tested live on **2.0.26** and **2.1.4**. Config written in the
> V1 style (`provider`, `permission`, `agent`, `command`) is still read by V2, and the demo uses the V2 style
> (`permissions`, `mcp.servers`). Differences are listed in `facilitator/RUNBOOK.md`.

## 2. Local track: Ollama

### Pick a model for your machine

| Your RAM | Model | Pull command | What to expect |
|---|---|---|---|
| 8 GB | `gemma4:e2b` | `ollama pull gemma4:e2b` | Chat, explain code, tiny edits. Slow tool use. |
| 16 GB | `gemma4:e4b` **(workshop default, tested)** | `ollama pull gemma4:e4b` | Reads/edits files and runs commands. Needs precise prompts. |
| 32 GB+ | `qwen3-coder:30b` (19 GB, 256K context, tool support) | `ollama pull qwen3-coder:30b` | Noticeably better at multi-file work. Not tested by the author. |

### Connect OpenCode to Ollama

OpenCode 2.x auto-discovers Ollama at `http://127.0.0.1:11434`, so after `ollama serve` + `ollama pull`
the model simply shows up in `/models`. If it does not (or you are on 1.x), use the explicit config:

```bash
mkdir -p ~/.config/opencode
cp setup/configs/opencode.local.json ~/.config/opencode/opencode.json
```

The file registers the provider with `@ai-sdk/openai-compatible` and `baseURL: http://localhost:11434/v1`
and sets `"model": "ollama/gemma4:e4b"`.

### Local-model gotchas (read these, they cost people an hour)

1. **Tool calls fail or the model "forgets" files** -> the context window is too small. Raise it:
   `OLLAMA_CONTEXT_LENGTH=32768 ollama serve` (more RAM used). Start at 16k-32k.
2. **First prompt takes 20-40 s** -> the model is loading into memory. Warm it: `ollama run gemma4:e4b "hi"`.
3. **The model edits the wrong file** -> small models need a pointer. Use `@src/store.js` in your prompt.
4. **Thinking models are slow** -> that is normal; the reasoning tokens are the wait.
5. Keep other heavy apps closed; local inference is memory-bandwidth bound.

## 3. Cloud track: pick ONE provider

Start OpenCode, run `/connect`, choose a provider, paste the key, then `/models` to pick a model.

| Option | How | Cost |
|---|---|---|
| **Built-in free models (easiest)** | Nothing to set up: `/models` shows models marked `Free` (e.g. `opencode/deepseek-v4.1-flash-free`) | Free. Can be slow or time out at busy times; read their data policy before using private code. |
| **OpenCode Zen** | `/connect` -> OpenCode Zen -> sign in at opencode.ai/auth, add billing, copy key | Pay-as-you-go, $20 minimum top-up, no markup. Models tested by the OpenCode team. |
| **Anthropic API key** | `/connect` -> Anthropic -> paste `sk-ant-...` (or `export ANTHROPIC_API_KEY=...`) | Per token |
| **OpenAI / Google / OpenRouter** | `/connect` -> provider -> key | Per token |
| **GitHub Copilot** | `/connect` -> GitHub Copilot -> device login | Your existing subscription |
| **Workshop key (if provided by the facilitator)** | `export ANTHROPIC_API_KEY=<given on the day>` | Free for you |

Notes:
- Use an **API key**, not your Claude Pro/Max login. Third-party tools using subscription OAuth tokens have been
  rejected by Anthropic since January 2026 (reported by third-party sources; check the provider's current terms).
- Credentials are stored locally by OpenCode (`/connect`) or read from environment variables. Never commit keys.
- Set a monthly spend limit in the provider console before the workshop.
- Example config with a default cloud model: `setup/configs/opencode.cloud.json`.
  Both tracks in one file: `setup/configs/opencode.cloud-and-local.json`.

## 4. Smoke test (2 minutes)

```bash
cd demo
npm test            # expect: 3 pass, 2 fail  (the planted bugs)
opencode            # TUI opens
```

In the TUI:
1. On first launch some versions show a "what's new" dialog: press Enter to dismiss it.
2. `/models` -> choose your model (a local one or a cloud/free one).
3. Type: `Explain what this project does in 3 bullet points.`
4. You get an answer? You are ready.

Headless variant (useful when the TUI misbehaves):

```bash
opencode run --standalone -m ollama/gemma4:e4b "Reply with exactly: pong"
```

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| `opencode: command not found` | Open a new terminal; or add `~/.opencode/bin` to `PATH` |
| Model not listed in `/models` | `curl localhost:11434/api/tags` must work; otherwise `ollama serve`. Else use the explicit config (section 2). |
| `connection refused :11434` | Ollama is not running |
| Cloud: `401` / `invalid key` | Re-run `/connect`; check for a trailing space in the pasted key |
| Everything is very slow | Use a smaller model, close apps, or switch to the cloud track |
| TUI is garbled | Use a supported terminal; try `opencode mini` or `opencode run` |
| Enter does nothing after typing `/bookmarks` or another `/path` | The command menu opened. Press Esc, then Enter |
| Free model times out / `ECONNRESET` | Switch to another free model in `/models`, or use your own key |
| Changed `opencode.json` but nothing changed | Run `/reload` (the background service caches config) |
| Stuck/odd state in 2.x | `opencode service status`, then `opencode reload` |
