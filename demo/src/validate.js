// Input validation for new bookmarks.
export function validate(input) {
  const errors = [];
  if (!input || typeof input !== "object") return ["body must be a JSON object"];

  if (typeof input.url !== "string" || input.url.length === 0) {
    errors.push("url is required");
  }
  if (typeof input.title !== "string" || input.title.trim() === "") {
    errors.push("title is required");
  }
  if (input.tags !== undefined && !Array.isArray(input.tags)) {
    errors.push("tags must be an array");
  }
  return errors;
}
