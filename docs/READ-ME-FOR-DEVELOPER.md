# White-label assessment front-end — developer note

Hi — this is the front-end **foundation** for the spoken-English placement test. It's a starting point to integrate into the existing Vite + React + Supabase repo, not a finished screen. Please read the two short "what it is / isn't" sections before wiring anything.

## What the file is
`WhiteLabel-Assessment-Preview.jsx` — a single, self-contained React component showing the learner-facing flow: **Welcome → Recording → Scoring → Results**, with a working **white-label theming layer**.

The whole visual identity is driven by one `brand` object (`name`, `initials`, `tagline`, `primary`, `primaryDark`, `accent`, `tint`). Colours flow through CSS variables (`--brand`, etc.) set on the root, so swapping the brand re-skins everything. The three result criteria are the engine-backed ones only: **Grammar, Fluency, Vocabulary** (CEFR).

## What it is NOT (please don't ship as-is)
- **Not wired** to Supabase, the WhisperX/MFA speech service, auth, or real scoring. `SAMPLE_RESULT` and the timer are placeholders to demonstrate the results view.
- The **dark "Preview" strip and brand switcher at the top are dev-only scaffolding** — remove them for a live single-tenant deployment (they exist so the client can see the re-branding effect).
- Fonts load from Google Fonts via `@import`; swap to self-hosted if you prefer no external requests.

## Integration steps
1. Drop the component into the app and treat it as the assessment shell (replace/merge with the current welcome + recording + results screens).
2. **Make `BRANDS` come from the database, not code.** Add branding columns to `organizations` (e.g. `display_name`, `logo_url`, `color_primary`, `color_primary_dark`, `color_accent`, `color_tint`). Resolve the active tenant at boot (by subdomain, path, or API key for the SaaS path) and load that one brand into the same object shape. The component doesn't change — only the data source does.
3. Wire the screens to the hooks that already exist in the repo:
   - Recording → `useAudioRecorder` / `useRecordingFlow` (real mic + VAD silence stop already exist).
   - Submit/score → the existing grammar/fluency/vocabulary path (`grammar-proxy`, `fluency-proxy`, vocabulary analysis) via `usePronunciationApi` / the scoring services.
   - Persist → `useSupabaseStorage` (and please also write a row to `training_data` at human-review time — see the security/data brief).
4. Replace `SAMPLE_RESULT` with the real per-response result object (overall CEFR + the three criteria + notes).
5. Remove the preview strip; gate the brand switcher out of production builds.

## White-label principle to preserve
The platform owner's identity (LinguaHouse) must **never** render inside a client's branded instance. Keep all owner branding out of tenant views; the footer/header should only ever show the tenant's `brand.name`.

## Accessibility floor already in place
Visible keyboard focus, `prefers-reduced-motion` respected, responsive layout. Please keep these when integrating.

---
*Foundation delivered for integration. The continued build is: per-tenant branding from the DB, real audio + scoring wiring, auth, and the security fixes tracked separately.*
