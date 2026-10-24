import { createServer } from "node:http";
import { handle } from "./app.js";

const port = process.env.PORT ?? 3000;

createServer((req, res) => {
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    let body;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      res.writeHead(400, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: "invalid JSON" }));
    }
    const { status, body: out } = handle(req.method, req.url, body);
    res.writeHead(status, { "content-type": "application/json" });
    res.end(out === null ? undefined : JSON.stringify(out));
  });
}).listen(port, () => console.log(`bookmarks-api on http://localhost:${port}`));
