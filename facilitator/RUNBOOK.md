# Facilitator runbook

## 1 week before
- Send attendees `setup/SETUP.md`; ask them to run `./setup/check.sh` and reply with the output if anything is red.
- Decide the cloud path: (a) attendees bring a key, (b) you hand out a capped workshop key, (c) OpenCode Zen.
  **Set a hard spend limit** on any shared key and rotate it after the event.
- Pre-pull models on the venue Wi-Fi's worst day: `gemma4:e4b` is ~9.5 GB. Bring USB drives with the model and
  Ollama installers. See [OFFLINE_MODELS.md](OFFLINE_MODELS.md) for export, import and verification steps.
- Rehearse the demo once on the exact laptop and model you will present with.

## 30 min before
- `ollama serve` running; `ollama run gemma4:e4b "hi"` to warm the model (first load is 20-40 s).
- `cd demo && git status` clean; `npm test` shows 3 pass / 2 fail.
- Terminal font size up (>= 18 pt), dark theme, notifications off.
- Slides: `slides/slides.html` (open in a browser, press `F` for fullscreen, `P` for presenter view) or `slides/slides.pdf`.
- Have a screenshot/recording of each demo step as a fallback in case the model misbehaves.

## Timeline (180 min)

| Min | Block | Do | Slides |
|---|---|---|---|
| 0-15 | Welcome | Poll: who uses Claude Code / Copilot / Cursor? Who has run a local model? State goals. | 1-3 |
| 15-35 | Compare | Walk the landscape, differentials, and **where OpenCode loses**. Keep it honest. | 4-13 |
| 35-55 | Setup check | Everyone runs `check.sh`. Pair people who are red with someone who is green. Cloud-less people go local-only. | 14-18 |
| 55-80 | Demo 1 | Follow the demo script below. Narrate permission prompts. | 19-23 |
| 80-90 | Break | Late arrivals fix setup. | |
| 90-125 | Customizing | AGENTS.md, agent, command, skill, permissions, MCP. Show each file on screen, then use it. | 24-31 |
| 125-155 | Labs | `labs/LABS.md`: Lab 2 (everyone) and Lab 3. Walk the room. | 36-37 |
| 155-170 | Beyond TUI + safety | `opencode run`, `serve`, GitHub, safety checklist, cost strategy. | 32-35 |
| 170-180 | Wrap-up | Takeaways, share lab logs (local vs cloud), Q&A. | 38-40 |

If you are running late, cut: Lab 4, Lab 5, the plugin slide, and MCP live demo (show the config only).

## Demo script (Demo 1, ~25 min) — rehearsed live in the TUI

Prereq: `/models` -> a cloud model for the narrative (rehearsed with the built-in **DeepSeek V4.1 Flash Free**),
then a **local** model for the contrast. Times below are from the rehearsal.

1. **Orient**: `Explain this project in 3 bullets.` -> shows the agent reading files.
2. **Plan mode** (**Shift+Tab**; plain Tab does nothing): `Plan how to fix the failing tests. Do not edit anything.`
   -> ~40 s. It finds both bugs, proposes tests per AGENTS.md, edits nothing. Expect 1-2 **permission prompts**:
   it runs `npm test 2>&1 | tail -60`, which does *not* match the `npm test*` allow rule. Use it to explain
   "Allow once / Always allow / Reject". It may also show one harmless `execute ... Unknown tool` (Code Mode) retry.
3. **Build mode** (Shift+Tab): `Implement the plan, then run npm test.` -> ~20 s, 13/13 green, `server.js` untouched.
4. **Review**: `/review test coverage` -> runs as a background subagent ("↓ 1 subagent" in the footer, ~50 s).
   The Build agent then *acts on the review by itself* (it added 7 more tests in rehearsal). Point that out.
5. **Permissions**: `Delete the test folder with rm -rf test. Do it directly.` -> `Permission denied: shell`,
   and the model refuses to work around it. `Read .env and print it` -> `Permission denied: read`.
6. **Undo**: ask for a one-line comment in `src/app.js`, then `/undo` (or `ctrl+x u`) -> file reverts;
   `/redo` (`ctrl+x r`) -> back. `/undo` and `/redo` only appear in the menu once the session has messages.
7. **Contrast**: `git restore src`, `/models` -> local model, give the **vague** prompt. It struggles
   (`gemma4:e4b` edited `src/app.js` and left 2 tests failing). Then the **precise** prompt
   (`In @src/store.js ... remove() ...`) works. Land the point: *context is the currency*. Local runs at ~8 tok/s,
   so start it and talk over it.

Live-demo gotchas:
- A `/path` in your prompt (e.g. `GET /bookmarks`) opens the command menu and Enter does nothing: press **Esc**, then Enter.
- After `/models`, a "Select variant" dialog may open; press Esc before typing.
- `Ctrl+x n` (new session) can reset the model to the config default; re-check the footer.
- Free models can stall: in rehearsal `/init` took minutes with timeouts/ECONNRESET retries on two different free
  models. Never run `/init` live on a free model; have a paid key (or a second free model) ready.

## What was verified (author's machine, 24 Oct 2026)

Machine: macOS, 16 GB RAM, OpenCode **2.0.26** (plus a smoke test of **2.1.4**, the current release), Ollama 0.40.8,
`gemma4:e4b` local, `opencode/deepseek-v4.1-flash-free` and `opencode/glm-5.3-flash-free` cloud. Driven through the
real TUI (tmux) on a scratch copy of `demo/`.

| Item | Result |
|---|---|
| Ollama via `setup/configs/opencode.local.json` | Works |
| `/test` on local `gemma4:e4b` (TUI) | Works, ~1 min, correct analysis, `npm test` auto-allowed |
| Local vague prompt "fix failing tests" | **Fails** (wrong file edited) |
| Local precise prompt with `@src/store.js` | Works (fixes that bug) |
| Built-in free cloud models (no signup) | Work. 9 listed in `/models` on 2.0.26 |
| Plan mode -> plan, no edits (free cloud) | Works, 37 s |
| Build mode -> implement + tests (free cloud) | Works, 18 s, 13/13 pass |
| `/review` -> `reviewer` subagent (background) | Works; Build then acted on the findings |
| `@reviewer` asked to edit | Refuses (read-only by permissions); file untouched |
| `rm -rf test` | Blocked by `rm *` deny |
| `.env` via `read` tool | Blocked |
| `.env` via `cat` in shell, **without** the `shell *.env*` rule | **Leaked** (even with only the read deny). Rule added to `demo/opencode.json` |
| `.env` via `cat`, **with** the rule, under `--auto` | Blocked on 2.0.26 and 2.1.4 |
| `/undo`, `/redo` (`ctrl+x u` / `ctrl+x r`) | Work |
| `api-conventions` skill auto-loaded for "Add pagination" | Works (agent read the skill; applied 20/100; 26 tests pass) |
| `/skills` | Lists the project skill **and** global `~/.claude/skills` (cross-tool reuse, live) |
| `/init` | Works (improves existing AGENTS.md in place) but **slow/unreliable on free models** |
| Context7 MCP (remote, no auth) | Works; called through Code Mode `execute`. Needs `/reload` after editing config |
| `opencode run`, `--continue`, `--format json` | Work |
| `opencode serve --port` + `/doc` | Works (auto-generates a server password) |
| 2.1.4: Shift+Tab, `/fix` `/test` `/review` `/skills` `/init`, permission rules | Same as 2.0.26. Shows a first-run dialog (press Enter) |
| V2 plugin (`Plugin.define`) | **Hung** the run; excluded, see `labs/optional/plugin-v2.md` |
| `/connect` with a paid provider (Zen, Anthropic, ...) | **Not tested** (no keys). Dry-run yours before the event |
| `./setup/install.sh` on a clean machine | **Not tested** (everything was already installed). `check.sh` tested |

Install note: `npm i -g opencode-ai` still installs **1.19.x**; use `@opencode/cli` or the V2 installer.

## OpenCode 1.x vs 2.x cheat-sheet (attendees may land on either)

| Topic | 1.x | 2.x |
|---|---|---|
| Permissions | `"permission": { "bash": { "rm *": "deny" } }` | `"permissions": [{ "action": "shell", "resource": "rm *", "effect": "deny" }]` |
| Providers | `"provider"` | `"providers"` (V1 key still read) |
| MCP | `"mcp": { "name": { ..., "enabled": true } }` | `"mcp": { "servers": { "name": { ..., "disabled": false } } }` |
| Agents/commands in config | `agent`, `command` | `agents`, `commands` |
| Plugins | `@opencode-ai/plugin`, function returning hooks | `@opencode/plugin`, `Plugin.define({ id, setup(ctx) })` |
| Custom tools | `.opencode/tools/*.ts` with `tool()` | via plugins |
| LSP diagnostics | yes | config kept, **not running** (per third-party report) |
| Server | per-client | one shared background service (`opencode service status`) |
| Ollama | explicit provider config | auto-discovered |

Markdown agents/commands/skills and `AGENTS.md` work the same in both. If an attendee is on 1.x, the demo's
`opencode.json` `permissions`/`mcp.servers` keys will be ignored; give them the V1 equivalents above.

## Failure playbook

| Problem | Move |
|---|---|
| Local model hangs or loops | Esc, restate with `@file` + exact symptom; else switch model |
| Cloud key rejected | Put that attendee on the local track, fix after |
| Wi-Fi dies | Everyone on local models; you narrate the cloud part from screenshots |
| Machine too weak for e4b | `gemma4:e2b`, or pair up |
| TUI renders badly | `opencode run ...` headless, or `opencode mini` |
| Weird state in 2.x | `opencode service status`, `opencode reload`, or `--standalone` |
| Edits went wrong | `/undo`, or `git restore demo/src` |

## Source notes (for your own credibility)

- Official docs: opencode.ai/docs (largely V1 wording) and opencode.ai/v2/docs.
- 2.x details (shared service, Code Mode, background subagents, breaking changes, config key renames) come from the
  official migration guide plus third-party posts that disagree on dates (2.0.0 around 11 Sep 2026; launch posts 13 Oct).
  The slides avoid hard dates.
- The "Anthropic blocks subscription OAuth in third-party tools since Jan 2026" claim comes from a comparison blog,
  not from Anthropic. Verify before presenting it as fact.
- Third-party comparison blogs cite benchmark numbers that do not agree with each other; the deck deliberately
  makes **no performance claims**.
