const SERVER_REFERENCE = Symbol.for('react.server.reference')

/**
 * Reads the React server-reference id (`$$id`) off a server action / `use cache`
 * function, or null if `fn` isn't a server reference. Shared so the Server
 * Component and the Client Component read the id exactly the same way.
 */
export function getServerReferenceId(fn: unknown): string | null {
  return typeof fn === 'function' &&
    (fn as { $$typeof?: symbol }).$$typeof === SERVER_REFERENCE
    ? ((fn as { $$id?: string }).$$id ?? null)
    : null
}
