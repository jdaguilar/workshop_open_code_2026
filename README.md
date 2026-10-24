# OpenCode Workshop 2026

A 3-hour, hands-on workshop on [OpenCode](https://opencode.ai), the open-source AI coding agent: what it is, how it
differs from Claude Code and friends, how to set it up with **local (Ollama)** and **cloud** models, and a demo
project to practice its main features.

## Repo map

| Path | What |
|---|---|
| [slides/slides.md](slides/slides.md) | The deck (Marp Markdown). Built: `slides.html`, `slides.pdf` |
| [setup/SETUP.md](setup/SETUP.md) | Attendee setup guide (send before the workshop) |
| [setup/install.sh](setup/install.sh), [setup/check.sh](setup/check.sh) | Installer and pre-flight check |
| [setup/configs/](setup/configs) | Ready-made `opencode.json` for local, cloud, or both |
| [demo/](demo) | Bookmarks API with 2 planted bugs + `.opencode/` agents, commands, skill + permissions + MCP |
| [labs/LABS.md](labs/LABS.md) | Hands-on exercises with local-vs-cloud comparison |
| [facilitator/RUNBOOK.md](facilitator/RUNBOOK.md) | Timeline, demo script, failure playbook, **what was and was not verified** |

## Quick start

```bash
./setup/install.sh && ./setup/check.sh
cd demo && npm test      # 3 pass, 2 fail on purpose
opencode
```

## Rebuild the slides

```bash
cd slides
npx @marp-team/marp-cli slides.md -o slides.html          # open in browser
npx @marp-team/marp-cli slides.md --pdf -o slides.pdf     # needs Chrome/Chromium installed
```

## Status

Rehearsed live in the TUI on OpenCode 2.0.26 (smoke-tested on 2.1.4), macOS, with a local Ollama model and the
built-in free cloud models. See the verification table in the runbook; paid-provider `/connect` was not tested.
