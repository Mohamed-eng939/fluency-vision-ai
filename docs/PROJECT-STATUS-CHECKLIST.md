# LinguaSpeak / Upedia Placement Test — Feature Status & Roadmap

_Audit date: 2026-07-01. A living map of what works today and what's left to
reach the full vision (automated spoken-English placement → CEFR now, Upedia
scale next, human-reviewed data → ML later, white-label throughout)._

---

## 1. How the scoring actually works today

**Flow:** audio recording → transcript (WhisperX speech service on Render) →
three scoring engines → CEFR level → assessor review/override.

**The three engines are real** (heuristics + external APIs, not ML — as intended):

| Criterion | Engine | On failure |
|-----------|--------|-----------|
| **Grammar** | External API via `grammar-proxy` edge function | returns `null` (no fabricated fallback) ✅ |
| **Fluency** | `fluency-proxy` + speech-rate / syllable math | returns `null` (no fabricated fallback) ✅ |
| **Vocabulary** | CEFR word-list lookup (`analyzeCefrVocabulary`) | floors to `A1` on empty transcript |

There's also a **quality gate** (responses under 10 words are rejected with
"insufficient data for reliable scoring") and a simple **adaptive stop** (the
test can end early once the same level is scored 4 times in a row).

### ⚠️ The one real integrity problem — silent fallback scores
The honest engines above return `null` when they can't score. But the code path
that produces the **displayed** metrics (`scoreSpeakingResponse` →
`cefrToScore`, then `audioProcessingUtils`) converts a missing/failed score into
a **middle value** instead of surfacing the failure:

- `cefrToScore(null)` → **5** (≈ B1)
- `... || 7` fallbacks in the result builder
- removed criteria (pronunciation/prosody/syntax/coherence) hardcoded to **7**
  (not displayed, but still computed)
- a post-hoc "long-word ratio" bump nudges vocabulary/grammar up

**Why it matters:** if the grammar or fluency API is down or the transcript is
thin, the learner silently gets a plausible-looking **B1-ish** result rather than
an honest "couldn't score / needs review." That contradicts the project's
"never fabricate scores" rule, and — more importantly — it would **poison the
`training_data` and the agreement metric** the ML plan depends on. This is the
highest-value scoring fix (see §4, P0-b).

---

## 2. How the tester / admin bypass works

- **Trigger:** the keyboard shortcut **`Ctrl+Alt+D`** during an assessment
  toggles an on-screen **Admin Controls** panel.
- **What it exposes:** "Bypass Scoring Delay" (skips the artificial 30–90s
  processing animation) and "show raw scoring."
- **What it does NOT do:** it does not change, skip, or fake the actual scoring,
  and it does not bypass login or database security.
- **Gap:** it is **not gated by the admin role** — *any* test-taker who presses
  the shortcut sees it. The separate `[Admin: Bypass Processing Delay]` button
  is gated by an `isAdmin` prop, but the `Ctrl+Alt+D` panel is not.
- **Recommendation:** gate the shortcut behind the real `isAdmin` role (or strip
  it from production builds), the same way the runbook says to remove the
  dev-only preview strip. Low security risk, but it's dev scaffolding that
  shouldn't reach real candidates. (See §4, P2-e.)

**Auth/roles are otherwise solid:** roles are `learner` / `assessor` / `admin`
from `profiles.role`; `/admin/*` and `/assessor/*` are gated by `ProtectedRoute`.

---

## 3. What's AVAILABLE today (built & working)

- [x] End-to-end assessment flow: welcome → student info → mic test → timed
      recording → processing → results
- [x] Real microphone recording with voice-activity silence detection (VAD)
- [x] Speech-to-text service (WhisperX + Montreal Forced Aligner) **deployed on
      Render**, wired via `VITE_PRONUNCIATION_API_URL`
- [x] Three engine-backed criteria (Grammar / Fluency / Vocabulary) → CEFR
- [x] Adaptive early-stop + minimum-length quality gate
- [x] Prompts served from **Supabase** (62 rows: 38 original + 24 Upedia
      placement-ladder prompts), with a local fallback
- [x] Auth with roles (learner / assessor / admin); admin & assessor panels
      route-gated
- [x] Guest / no-signup flow via Supabase anonymous sign-in (code ready — needs
      the dashboard toggle, see §4)
- [x] Assessor review + override, writing the human-vs-system label to
      `training_data` (the ML flywheel)
- [x] Reports: CEFR badge, skills breakdown, radar, recommendations
- [x] White-label branding layer (`BrandingContext`) resolving per-tenant brand
      (needs the `branding` column live to be fully data-driven)
- [x] **Swappable scale layer** (CEFR ↔ Upedia Group/Private) — `src/lib/scales`
- [x] **Validation harness** (system-vs-human agreement) — `src/lib/validation`
- [x] Netlify deploy config (build + SPA routing)
- [x] Green build (P0 done)

---

## 4. What still NEEDS WORK (to reach the full vision)

### P0 — integrity & trust (do before real candidates)
- [ ] **a. Apply the security hardening** (prepped in
      `docs/SECURITY-APPLY-CHECKLIST.md`; not yet applied)
- [ ] **b. Fix silent fallback scores** — route displayed metrics through the
      honest `null`-returning engines; show "couldn't score / needs review"
      instead of a default 5/7. Collapse the duplicate scoring paths to one.
      _Protects both learner trust and the training data._

### P1 — go-live basics
- [ ] c. Enable **Anonymous Sign-ins** in Supabase (unlocks the guest flow)
- [ ] d. Deploy the front-end to Netlify (config ready; user-driven)
- [ ] e. Delete the `assessor_manager` duplicate edge function

### P2 — white-label & the Upedia scale (turn foundations into features)
- [ ] f. Apply the `organizations.branding` column migration, then insert the
      **Upedia** org row (logo/colours/name) → live re-branding
- [ ] g. Surface the **Upedia scale** on the assessor/admin/report views (the
      engine exists; this is a UI + product decision on where it shows)
- [ ] h. Surface the **agreement scoreboard** (validation harness) in an admin
      view — your "proof it works" number
- [ ] i. Gate the `Ctrl+Alt+D` tester bypass behind the admin role / strip from
      prod
- [ ] j. Wire a **real email service** (e.g. Resend) — `notification-manager` is
      currently a console-log mock

### P3 — the accuracy roadmap (the long game)
- [ ] k. **Placement-ladder flow** — use the 24 graded ladder prompts (A1→B2,
      precise bands, parallel forms) as an adaptive ladder; prompts exist, the
      ladder runner isn't wired yet
- [ ] l. **Validation study** — run known-level speakers (existing IELTS/CEFR)
      through the system, measure agreement (process, not code)
- [ ] m. **ML pipeline** — only after the flywheel accumulates enough
      human-reviewed rows; calibrate heuristics first, replace components later
- [ ] n. Extend the ceiling above **B2** if Upedia ever places C1/C2

### P4 — polish & hardening
- [ ] o. Custom domain + HTTPS + white-label subdomain routing
- [ ] p. **Cross-device results link** — needs a signed/short-lived results token
      (closing the RLS hole breaks the current `?sessionId=`-only link)
- [ ] q. **Dead-code cleanup** — large volumes of unused scorers
      (pronunciation/prosody/coherence/syntax) and orphan report components
      inflate the bundle (~2.1 MB) and obscure the real path
- [ ] r. Bundle code-splitting to cut initial load

---

_The two hardest pieces — a real speech pipeline and a real human-review loop —
already exist. The near-term work is honesty (P0-b), locking the doors (P0-a),
and turning the new scale/validation foundations into visible features (P2)._
