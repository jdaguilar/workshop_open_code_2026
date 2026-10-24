# Optional: plugins in OpenCode 2.x (API sketch, NOT validated)

The V2 plugin API per the official migration guide (https://opencode.ai/v2/docs/build/plugins/migrate-v1):

- Package `@opencode/plugin`; local plugins live in `.opencode/plugins/<name>/index.ts` (a **directory** with `index.ts`).
- Register them in config: `"plugins": [{ "package": "./.opencode/plugins/guard" }]`
- V1 plugins (`export const X: Plugin = async () => ({...})`) do **not** run on V2.

```ts
// .opencode/plugins/guard/index.ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "guard",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (event) => {
      const input = event.input as { filePath?: string }
      if (event.tool === "read" && input.filePath?.includes(".env")) {
        throw new Error("Reading .env files is blocked")
      }
    })
  },
})
```

**Author's test result:** on OpenCode 2.0.26 a plugin written exactly like this loaded ("loading plugin" in the logs)
but `opencode run` then hung until killed. Removing the plugin fixed it. It may be a bug in that build, a
missing `@opencode/plugin` install, or my misuse. Therefore the workshop enforces the same protection with a
**`permissions` deny rule**, which was tested and works. Try the plugin only as an optional experiment, and
run with `--print-logs --log-level debug` to see what happens.

V1 equivalent (OpenCode 1.x, from the 1.x docs):

```ts
import type { Plugin } from "@opencode-ai/plugin"
export const EnvProtection: Plugin = async () => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "read" && output.args.filePath.includes(".env")) throw new Error("Do not read .env files")
  },
})
```
