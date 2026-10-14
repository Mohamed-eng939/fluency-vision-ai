# Tester Guide — Rating a Upedia Speaking Test

Orientation + training for testers (assessors). This is the source for the
distributable PDF of the same name. Edit here; re-render the PDF from
`docs/` when it changes.

> Your reviews are the standard the whole system learns from, so **consistency
> matters more than speed**. The long-term goal is a test that can place a
> learner **without a human** — that only becomes safe when reviewers agree with
> each other, and the system agrees with reviewers, again and again.

---

## 1 · Your job, in one minute

**The loop:** Open a test → listen to each answer → grade **Grammar, Fluency,
Vocabulary** → confirm or **override** the overall CEFR with a reason →
(optional) pull the **AI rubric read** as a second opinion → build the report →
submit.

**Golden rules**
- Grade what you actually **hear**.
- When the auto level is wrong, **override it with a specific reason**.
- Be **consistent** — the same evidence should always get the same level.

**The three criteria**
- **Grammar** — range & accuracy of structures (tenses, clauses, word order).
- **Fluency** — flow, length of runs, hesitation, how ideas connect.
- **Vocabulary** — range, precision and appropriacy of word choice.

> Pronunciation is **not** a learner-facing criterion yet — don't grade accent;
> judge the three above. (The engine can't measure pronunciation reliably until
> the speech service is deployed — see the note at the end.)

---

## 2 · CEFR quick reference (speaking)

| Level | Grammar | Vocabulary | Fluency |
|---|---|---|---|
| **A1** | Isolated words / memorised phrases; barely any sentences. | A few basic, concrete words. | Very halting; long pauses, single words. |
| **A2** | Simple present/past sentences; frequent errors but meaning usually clear. | Everyday words; lots of repetition. | Short choppy runs; frequent pauses & restarts. |
| **B1** | Links sentences (because/but/if); common tenses OK; slips on complex forms. | Enough for familiar topics, some "talking around" a word. | Keeps going on familiar topics; noticeable but non-blocking hesitation. |
| **B2** | Varied, controlled structures (relative clauses, conditionals, passives); occasional slips. | Broad; some precise/idiomatic use; handles abstract ideas. | Fairly even, connected flow; few disruptive pauses. |
| **C1** | Consistently accurate, flexible complex grammar. | Rich, precise, idiomatic; rarely searches for words. | Smooth, spontaneous, well-organised. |
| **C2** | Full natural control. | Very broad & nuanced. | Effortless, natural. |

Grade each criterion **independently** — a learner can be B1 grammar but A2
vocabulary. The overall level is your holistic judgement, usually near the
middle of the three, weighted by what the task demanded.

---

## 3 · Worked examples

Same prompt for all four: **"Describe your typical day, and tell me one thing you
would like to change."** The *Signals* line shows the kind of objective metrics
the system surfaces to support your ear — they never replace it.

### Example 1 — Overall: **A2**
> "Um… my day. I wake up at, uh, seven o'clock. I eat breakfast and go to work. I
> work in a shop. In evening I go home, I watch TV and sleep. I want… I want
> change my job because it is boring."

*Signals: 43 words · 81 wpm · 2 fillers + 1 repeat (7/100 words) · lexical
diversity 0.72 · mean run 5.4 words.*

| Criterion | Level | Why |
|---|---|---|
| Grammar | **A2** | Simple present sentences, correct basic word order, but errors in form: "I want **change**" (→ to change), "in **evening**" (→ in the evening). Present tense only. |
| Vocabulary | **A2** | Everyday high-frequency words (wake up, breakfast, shop, TV). Enough for the topic, but very basic and repetitive. |
| Fluency | **A2** | Short choppy runs (~5 words), an audible restart ("I want… I want"), fillers. Keeps going, but with visible effort. |

**Model comment:** "Communicates a daily routine clearly with simple present-tense
sentences. Main limits are errors in basic forms ('I want change' → 'I want **to**
change'; 'in evening' → 'in **the** evening') and short, hesitant phrases. To
reach B1, practise linking ideas ('because', 'after that', 'then') and extending
each answer with a reason or example."

*Auto level was A2 → confirm, no override needed.*

### Example 2 — Overall: **B1**
> "So normally I wake up around seven and I take the bus to my office. My work is
> okay but sometimes it is stressful because we have many customers. In the
> evening I usually cook dinner and call my family. If I could change one thing, I
> would like to have more free time to learn new things, like programming."

*Signals: 60 words · 90 wpm · 0 fillers (0/100) · lexical diversity 0.79 · mean
run 15 words.*

| Criterion | Level | Why |
|---|---|---|
| Grammar | **B1** | Connects ideas with but/because; a clean conditional attempt ("If I could change one thing, I would like…"). Mostly accurate; not yet consistently complex. |
| Vocabulary | **B1** | Adequate range for a familiar topic (stressful, customers, free time, programming). Still mostly concrete. |
| Fluency | **B1** | Even, connected delivery (runs of ~15 words, no fillers); comfortable on a familiar topic. |

**Model comment:** "A clear, connected answer with a good attempt at a conditional
('If I could change one thing, I would…'). Range is solid but mostly concrete and
errors are minor. For B2, aim for more varied structures and more precise
wording — e.g., 'a better work–life balance' rather than 'more free time'."

*The three criteria match here, but judge each on its own — if the vocabulary had
been noticeably thinner than the grammar, it would be fine to mark Vocabulary A2
and Grammar B1.*

### Example 3 — Overall: **B2**
> "My days are fairly routine during the week — I'm usually at my desk by nine, and
> most of my time goes into meetings and writing reports. What I'd really like to
> change is the balance between work and the rest of my life. At the moment work
> tends to take over, and I rarely have the energy to pursue hobbies in the
> evening. Ideally, I'd move somewhere with a shorter commute so I could spend that
> time on things that actually matter to me."

*Signals: 84 words · 97 wpm · 0 fillers (0/100) · lexical diversity 0.78 · mean
run 21 words.*

| Criterion | Level | Why |
|---|---|---|
| Grammar | **B2** | Varied, controlled structures: cleft ("What I'd really like to change is…"), "tends to", conditional ("I'd move… so I could…"). Only occasional slips. |
| Vocabulary | **B2** | Precise & idiomatic: "the balance between work and the rest of my life", "pursue hobbies", "shorter commute", "things that actually matter". Handles a semi-abstract idea. |
| Fluency | **B2** | Long, well-organised runs (~21 words), smooth and cohesive; no disruptive hesitation. |

**Model comment:** "A fluent, well-structured answer that goes beyond the
concrete — frames a real opinion about work–life balance and supports it, using
cleft sentences and conditionals naturally. Vocabulary is precise and idiomatic.
To push toward C1, look for even greater spontaneity and nuance on unfamiliar,
abstract topics."

> **Don't rate on one number.** The lexical-diversity score here (0.78) is
> actually a touch *lower* than the B1 answer's (0.79) — longer discourse reuses
> linking words. This answer is stronger because of its **grammatical range,
> cohesion and idea development**, which you hear. Metrics support your judgement;
> they never make it.

### Example 4 — the override case — Overall: **B1** (overridden ↓ from auto B2)
> "Every morning I wake up early and seize the day with enthusiasm and
> determination. I believe that time management is the key to success, and I always
> strive to achieve my goals and improve myself continuously."

*Signals: 36 words · 108 wpm · 0 fillers (0/100) · lexical diversity 0.81 · mean
run 18 words → looks clean and high.*

**What's really going on:** the English is polished, but it is **generic, even,
and off-prompt** — no actual description of a day, no concrete "one thing to
change". This is the signature of a **memorised / recited** chunk ("seize the
day", "time management is the key to success"). A single rehearsed sentence is
**not** evidence of spontaneous B2 ability.

| Criterion | Level | Why |
|---|---|---|
| Grammar | **B1** | Cannot confirm above B1 from recited text — no spontaneous production to judge. Low confidence. |
| Vocabulary | **B1** | Impressive-looking, but memorised collocations — don't credit as productive range. |
| Fluency | **B1** | Even delivery, but rehearsed ≠ spontaneous fluency. |

**Override reason (what you type):** "Answer appears rehearsed — polished, generic
sentences that don't address the prompt (no typical day, no concrete change). A
recited chunk isn't evidence of spontaneous B2. Placing at B1 pending a second,
unscripted task."

> **Why this is the most valuable thing you do.** The system can't yet catch
> recitation on its own — your override **plus the specific reason** is exactly the
> signal that teaches it. If a *whole* test looks rehearsed, set status to **Needs
> Revision** and ask the agent to re-test with the student live.

---

## 4 · Writing comments testers (and learners) can use

**Strong — specific & evidence-based**
- "Good conditional ('If I could change…'); for B2, vary structures and tighten word choice ('work–life balance')."
- "Drops articles ('in **the** evening') and the infinitive 'to' ('want **to** change') — target these two patterns."
- "Rich, connected discourse; to reach C1, push spontaneity on abstract topics."

**Weak — vague & unteachable**
- "Good job, nice speaking." *(says nothing)*
- "Sounds like B1." *(no evidence)*
- "Needs to improve grammar." *(which grammar?)*

Rule of thumb: quote something the learner actually said, name the level it points
to, and give **one** concrete next step.

---

## 5 · The AI rubric read (your second opinion)

While reviewing a response you can press **AI rubric read**. The system gives its
own Grammar / Fluency / Vocabulary / overall CEFR, a confidence, and a one-line
reason — based on the **transcript only** (so it never judges pronunciation).

- **Compare, don't obey.** It's a sanity check, not an authority. When you
  disagree, trust your ear and grade what you heard.
- **"Use these grades"** copies its levels into your dropdowns so you can start
  from them and adjust — it never submits for you.
- Pulling a read also records the AI's level next to your final decision, so the
  admin dashboard can track how close the AI is getting to human judgement. The
  closer that number climbs — and stays — the more the test can eventually place
  learners on its own.

---

## 6 · Why consistency is the mission

Every review you submit is stored as a labelled example. The goal is a test that
can place a learner **without a human** — and that only becomes safe when
reviewers agree with each other, and the system agrees with reviewers, again and
again. So: grade on the evidence, override the wrong calls with a concrete reason,
use the full A1–C2 range honestly, and apply the same standard on a Monday
morning as on a Friday night. That discipline, repeated across many tests, is what
turns your judgement into a system that can stand on its own.

---

## Appendix — where the numbers come from (for maintainers)

The *Signals* line is produced by `src/utils/scoring/fluencyFeatures.ts`
(`analyzeFluency`) and the `rubric-rater` edge function, from the transcript +
recording duration only. They are **text estimates** — true pause/articulation
timing and pronunciation need the WhisperX + Montreal Forced Aligner service in
`backend/` to be deployed, or a pronunciation API. Thresholds in the analyzer are
a first pass and are expected to be tuned against reviewed data.
