# Security Hardening — Apply Checklist

**Status: PREPARED, NOT APPLIED.** Re-verified live against project
`rrslhxigqtfllunmowcy` on 2026-07-01 (advisor + `pg_policies` + a full repo
`.rpc()` grep). Everything below is ready to run the moment you sign off.

> **The one rule:** nothing here touches your live database until you say go.
> Security/access-control changes are applied deliberately, by you (or with your
> explicit "apply it"), never automatically.

Right now is the **cheapest** time to apply this: every table is empty and no
real users exist, so there is nothing to break. The order still matters for the
guest-test flow — follow it top to bottom.

---

## What's ready in the repo

| File | Does | Verified |
|------|------|----------|
| `supabase/migrations/20260627000001_guest_auth_hardening.sql` | Guards `handle_new_user()` for anonymous sign-ins; closes the `assessment_responses` cross-session read/write hole | live: 2 `IS NULL` policies still present ✅ |
| `supabase/migrations/20260627000000_security_hardening_draft.sql` | Revokes `anon`/`authenticated` on `api_keys` + `training_data`; revokes EXECUTE on 5 helper functions | live: no `.rpc()` call sites anywhere ✅ |
| `supabase/migrations/20260630000000_organizations_branding_column.sql` | Adds `organizations.branding jsonb` (per-tenant branding) | live: column absent ✅ |
| `supabase/config.toml` | `verify_jwt = true` for all 17 edge functions | ✅ |

---

## Order of operations

### A — Enable Anonymous Sign-ins  *(dashboard — you)*  🔑 PREREQUISITE
Authentication → Sign In / Providers (or Settings) → **Allow anonymous sign-ins → ON**.
Guests get a real `auth.uid()`, so the existing `user_id = auth.uid()` rules
cover them. **Must be ON before Step B**, or guest mode breaks instead of
becoming secure.

### B — Apply `20260627000001_guest_auth_hardening.sql`  *(SQL — I can run)*
Depends on A. Fixes the biggest hole: today any caller can read/write **every**
anonymous session's responses.

### C — Apply `20260627000000_security_hardening_draft.sql`  *(SQL — I can run)*
Locks `api_keys` and `training_data` to service-role only; revokes 5 safe helper
functions. Independent — but run it in this pass.

### D — Apply `20260630000000_organizations_branding_column.sql`  *(SQL — I can run)*
Additive column for per-tenant branding. Independent and harmless.

### E — Turn on "Verify JWT" for the edge functions  *(dashboard — you)*
Depends on A + B (guests need the anonymous JWT before their audio upload is
required to carry one). Edge Functions → each function → **Verify JWT → ON** for
the 14 currently open. `config.toml` already encodes this, so a future
`supabase functions deploy` sets it automatically instead.

### F — Delete the `assessor_manager` duplicate  *(dashboard — you)*
Edge Functions → **`assessor_manager`** (underscore) → Delete. Keep
**`assessor-manager`** (hyphen). No app code calls the underscore version
(verified — all call sites use the hyphen).

### G — Auth config quick wins  *(dashboard — you)*
- OTP expiry → **under 1 hour** (Authentication → Settings).
- **Leaked-password protection → ON** (HaveIBeenPwned).
- **Upgrade Postgres** (Settings → Infrastructure) — outstanding security patches.

### H — Re-run the security advisor and verify
Confirm `api_keys` / `training_data` are gone from the anon-exposed list and the
5 revoked functions no longer appear.

---

## What will *still* appear in the advisor afterwards — and why that's correct

Not everything goes green, by design:

- **6 app tables still "exposed"** (`assessment_sessions`, `assessment_responses`,
  `assessor_reviews`, `organizations`, `profiles`, `prompts`). They must stay
  readable so the app works; **RLS restricts the rows**, which is the real
  perimeter. "Discoverable" ≠ "readable data".
- **3 helper functions still executable** (`is_admin_or_assessor`,
  `get_current_user_role`, `get_current_user_organization`). They are called
  *inside* RLS policies. Postgres checks EXECUTE against the calling role even
  inside a policy, so revoking them would raise "permission denied" across
  nearly every table for every user. Locking them needs a different approach
  (move to an unexposed schema), tested on a branch — out of scope here.

---

## Known follow-ons (separate decisions, not in these migrations)

- **Cross-device results link** — `AssessmentResults.tsx` loads a result by
  `?sessionId=` with no auth check. Closing the RLS hole (Step B) means a guest
  opening their link on another device can no longer load it. Needs a
  signed/short-lived results token before it can be fixed.

---

## When you're ready

Say **"apply the security migrations"** and I'll run **B, C, D** through the
Supabase connection (that is your sign-off), then walk you click-by-click through
**A, E, F, G** — the Auth/Functions/Infra settings I can't reach from here.

Best practice if you want zero risk: apply on a **Supabase branch** first, re-run
the advisor, click through one guest test end-to-end, then promote to production.
