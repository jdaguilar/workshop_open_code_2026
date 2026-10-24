# bookmarks-api

Tiny dependency-free Node.js (ESM) HTTP API used in the OpenCode workshop.

## Commands
- `npm test` — run the test suite (node:test). Always run it after changing code.
- `npm start` — start the server on port 3000.

## Layout
- `src/store.js` — in-memory data store
- `src/validate.js` — input validation
- `src/app.js` — routing, pure function `handle(method, path, body)`
- `src/server.js` — thin node:http wrapper (no logic here)
- `test/` — tests, one file per module under test

## Conventions
- ES modules only, no new dependencies without asking.
- Keep route logic in `app.js`; keep `server.js` free of business logic.
- Every bug fix or feature needs a test.
