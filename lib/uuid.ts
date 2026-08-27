const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guards every "look up by id" query fed directly from a URL path segment
// (e.g. /products/[id]). Without this, a non-UUID id (a typo, a bot probing
// URLs, someone hand-editing the address bar) reaches Postgres as an
// invalid uuid literal, which errors instead of just returning no rows —
// turning what should be a clean 404 into an unhandled 500.
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
