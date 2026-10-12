# Upedia Placement Test — Go‑Live & Team Guide

**Live app:** https://english-placement-test.lovable.app
**Audience:** Global Admin (owner), Testers, and Sales Agents.

The platform is built and published. This guide has three parts: the owner's
go‑live checklist, then a short script for Testers and for Sales Agents that you
can hand to each team directly.

---

## Part A — Owner go‑live checklist

| # | Action | Where | Needed for |
|---|--------|-------|------------|
| 1 | Add `RESEND_API_KEY` and `RESEND_FROM` (a verified sender) | Supabase → Edge Functions → Secrets | **Emails** (tester "new test", agent lead events, "email report to student"). The in‑app bell already works without this. |
| 2 | Upgrade the Supabase project to **Pro** | Supabase → Billing | Stops the free‑tier **auto‑pause** that takes the whole app offline mid‑pilot. |
| 3 | Create the team accounts and set roles | Admin → **User Management** | Testers and Sales Agents can log in. |
| 4 | *(Before public enrollment)* apply the Step‑1 security hardening | see `docs/security-step1-DRAFT.sql` | Locks the backend before large/unknown traffic. Fine to pilot with known invitees first. |
| 5 | Run the **dry run** (Part E) | the live app | Confirms the whole loop end‑to‑end before real students. |

**Roles** (what the labels map to): **Global Admin** = you (sees everything,
can review/override). **Tester** = grades tests and writes reports. **Student**
= takes the test, views their report. **Sales Agent** = manages leads, sends
links, delivers reports.

---

## Part B — Tester guide (hand this to your 13 testers)

**What you do:** review the speaking tests that land in your queue and turn each
into a Upedia placement + performance report.

1. **Log in** at the live app → you land on your **Tester** dashboard.
2. Your queue **fills automatically** — tests are shared out one at a time, fairly,
   up to **15 per tester per day** (resets at Cairo midnight). You don't pick or
   claim; it's assigned to you.
3. Open a test → **listen** to each audio answer and read the transcript.
4. Grade **Grammar, Fluency, Vocabulary** and confirm the **overall CEFR** level
   (you can override the suggested level — a reason is required if you do).
5. In **Upedia Placement & Performance Report**:
   - Pick the **Program** (General English, Conversation, Teens, Kids, Jolly
     Phonics — or Business / IELTS Prep).
   - Pick **Private / Group** (Group is only offered for General, Conversation,
     Teens) and the **Level** — the **Band fills in automatically**.
   - Write **Goals**, **Feedback**, and **Other Programs** (programs the student
     is eligible to switch to). The student's own stated reason is shown to help.
   - If a **teen scored above A2**, tick the box to recommend the Adults /
     Conversation track — it adds a note to the report.
6. Click **Preview report** to see exactly what the student will get, then
   **Submit**.
7. Done — the report is saved; the student and their sales agent can now see it,
   and the 🔔 bell notifies the right people.

**Notes:** Jolly Phonics is used for **reading** checks (kids/teens/adults).
**Business & IELTS Prep produce no report** — the student is placed from their
General (or equivalent) score; just record the placement.

---

## Part C — Sales Agent guide (hand this to your sales team)

**What you do:** bring in leads, send them the test link, and deliver their
report when it's ready.

1. **Log in** → you land on your **Sales Agent** dashboard.
2. Add leads two ways:
   - **Import sheet** — upload your `.xlsx`/`.csv`. The system reads Name, Phone,
     second phone, Nationality, Notes and Source automatically (duplicates by
     phone are skipped).
   - **Add lead** — enter one by hand; optionally set the **intended program**
     and **Private/Group**.
3. For each lead, click **WhatsApp** → it opens WhatsApp with a ready message
   containing that lead's **one‑time test link** (bilingual). Send it.
4. Watch the **status** move on its own:
   **New → Link sent → Signed up → Test submitted → Reviewed.**
5. When a lead reaches **Reviewed**, the **Report** button appears → **view**,
   **Download** (print/PDF), or **Email to student**.
6. The 🔔 bell tells you when your lead signs up, submits, and when their report
   is ready.

---

## Part D — What the student experiences (for reference)

1. Opens the WhatsApp link → a branded Upedia welcome.
2. Creates an account — the form has an **English / العربية** toggle (right‑to‑left
   in Arabic).
3. Mic check and prep screen (also bilingual) → a **"you're about to begin"**
   message shown **in both languages**.
4. Speaks their answers to a short series of prompts → thank‑you screen.
5. Later: logs in → **My Results** → views and downloads their report once the
   tester has finished.

---

## Part E — Dry run before inviting real students (≈10 min)

1. In **User Management**, make one test **Tester** and one test **Sales Agent**
   (or use your own + one teammate).
2. As the **agent**, add a lead with **your own phone number**, then click
   **WhatsApp** and open the link yourself.
3. **Register as the student** and take the test (speak a few answers).
4. Confirm the test appears in the **tester's** queue → review it and submit the
   report.
5. Confirm: the **student** sees it in **My Results**, the **agent** can
   **view/email** it, and the **🔔 bell** fired for both.

If that loop works, you're ready for real students.

---

*Prepared for the Upedia placement pilot. Emails depend on the Resend key in
step A1; everything else works as soon as the team accounts exist.*
