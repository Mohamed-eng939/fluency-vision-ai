import { supabase } from '@/integrations/supabase/client';

function statusOf(error: any): number | undefined {
  const ctx = error?.context;
  if (ctx && typeof ctx.status === 'number') return ctx.status;
  if (typeof error?.status === 'number') return error.status;
  return undefined;
}

/**
 * Invoke a JWT-gated edge function (the `admin-*` / `assessor-*` functions) with
 * a guaranteed-fresh access token.
 *
 * These functions authenticate via the caller's Supabase access token and return
 * 401 when it has gone stale — which happens when an admin tab is left open (or
 * backgrounded) long enough that the silent token refresh is missed, while the
 * UI still shows the user as logged in. The direct symptom is "creating a key /
 * loading stats fails" even though nothing is wrong with the request.
 *
 * We defend against that here:
 *   1. `getSession()` returns the stored session and refreshes an expired access
 *      token before returning — so this alone fixes the common stale-token case.
 *   2. If the call still comes back 401, we force a refresh and retry once.
 *   3. If there is genuinely no session, we surface a clear "sign in again"
 *      error instead of a confusing 401.
 *
 * Signature mirrors `supabase.functions.invoke` minus the `{ body }` wrapper:
 *   const { data, error } = await invokeEdge('admin-api-keys', { action: 'create', name });
 */
export async function invokeEdge<T = any>(
  name: string,
  body: unknown = {},
): Promise<{ data: T | null; error: any }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { data: null, error: new Error('Your session has expired — please sign in again.') };
  }

  let res = await supabase.functions.invoke(name, { body });
  if (res.error && statusOf(res.error) === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed?.session) {
      res = await supabase.functions.invoke(name, { body });
    } else {
      return { data: null, error: new Error('Your session has expired — please sign in again.') };
    }
  }
  return res as { data: T | null; error: any };
}
