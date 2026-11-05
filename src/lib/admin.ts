import "server-only";

/**
 * The admin area is open in development. In production it needs
 * ADMIN_KEY in the environment and ?key=<ADMIN_KEY> in the URL.
 */
export function adminAllowed(key?: string | null) {
  const expected = process.env.ADMIN_KEY;
  if (expected) return key === expected;
  return process.env.NODE_ENV !== "production";
}
