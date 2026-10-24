import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/app.js";
import { reset } from "../src/store.js";

beforeEach(reset);

const sample = { url: "https://opencode.ai", title: "OpenCode", tags: ["ai"] };

test("POST creates a bookmark", () => {
  const res = handle("POST", "/bookmarks", sample);
  assert.equal(res.status, 201);
  assert.equal(res.body.id, 1);
});

test("GET lists bookmarks and filters by tag", () => {
  handle("POST", "/bookmarks", sample);
  handle("POST", "/bookmarks", { url: "https://nodejs.org", title: "Node", tags: ["js"] });
  assert.equal(handle("GET", "/bookmarks").body.length, 2);
  assert.equal(handle("GET", "/bookmarks?tag=js").body.length, 1);
});

test("DELETE removes only the requested bookmark", () => {
  handle("POST", "/bookmarks", sample);
  handle("POST", "/bookmarks", { ...sample, title: "Second" });
  handle("POST", "/bookmarks", { ...sample, title: "Third" });
  assert.equal(handle("DELETE", "/bookmarks/2").status, 204);
  const titles = handle("GET", "/bookmarks").body.map((b) => b.title);
  assert.deepEqual(titles, ["OpenCode", "Third"]);
});

test("rejects a URL that is not http(s)", () => {
  const res = handle("POST", "/bookmarks", { ...sample, url: "not a url" });
  assert.equal(res.status, 400);
});

test("rejects a missing title", () => {
  const res = handle("POST", "/bookmarks", { url: "https://a.com" });
  assert.equal(res.status, 400);
});
