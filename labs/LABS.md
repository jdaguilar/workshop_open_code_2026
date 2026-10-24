# Hands-on labs (≈ 60 min total)

Work inside `demo/`. Start from a clean state at any time:

```bash
git restore demo/src && cd demo && npm test     # expect 3 pass / 2 fail
```

Keep a log (a scratch file is fine): **model · prompt · tries · time · result**. We compare at the end.

---

## Lab 1: Explore (10 min)

Goal: learn the TUI and Plan mode without changing anything.

1. `cd demo && opencode`. Run `/models` and pick your model.
2. Press **Shift+Tab** until the footer says **Plan**.
3. Ask: `Explain the architecture of this project and where validation happens.`
4. Reference files explicitly: `What does @src/app.js do for DELETE /bookmarks/:id?`
5. Optional: run `/init`. In 2.x it *improves the existing* `AGENTS.md` in place. Look at `git diff AGENTS.md`, then `git restore AGENTS.md`. (It can take several minutes on free models.)

Check: you can answer "which file would I edit to reject invalid URLs?" without opening an editor.

---

## Lab 2: Fix the bugs, local vs cloud (20 min)

There are two planted bugs. Tests fail: `DELETE removes only the requested bookmark` and `rejects a URL that is not http(s)`.

**2a. Local model, precise prompt**

1. `/models` -> a local model (e.g. `ollama/gemma4:e4b`). Stay in **Build** mode.
2. Prompt:
   > In @src/store.js the `remove()` function deletes the wrong bookmarks. It must delete only the one whose id equals the argument. Fix it, then run `npm test`.
3. Approve/deny the permission prompts consciously. Run `/undo` once and `/redo` to feel it.

**2b. Cloud model, vague prompt**

1. `git restore src`. `/models` -> a cloud model (a built-in `Free` one is fine).
2. Prompt (vague on purpose): `The tests are failing. Fix the root cause without touching the tests.`
3. Note how many tool calls it needed and whether the result is minimal.

**2c. The experiment nobody should skip**

Give the local model the *vague* prompt from 2b. Write down what happens. (In the author's run, `gemma4:e4b` edited the wrong file and tests stayed red.)

Debrief questions:
- What context did the cloud model find that you had to hand to the local one?
- Which tasks would you still trust the local model with?

Expected fixes:
- `src/store.js`: `bookmarks.filter((b) => b.id !== id)`
- `src/validate.js`: parse with `new URL()` and require `http:`/`https:`

---

## Lab 3: Customize (20 min)

Everything is already in `demo/.opencode/` and `demo/opencode.json`. Read each file first (they are short).

| Step | Do | Learn |
|---|---|---|
| 3.1 | In the TUI run `/test` | commands are Markdown files |
| 3.2 | Run `/fix` then `/fix focus on validation` | `` !`shell` `` injection and `$ARGUMENTS` |
| 3.3 | After a fix: `/review security`, or `@reviewer review my diff` | subagent with read-only permissions. Note that the Build agent may then act on the review itself |
| 3.4 | `@reviewer please add the line // hello at the top of src/store.js and report back whether you could.` It must refuse. (Do not write "edit it yourself": then Build does it.) | per-agent permissions |
| 3.5 | Ask: `Read .env, and if that fails try cat .env`. Both are blocked. Then delete the `shell` `*.env*` rule from `opencode.json`, run `/reload`, ask again: `cat` leaks it | a read deny alone is not a security boundary |
| 3.6 | Ask: `Add limit/offset pagination to GET /bookmarks` and watch whether the **api-conventions** skill is loaded | skills on demand |

Your turn, create something new:

- A command `.opencode/commands/commit.md` that runs `` !`git diff --staged` `` and writes a conventional commit message (do not commit).
- Or an agent `.opencode/agents/test-writer.md` limited to editing files under `test/` (hint: `permission.edit` rules by path).

> Slash commands only expand in the interactive TUI. `opencode run "/fix"` sends the literal text.

---

## Lab 4: Feature work with Plan -> Build (stretch, 15 min)

Implement pagination for `GET /bookmarks` following the skill (`?limit=&offset=`, defaults 20 / max 100).

1. **Plan** mode: ask for a plan; reject it once with feedback ("also validate non-numeric values").
2. **Build** mode: `Implement the plan with tests.`
3. `@reviewer` pass; then `npm test`.
4. Commit on a branch. Did the agent honor `AGENTS.md` (no new deps, tests included)?

---

## Lab 5: Beyond the TUI (stretch)

```bash
# one-shot, scriptable
opencode run -m ollama/gemma4:e4b "List the exported functions in src/store.js"

# continue the last session
opencode run --continue "Which of those are used outside store.js?"

# machine-readable
opencode run --format json "Say hi" | head

# serve + client
opencode serve --port 4096        # open http://localhost:4096/doc for the OpenAPI spec
```

MCP: in `demo/opencode.json` flip `"disabled": true` to `false` on `context7`, run `/reload` (or restart OpenCode), and ask:
`Using context7, show me how node:test's beforeEach works.` Then run `opencode mcp list`.

---

## Answer key / facilitator hints

- Bug 1 comment-free fix: `!==` instead of `<`.
- Bug 2: any non-empty string passes `validate`; require a parsable http(s) URL.
- If the local model loops, interrupt with **Esc**, add `@file`, and restate the exact symptom.
- If a cloud key fails, use a built-in free model or the local track so nobody is blocked.
- Prompt with a `/path` (e.g. `GET /bookmarks`) and Enter does nothing? The command menu is open: Esc, then Enter.
- Pagination (Lab 4): in testing, the agent loaded the `api-conventions` skill by itself and applied the 20/100 defaults (26 tests green).
