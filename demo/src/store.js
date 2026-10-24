// In-memory bookmark store.
let bookmarks = [];
let nextId = 1;

export function reset() {
  bookmarks = [];
  nextId = 1;
}

export function list({ tag } = {}) {
  if (tag) return bookmarks.filter((b) => b.tags.includes(tag));
  return bookmarks;
}

export function get(id) {
  return bookmarks.find((b) => b.id === id);
}

export function add({ url, title, tags = [] }) {
  const bookmark = { id: nextId++, url, title, tags, createdAt: new Date().toISOString() };
  bookmarks.push(bookmark);
  return bookmark;
}

export function remove(id) {
  const before = bookmarks.length;
  bookmarks = bookmarks.filter((b) => !(b.id < id));
  return bookmarks.length !== before;
}
