import { supabase } from '@/integrations/supabase/client';

function statusOf(error: any): number | undefined {
  const ctx = error?.context;
  if (ctx && typeof ctx.status === 'number') return ctx.status;
  if (typeof error?.status === 'number') return error.status;
  return undefined;
}

const expired = () => ({
  data: null as any,
  error: new Error('Your session has expired — please sign in again.'),
});

/**
 * Invoke a JWT-gated edge function (the `admin-*` / `assessor-*` functions) with the
 * caller's access token attached **explicitly**.
 *
 * These functions authenticate via the caller's Supabase access token. We do NOT rely on
 * `functions.invoke()` to attach it implicitly — that has proven unreliable in the browser
 * and surfaces as a `401 "Unauthorized"` on key creation / dashboard load even while the
 * user is signed in. Instead we read the current session and set
 * `Authorization: Bearer <token>` on the request ourselves. On a 401 we refresh the
 * session once and retry; with no session we surface a clear "sign in again" message.
 *
 * Usage mirrors `supabase.functions.invoke` minus the `{ body }` wrapper:
 *   const { data, error } = await invokeEdge('admin-api-keys', { action: 'create', name });
 */
export async function invokeEdge<T = any>(
  name: string,
  body: unknown = {},
): Promise<{ data: T | null; error: any }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return expired();

  const call = (token: string) =>
    supabase.functions.invoke(name, { body, headers: { Authorization: `Bearer ${token}` } });

  let res = await call(session.access_token);
  if (res.error && statusOf(res.error) === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (!refreshed?.session?.access_token) return expired();
    res = await call(refreshed.session.access_token);
  }
  return res as { data: T | null; error: any };
}
