---
description: Fix the failing tests (usage - /fix [optional hint])
---
Current test output:

!`npm test 2>&1 | tail -60`

Fix the root cause of the failing tests in `src/` (never weaken or delete tests).
Extra hint from the user: $ARGUMENTS
Run `npm test` again at the end and report the result.
