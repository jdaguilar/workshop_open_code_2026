// Request handler, framework-free so tests can call it directly.
import * as store from "./store.js";
import { validate } from "./validate.js";

export function handle(method, path, body) {
  const url = new URL(path, "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] !== "bookmarks") return { status: 404, body: { error: "not found" } };

  if (method === "GET" && parts.length === 1) {
    return { status: 200, body: store.list({ tag: url.searchParams.get("tag") }) };
  }

  if (method === "POST" && parts.length === 1) {
    const errors = validate(body);
    if (errors.length) return { status: 400, body: { errors } };
    return { status: 201, body: store.add(body) };
  }

  if (parts.length === 2) {
    const id = Number(parts[1]);
    const found = store.get(id);
    if (!found) return { status: 404, body: { error: "not found" } };
    if (method === "GET") return { status: 200, body: found };
    if (method === "DELETE") {
      store.remove(id);
      return { status: 204, body: null };
    }
  }

  return { status: 405, body: { error: "method not allowed" } };
}
