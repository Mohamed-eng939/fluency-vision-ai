# Partner Integration Guide — Spoken-English Placement (Hosted White-Label)

This guide is for **partner organizations** integrating the spoken-English placement
assessment into their own product. You send us a candidate; we run the **branded**
assessment (recording → scoring → human review) and hand you back a **CEFR result**.

You do **not** build any assessment UI. Integration is two API calls.

---

## 1. How it works

```
 Your app                    Our API                       Candidate
 --------                    -------                       ---------
 1. Candidate signs up
    on your site
 2. POST /assessment-links  ─────────────▶  creates a one-time
    (candidate + your ref)                  branded link
                            ◀───────────── { link, external_id }
 3. Redirect candidate ─────────────────────────────────▶ opens link,
    to `link`                                              takes the test
                                                           (your brand)
 4. (async) human review of the result
 5. GET result (poll)      ─────────────▶  returns the reviewed
    by your external_id                     CEFR + skill breakdown
                            ◀───────────── { cefr, criteria, feedback }
```

- The candidate enters their details **on your side**; you pass them to us when you
  create the link, so they never re-register.
- The assessment opens under **your** brand (logo, name, colors) — configured once by
  our team for your organization.
- Results are **reviewed by a human assessor** before release, so retrieval is
  **asynchronous** (typically within 24 hours). Poll the result endpoint (a webhook
  push is on the roadmap).

---

## 2. Credentials

You receive two things from us:

| Value | What it is | Secret? |
|---|---|---|
| **API key** (`lsk_live_…`) | Authenticates *your organization*. Generated in our admin console, scoped to you, revocable. | **Yes** — keep it server-side only. |
| **Public project key** | Identifies our platform gateway. Safe to expose. | No |

**Base URL:** `https://rrslhxigqtfllunmowcy.supabase.co/functions/v1`

Every request sends:

```
Content-Type: application/json
apikey: <PUBLIC_PROJECT_KEY>     # platform gateway key (public)
x-api-key: <YOUR_API_KEY>        # your secret org key
```

> Call the API only from your **backend**. Never expose your `x-api-key` in a browser
> or mobile app.

---

## 3. Create an assessment link

Mint a one-time, branded link for a candidate.

`POST /assessment-links`

```json
{
  "action": "create",
  "candidate": {
    "name": "Sara Ali",
    "email": "sara@example.com",
    "external_id": "your-candidate-123"
  },
  "test_type": "speaking",
  "expires_in_hours": 168
}
```

| Field | Required | Notes |
|---|---|---|
| `action` | ✅ | `"create"` |
| `candidate.name` | – | Shown to the candidate (“Hi Sara”). |
| `candidate.email` | – | The address results relate to. |
| `candidate.external_id` | ★ recommended | **Your** id for this candidate/attempt — you use it to fetch the result later. |
| `test_type` | – | Defaults to `"speaking"`. |
| `expires_in_hours` | – | Link lifetime. Default `168` (7 days). |

**Response `200`:**

```json
{
  "link": "https://english-placement-test.lovable.app/t/ab12cd34…",
  "token": "ab12cd34…",
  "external_id": "your-candidate-123",
  "status": "issued",
  "expires_at": "2026-09-02T10:00:00.000Z"
}
```

Redirect the candidate to `link` (or email it to them).

---

## 4. Get the result

Poll once the candidate has finished and the result has been reviewed.

`POST /assessment-links`

```json
{ "action": "result", "external_id": "your-candidate-123" }
```

(You may pass `token` instead of `external_id`.)

**While pending:**

```json
{ "external_id": "your-candidate-123", "status": "issued" }     // link not opened yet
{ "external_id": "your-candidate-123", "status": "opened" }     // candidate opened it
{ "external_id": "your-candidate-123", "status": "in_review" }  // finished, awaiting assessor
```

**When complete:**

```json
{
  "external_id": "your-candidate-123",
  "status": "completed",
  "result": {
    "cefr": "B2",
    "criteria": { "grammar": "B2", "fluency": "B1", "vocabulary": "B2" },
    "feedback": "Confident speaker; work on connected speech.",
    "recommendation": "General English — upper intermediate",
    "reviewed_at": "2026-08-27T09:12:00.000Z"
  }
}
```

Poll every few minutes (or hourly) until `status` is `completed`.

---

## 5. Statuses

| `status` | Meaning |
|---|---|
| `issued` | Link created, not opened yet. |
| `opened` | Candidate opened the link / started. |
| `in_review` | Candidate finished; a human assessor is reviewing. |
| `completed` | Reviewed — `result` is present. |

---

## 6. Errors

Errors return a non-2xx status with `{ "error": "…" }`.

| HTTP | Meaning |
|---|---|
| `401` | Missing / invalid / revoked API key. |
| `402` | Assessment quota exceeded for your plan. |
| `403` | Your organization is suspended. |
| `404` | No invite found for that reference. |
| `400` | Bad request (missing fields / unknown action). |

---

## 7. End-to-end example (Node.js)

```js
const BASE = "https://rrslhxigqtfllunmowcy.supabase.co/functions/v1";
const headers = {
  "Content-Type": "application/json",
  "apikey": process.env.PUBLIC_PROJECT_KEY,
  "x-api-key": process.env.PLACEMENT_API_KEY,
};

// 1) create a link
const created = await fetch(`${BASE}/assessment-links`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    action: "create",
    candidate: { name: "Sara Ali", email: "sara@example.com", external_id: "cand-123" },
  }),
}).then(r => r.json());

// -> redirect the candidate to created.link

// 2) later, fetch the result
const res = await fetch(`${BASE}/assessment-links`, {
  method: "POST",
  headers,
  body: JSON.stringify({ action: "result", external_id: "cand-123" }),
}).then(r => r.json());

if (res.status === "completed") {
  console.log(res.result.cefr, res.result.criteria);
}
```

---

## 8. Notes & limits

- **Quota:** each created link counts against your plan's assessment quota. `402` when exceeded.
- **Branding:** your logo/name/colors are configured once by our team; every link is skinned to you.
- **Privacy:** the candidate's audio + transcript stay on our platform; you receive the CEFR result and feedback.
- **Roadmap:** result **webhooks** (push instead of poll) and per-partner **custom domains**.

*Questions? Contact your integration manager.*
