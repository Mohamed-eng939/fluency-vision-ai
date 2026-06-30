# Swappable scoring-scale layer

Maps a CEFR result onto a named target scale **by configuration, not code** — the
"swappable scale" principle from `CLAUDE.md`. The scoring engine always emits a
CEFR band; this layer translates that band into another scale (e.g. Upedia's
Group / Private class levels) without the engine knowing anything about Upedia.

## Usage

```ts
import { mapCefrToScale } from '@/lib/scales';

const r = mapCefrToScale('A2+', 'upedia');
// r.status === 'mapped'
// r.label  === 'Group 7 · Private 1A-2A'
// r.tracks === { group: '7', private: '1A-2A' }
```

`mapCefrToScale(cefr, scaleId?)` never throws. Resolution order:

1. **Exact band** — e.g. `A1+` has its own Upedia mapping → `mapped`.
2. **Base-band fallback** — engine only knows the main band (`A1`), or a `+` band
   has no separate mapping (`B2+` → `B2` ceiling) → `mapped`, with a `note`.
3. **Above / below range** — band sits outside the scale's mapped span (e.g. `C1`
   when the Upedia guide tops out at `B2`) → `above-range` / `below-range`.
4. **Unmappable** — `N/A` → `unmappable`.

An unknown `scaleId` falls back to the CEFR identity scale.

## Adding a new scale

Add a `ScaleDefinition` to `scaleDefinitions.ts` and register it in
`SCALE_REGISTRY`. No consumer changes. A scale can expose multiple parallel
**tracks** (Upedia runs Group and Private level codes side by side).

```ts
export const myScale: ScaleDefinition = {
  id: 'acme',
  name: 'ACME Levels',
  trackOrder: ['level'],
  bands: {
    A1: { label: 'Beginner', tracks: { level: 'Beginner' } },
    // ...
  },
  aboveRangeNote: 'Above ACME range.',
};
```

Because a scale is plain data, it can later be loaded **per-organization from the
DB** (e.g. an `organizations.scale` JSONB column) and dropped into the same shape
— supporting per-tenant scales for the white-label / SaaS path.

## Source of truth

The Upedia mapping is the academic Division Guide, mirrored in each placement
prompt's `instructions` field in Supabase. Keep the two in sync; the guide tops
out at **B2** today (`aboveRangeNote` documents that ceiling).

## Not wired into any view yet

This is pure logic. **Where** Upedia levels surface (assessor review, admin,
report — but *not* the learner-facing 3-criteria view without a product
decision) is intentionally left to the product owner.
