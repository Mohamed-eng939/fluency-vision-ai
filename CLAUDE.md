# LinguaSpeak AI — Project Context (CLAUDE.md)

> Read this first. It's the durable context for the spoken-English placement test.
> Detailed procedures live in the two imported docs at the bottom.

## What this product is
An automated CEFR spoken-English placement test. Flow: **audio → transcription → scoring (Grammar / Fluency / Vocabulary) → CEFR result → human assessor review & override.**
- Owner ("LinguaHouse") is building it first for **Upedia** placement; later for **HR screening** and **universities**.
- **White-label:** external organizations use it under their own brand. The owner's identity must never appear in a client's instance.
- Long-term: extend beyond CEFR to **Upedia's own scale**; grow accuracy from **human-reviewed data → ML**; eventually rival SpeechAce-tier pronunciation scoring.

## Scope & honesty boundaries (do not violate)
- Scoring today is **heuristics + external APIs, not ML**. Never present it as ML or claim ML-level accuracy.
- Accuracy is **earned** via data + validation, not built. Build the data flywheel and a validation harness; never fabricate or hardcode scores.
- User-facing views show **only three engine-backed criteria: Grammar, Fluency, Vocabulary.** Do not reintroduce the removed criteria (pronunciation, coherence, prosody, syntax) into user-facing views.

## Architecture
- **Frontend:** Vite + React + TypeScript + Tailwind + shadcn/ui.
- **Backend:** Supabase (Postgres + RLS + Edge Functions). Project ref: `rrslhxigqtfllunmowcy`.
- **Speech service:** separate **Python FastAPI** app (WhisperX transcription + Montreal Forced Aligner). Has a Dockerfile. Cannot run on Netlify/Vercel — needs a container host.
- **Scoring:** grammar via external API (`grammar-proxy`), fluency via speech-rate math, vocabulary via CEFR word-list lookup.

## Live database — trust this, not `schema.sql`
8 tables (currently all empty): `organizations, profiles, prompts, assessment_sessions, assessment_responses, assessor_reviews, api_keys, training_data`.
- ⚠️ The repo's `schema.sql` is **stale** and describes tables the app doesn't use. Reconcile against the live DB / generated types, never `schema.sql`.
- `training_data` exists but is **empty and unwired** — the ML pipeline has no data yet.

## Edge functions
- **Auth ON** (`verify_jwt=true`): `admin-manager`, `assessment-manager`, `assessor-manager`.
- **Auth OFF** (`verify_jwt=false`, 14 functions) — several sensitive: `audio-processor`, `get-session-audio-files`, `file-manager`, `session-manager`, `response-handler`, `profile-manager`, `grammar-proxy`, `fluency-proxy`, plus others.
- ⚠️ **Duplicate:** `assessor_manager` (underscore, auth OFF) is an unauthenticated copy of `assessor-manager` (hyphen, auth ON). Delete the underscore one.

## Known problems (priority order)
1. **Build is broken** — `NodeJS.Timeout` used in browser code; `require()` in an ESM/Vite project. Fix before anything deploys.
2. **Security holes** (close before real users): `api_keys` readable by `anon`; 14 unauthenticated functions; the duplicate function; SECURITY DEFINER helpers callable by `anon`; weak auth config. Exact SQL + lists in the runbook import below.
3. **Mocked service:** `scoreOverrideService.ts` persists nothing (console.log only) yet coexists with the real save path in `AssessmentReviewModal.tsx`. Collapse to one real path.
4. **`training_data` unwired** — no human-vs-system labels captured yet.
5. **Result-view drift** — test-taker / assessor / report views must stay aligned to the same 3 criteria and one data source.

## Current priorities
- **P0:** green build.
- **P1:** apply the security runbook (review before running; do not auto-apply destructive/security SQL).
- **P1 (data flywheel):** on every assessor review, write one `training_data` row: `transcript, audio_path, features, system_cefr, human_cefr, is_overridden`. Retain the audio + transcript.
- **P2 (white-label):** branding comes from the `organizations` row (name, logo, colors), resolved per tenant at app boot — not hardcoded. New front-end shell is described in the integration doc below.
- **P2 (deploy):** frontend on Netlify/Vercel (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); Python speech service on a container host; custom domain + HTTPS.
- **Later:** swappable scoring scale (CEFR now → Upedia scale via config, not a rewrite); validation study (agreement vs. known-level speakers); multi-prompt assessments.

## Engineering principles to preserve
- **White-label by data:** owner branding never renders in a tenant instance; brand is per-organization data.
- **Swappable scale:** scoring output maps through a scale layer so CEFR ↔ Upedia's scale is configuration.
- **Human-in-the-loop:** every result reviewable; the system-vs-human label is the training signal.
- **One source of truth:** all three result views read identical criteria + CEFR logic.
- **Security:** the anon key is public by design; **RLS is the real perimeter** and must be correct. Default new edge functions to authenticated.

## Conventions
- TypeScript + ESM (no `require()`). React function components + hooks. Tailwind core utilities + shadcn/ui.
- Reuse existing hooks: `useAudioRecorder` / `useRecordingFlow` (mic + voice-activity stop), `usePronunciationApi` + scoring services, `useSupabaseStorage`.

## If rebuilding from scratch
Keep the same stack and the principles above, but bake in from day one: multi-tenant `organizations` + per-tenant branding; an API-key gateway for the SaaS path (separate from JWT user auth); a server-side scoring-engine function (vocabulary + CEFR aggregation) that calls the grammar/fluency proxies; `training_data` wired on review; and **authentication on by default** for every function. Preserve the 3-criteria model and the human-review loop.

## First actions for Claude Code
1. Read the repo; summarize structure; reconcile with the live Supabase schema (ignore `schema.sql`).
2. Fix the build (P0).
3. Draft the security migration from the runbook and present it for the developer's approval — **do not apply security or destructive changes without explicit human sign-off.**

## Imported detail docs
@docs/Deployment-and-Security-Runbook.md
@docs/READ-ME-FOR-DEVELOPER.md
