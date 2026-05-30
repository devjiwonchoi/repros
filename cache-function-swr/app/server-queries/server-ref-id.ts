const SERVER_REFERENCE = Symbol.for('react.server.reference')

/** Reads the React server-reference id ($$id), available on the server only. */
export function getServerReferenceId(fn: unknown): string {
  if (typeof fn !== 'function') {
    throw new Error('fn is not a function')
  }

  if ((fn as { $$typeof?: symbol }).$$typeof !== SERVER_REFERENCE) {
    throw new Error('fn is not a server function')
  }

  if (!('$$id' in fn)) {
    throw new Error('fn does not have a $$id')
  }

  return fn.$$id as string
}
