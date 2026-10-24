---
name: api-conventions
description: HTTP API conventions for this project (status codes, error shape, pagination). Load when adding or changing an endpoint.
---
## Rules
- Success: 200 (read), 201 (create), 204 (delete, empty body).
- Client errors return `{ "errors": ["message", ...] }` with status 400; missing resources return `{ "error": "not found" }` with 404.
- List endpoints accept `?limit=` and `?offset=` (defaults: limit 20, max 100, offset 0) and return a plain array.
- Always add a test in `test/app.test.js` for each new status code path.
