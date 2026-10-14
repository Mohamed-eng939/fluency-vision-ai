import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── rubric-rater ────────────────────────────────────────────────────────────
// An LLM-as-rater that scores a spoken response against a condensed CEFR rubric
// and returns per-criterion levels (Grammar, Vocabulary, Fluency), an overall
// CEFR, a confidence, and a short justification for each.
//
// HONESTY (CLAUDE.md): this is a *rater calibrated against human labels*, not a
// trained model, and it is NOT "ML". It reads the TRANSCRIPT only, so it cannot
// judge pronunciation/delivery — that is returned as explicitly not-assessable
// and must stay out of the learner-facing three criteria. Its value is realised
// only when its reads are compared to tester decisions (the training_data
// flywheel). It never hardcodes a level and should be used as a second opinion,
// not an authority, until validated.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const normLevel = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const u = v.trim().toUpperCase().slice(0, 2);
  return LEVELS.includes(u) ? u : null;
};

// ── Text-based fluency features (mirror of src/utils/scoring/fluencyFeatures.ts).
// Acoustic-independent; needs the WhisperX+MFA service for true timing.
const SINGLE_FILLERS = new Set([
  "um", "uh", "uhh", "uhm", "erm", "er", "err", "ah", "ahh", "eh",
  "hmm", "hm", "mm", "mmm", "mhm",
]);
const MULTI_FILLERS = ["you know", "i mean", "sort of", "kind of", "kinda"];
const WORD_RE = /[A-Za-z']+/g;

function analyzeFluency(transcript: string, durationSeconds?: number | null) {
  const text = (transcript || "").trim();
  const tokens = (text.toLowerCase().match(WORD_RE) || []).filter((w) => w.replace(/'/g, "").length > 0);
  const words = tokens.length;
  const durationSec = durationSeconds && durationSeconds > 0 ? durationSeconds : null;

  let fillerCount = tokens.filter((t) => SINGLE_FILLERS.has(t)).length;
  const joined = " " + tokens.join(" ") + " ";
  for (const phrase of MULTI_FILLERS) {
    let idx = joined.indexOf(" " + phrase + " ");
    while (idx !== -1) { fillerCount++; idx = joined.indexOf(" " + phrase + " ", idx + 1); }
  }

  let repetitionCount = 0;
  for (let i = 1; i < tokens.length; i++) if (tokens[i] === tokens[i - 1] && tokens[i].length > 1) repetitionCount++;
  for (let i = 3; i < tokens.length; i++) if (tokens[i] === tokens[i - 2] && tokens[i - 1] === tokens[i - 3]) repetitionCount++;

  const distinctWords = new Set(tokens).size;
  const window = 50;
  let mattr: number;
  if (words === 0) mattr = 0;
  else if (words <= window) mattr = distinctWords / words;
  else {
    let sum = 0, count = 0;
    for (let i = 0; i + window <= words; i++) { sum += new Set(tokens.slice(i, i + window)).size / window; count++; }
    mattr = count ? sum / count : distinctWords / words;
  }

  const runs = text.split(/[.?!]+/).map((s) => (s.match(WORD_RE) || []).length).filter((n) => n > 0);
  const meanRunWords = runs.length ? runs.reduce((a, b) => a + b, 0) / runs.length : words;
  const longestRunWords = runs.length ? Math.max(...runs) : words;
  const wordsPerMin = durationSec ? Math.round((words / durationSec) * 60) : null;
  const disfluencyPer100 = words ? Math.round(((fillerCount + repetitionCount) / words) * 1000) / 10 : null;

  return {
    words, durationSec, wordsPerMin, fillerCount, repetitionCount, disfluencyPer100,
    distinctWords, mattr: Math.round(mattr * 1000) / 1000,
    meanRunWords: Math.round(meanRunWords * 10) / 10, longestRunWords,
  };
}

const RUBRIC = `You are a strict, consistent CEFR examiner for SPOKEN English. You grade ONLY what the evidence supports. Use this condensed rubric for each criterion:

GRAMMAR (range & accuracy of structures):
- A1: isolated words/memorised phrases; almost no connected sentences.
- A2: simple sentences, present/past basic; frequent errors but meaning usually clear.
- B1: links simple sentences; handles common tenses; errors in complex forms.
- B2: good control; varied structures (relative clauses, conditionals, passives); occasional slips.
- C1: consistently accurate, flexible complex grammar; rare errors.
- C2: full, natural control.

VOCABULARY (range & appropriacy):
- A1: very limited, basic words.
- A2: enough for everyday topics; much repetition.
- B1: enough to discuss familiar topics with some circumlocution.
- B2: broad range; some precise/idiomatic use; copes with abstract topics.
- C1: rich, precise, idiomatic; little searching for words.
- C2: very broad, nuanced, natural.

FLUENCY (flow, cohesion, hesitation — judge from text + the provided metrics):
- A1: very halting, isolated words.
- A2: short runs, frequent pauses/fillers, restarts.
- B1: keeps going on familiar topics; noticeable hesitation, simple connectors.
- B2: fairly even flow; connected, few disruptive pauses.
- C1: smooth, spontaneous, well-organised.
- C2: effortless, natural flow.

RULES:
- Judge from the TRANSCRIPT and the fluency METRICS only. You have NO audio: do NOT rate pronunciation/accent.
- A very short or off-topic answer limits evidence — grade low and lower your confidence.
- Watch for memorised/recited text (unusually dense, flawless, essay-like for a spoken prompt): note it; it is weak evidence of real ability.
- Be consistent: the same evidence must get the same level.
- Output STRICT JSON only, no prose outside it, in exactly this shape:
{"grammar_cefr":"A1-C2","vocabulary_cefr":"A1-C2","fluency_cefr":"A1-C2","overall_cefr":"A1-C2","confidence":0-100,"rationale":{"grammar":"one sentence","vocabulary":"one sentence","fluency":"one sentence","overall":"one sentence, cite specifics"}}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ success: false, error: "OPENAI_API_KEY not configured" }, 500);

  let transcript = "", duration_seconds: number | null = null, prompt_text = "", question_type = "";
  try {
    const b = await req.json();
    transcript = (b.transcript || "").toString();
    duration_seconds = typeof b.duration_seconds === "number" ? b.duration_seconds : null;
    prompt_text = (b.prompt_text || "").toString();
    question_type = (b.question_type || "").toString();
  } catch {
    return json({ success: false, error: "Expected JSON { transcript, duration_seconds, prompt_text }" }, 400);
  }
  if (!transcript.trim()) return json({ success: false, error: "No transcript provided" }, 400);

  const features = analyzeFluency(transcript, duration_seconds);
  const model = Deno.env.get("RUBRIC_MODEL") || "gpt-4o-mini";

  const userPrompt = `PROMPT (what the student was asked): ${prompt_text || "(not provided)"}
${question_type ? `TASK TYPE: ${question_type}\n` : ""}STUDENT TRANSCRIPT:
"""
${transcript.trim()}
"""

FLUENCY METRICS (text-derived; timing is approximate):
- words: ${features.words}${features.wordsPerMin !== null ? `, speech rate: ${features.wordsPerMin} wpm (over total duration incl. pauses)` : ""}
- fillers: ${features.fillerCount}, immediate repetitions: ${features.repetitionCount}, disfluency per 100 words: ${features.disfluencyPer100 ?? "n/a"}
- lexical diversity (MATTR): ${features.mattr}, mean run length: ${features.meanRunWords} words, longest run: ${features.longestRunWords} words

Grade this response now. JSON only.`;

  let content = "";
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: RUBRIC },
          { role: "user", content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      return json({ success: false, error: `OpenAI ${resp.status}: ${detail.slice(0, 200)}`, features }, 502);
    }
    const data = await resp.json();
    content = data?.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    return json({ success: false, error: `Request failed: ${String(e)}`, features }, 500);
  }

  let parsed: any;
  try { parsed = JSON.parse(content); } catch {
    return json({ success: false, error: "Rater returned non-JSON", raw: content.slice(0, 300), features }, 502);
  }

  const grammar = normLevel(parsed.grammar_cefr);
  const vocabulary = normLevel(parsed.vocabulary_cefr);
  const fluency = normLevel(parsed.fluency_cefr);
  const overall = normLevel(parsed.overall_cefr) || grammar || vocabulary || fluency;
  if (!overall) return json({ success: false, error: "Rater returned no usable level", raw: parsed, features }, 502);

  // Temper confidence when there is little evidence to go on.
  let confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0)));
  if (features.words < 15) confidence = Math.min(confidence, 40);
  else if (features.words < 30) confidence = Math.min(confidence, 65);

  const r = parsed.rationale || {};
  return json({
    success: true,
    model,
    features,
    rubric: {
      grammar_cefr: grammar,
      vocabulary_cefr: vocabulary,
      fluency_cefr: fluency,
      overall_cefr: overall,
      confidence,
      rationale: {
        grammar: (r.grammar || "").toString().slice(0, 400) || null,
        vocabulary: (r.vocabulary || "").toString().slice(0, 400) || null,
        fluency: (r.fluency || "").toString().slice(0, 400) || null,
        overall: (r.overall || "").toString().slice(0, 400) || null,
      },
    },
    // Delivery/pronunciation is intentionally NOT scored here (no audio analysis).
    pronunciation: {
      assessable: false,
      reason: "Pronunciation needs acoustic analysis (WhisperX+MFA goodness-of-pronunciation in backend/, or a pronunciation API). Not wired in the live pipeline yet.",
    },
  });
});
