# Deployment & Security Runbook — LinguaSpeak AI / Upedia placement test

Audience: the developer. Prepared from a **live read** of the Supabase project (nothing was modified). Apply security changes deliberately — ideally on a Supabase branch or staging first, then production.

**Project facts**
- Supabase project: `LinguaSpeak-AI` — ref `rrslhxigqtfllunmowcy` (region ap-south-1, Postgres 17).
- Stack: Vite + React + TS front-end · Supabase (Postgres + RLS + Edge Functions) · separate Python FastAPI speech service (WhisperX + Montreal Forced Aligner).
- Live tables (all 8 currently empty): `organizations, profiles, prompts, assessment_sessions, assessment_responses, assessor_reviews, api_keys, training_data`.

Deploy order is gated: **Step 0 → Step 1 → then the rest.** Do not put real users on it before Steps 0 and 1 are done.

---

## Step 0 — Fix the build (nothing deploys until this is green)
- [ ] Replace `NodeJS.Timeout` types used in browser code with `ReturnType<typeof setTimeout>` (or `number`).
- [ ] Replace `require()` with ESM `import` (Vite/ESM project).
- [ ] `npm run build` and `tsc --noEmit` both pass clean.

---

## Step 1 — Security hardening (urgent; do before any real users)

Findings below are from the live security advisor. Review each statement before running.

### 1a. Lock down the `api_keys` table (it's currently world-readable)
The advisor flags `public.api_keys` as SELECTable by **both `anon` and `authenticated`** roles via the auto-generated API. This is the table that will gate paid SaaS access — it must not be readable by clients.

```sql
-- Remove direct client read access; keys should only be touched by
-- service-role code inside edge functions (e.g. admin-manager / api-gateway).
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.api_keys FROM anon, authenticated;

-- training_data is ML/PII-adjacent; only admins/service role should read it.
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.training_data FROM anon, authenticated;
```
- [ ] Apply and confirm `api_keys` and `training_data` are no longer reachable with the anon key.
- [ ] Verify the **other** exposed tables (`assessment_sessions`, `assessment_responses`, `profiles`, `assessor_reviews`, `organizations`, `prompts`) are protected by **correct RLS** — i.e. a signed-in user can only read their own rows (and assessors/admins per role). The advisor warns they're discoverable; RLS is what actually protects the rows, so confirm the policies really scope by `user_id` / `organization_id`.

### 1b. Require auth on the edge functions that handle data
Of 17 edge functions, only **3** require a login (`admin-manager`, `assessment-manager`, `assessor-manager`). The other 14 have `verify_jwt = false`. Turn auth on for the sensitive ones (set `verify_jwt = true`, or implement explicit auth inside the function if it's called server-to-server).

**Require auth now (handle audio / files / sessions / PII):**
- [ ] `audio-processor` (accepts audio uploads — currently open)
- [ ] `get-session-audio-files` (serves stored audio — currently open)
- [ ] `file-manager`
- [ ] `session-manager`
- [ ] `response-handler`
- [ ] `profile-manager`

**Review case-by-case (may need JWT, an API key for the SaaS path, or service-to-service auth):**
- [ ] `grammar-proxy`, `fluency-proxy` (scoring proxies)
- [ ] `analytics-generator`, `notification-manager`, `personalized-feedback`, `prompt-manager`, `report-generator`

### 1c. Delete the duplicate function (it's an unauthenticated copy)
- [ ] Delete **`assessor_manager`** (underscore) — `verify_jwt = false`. Keep **`assessor-manager`** (hyphen) — `verify_jwt = true`. Update any call sites that point at the underscore version.

### 1d. Restrict the public-callable SECURITY DEFINER helper functions
These run with elevated rights and are currently executable by `anon`. They're used *inside* RLS policies (which still work after this change) — revoking direct call access is safe. Confirm none are intentionally called from the client via `supabase.rpc()` before revoking from `authenticated`.

```sql
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                       FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()              FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text)                    FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_assessor()                  FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_user_role()                 FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_user_organization()         FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.same_organization(uuid)                 FROM anon, authenticated;
-- Verify the app doesn't call this via RPC before revoking from authenticated:
REVOKE EXECUTE ON FUNCTION public.find_session_for_finalization(uuid, uuid) FROM anon;
```

### 1e. Auth configuration quick wins
- [ ] Reduce email OTP expiry to **under 1 hour** (Auth settings).
- [ ] Enable **leaked-password protection** (HaveIBeenPwned check).
- [ ] **Upgrade Postgres** — the current version has outstanding security patches (Settings → Infrastructure).

> Re-run the Supabase security advisor after these changes; aim for a clean report.

---

## Step 2 — Front-end (the website)
- [ ] Connect the GitHub repo to **Netlify or Vercel**. Framework: Vite. Build: `npm run build`. Publish dir: `dist`.
- [ ] Set environment variables in the host: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the publishable/anon key is public by design — safe to expose; security rests on RLS from Step 1).
- [ ] Confirm a successful production build and a working preview URL.
- [ ] Integrate the new white-label shell (`WhiteLabel-Assessment-Preview.jsx`) per its README.

## Step 3 — Speech service (the Python "ears")
- [ ] Netlify/Vercel can't run this — deploy the container (a `Dockerfile` exists) to a host that runs long processes: Fly.io, Render, Railway, Google Cloud Run, or a VPS.
- [ ] Note resource needs: `whisperx` + `torch` + Montreal Forced Aligner are heavy; CPU works but is slow — consider a GPU instance or generous CPU/RAM for acceptable latency.
- [ ] Protect it (it shouldn't be open to the world): an internal API key or network restriction, called only from your edge functions / backend.
- [ ] Point the front-end / edge functions at its URL via an env var.

## Step 4 — Domain, HTTPS, and white-label subdomains
- [ ] Attach a custom domain on the host; enable HTTPS (automatic on Netlify/Vercel).
- [ ] For white-label, plan tenant routing: a wildcard subdomain (`*.yourdomain.com`) or per-client custom domains, resolving the subdomain → the right `organizations` row → that tenant's branding at app boot.

## Step 5 — Wire the shell to the real backend
- [ ] Recording → existing `useAudioRecorder` / `useRecordingFlow` (real mic + VAD already implemented).
- [ ] Scoring → grammar/fluency/vocabulary path (`grammar-proxy`, `fluency-proxy`, vocabulary analysis).
- [ ] Persist → `useSupabaseStorage`.
- [ ] **Start the ML flywheel:** on every assessor review, write one row to `training_data` containing the transcript, audio path, raw features, the **system** CEFR and the **human** CEFR. The table exists and is empty — nothing populates it yet.
- [ ] Make branding load per-organization from the DB (not hardcoded), so onboarding a new client is data entry.

---

## Gates / sequencing
1. **Step 0** (green build) — blocks everything.
2. **Step 1** (security) — blocks real users; safe to test on a Supabase branch first.
3. Steps 2–4 can proceed in parallel once 0–1 are clear.
4. Step 5 turns the shell into a working product.

*Prepared from a live read of project `rrslhxigqtfllunmowcy`. No changes were applied to the database, functions, or auth settings.*
