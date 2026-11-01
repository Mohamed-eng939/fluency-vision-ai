/**
 * Generate an RFC-4122 v4 UUID that works even outside a secure context.
 *
 * `crypto.randomUUID()` (and `crypto.subtle`) are only exposed in **secure
 * contexts**. An HTTPS page embedded in a NON-secure parent — e.g. our test in an
 * `http://` partner portal iframe — is itself not a secure context, so
 * `crypto.randomUUID` is `undefined` there and calling it throws
 * "crypto.randomUUID is not a function", which was aborting session init.
 *
 * `crypto.getRandomValues` IS available in insecure contexts, so we fall back to
 * it (and, as a last resort, to `Math.random`). Prefer this helper over
 * `crypto.randomUUID()` everywhere a UUID is generated on the client.
 */
export function safeRandomUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
  } catch {
    /* fall through to the manual builder */
  }

  const bytes = new Uint8Array(16);
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
  } catch {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // RFC 4122 §4.4: set the version (4) and variant (10xx) bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
