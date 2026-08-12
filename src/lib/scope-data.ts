// Deterministic per-scope data shaping for the monitoring dashboards. Selecting a
// workspace/metastore should visibly redraw the charts, but the same selection must
// always yield the same numbers (no flicker across renders). Everything here is a
// pure function of a string seed, so "all" returns the input untouched.

function seedFrom(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0
  return h
}

function mulberry32(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Reshape a series for a selected scope: scale toward a per-scope fraction of the
// account total, then jitter each bar so the shape (not just the height) changes.
// `scopeId === "all"` returns the original series unchanged.
export function scaleSeries(series: number[], scopeId: string): number[] {
  if (scopeId === "all") return series
  const rand = mulberry32(seedFrom(scopeId))
  const base = 0.15 + rand() * 0.5 // this scope is 15%–65% of the account aggregate
  return series.map((v) => {
    const jitter = 0.6 + rand() * 0.9 // 0.6×–1.5× per bar
    return Math.max(0, v * base * jitter)
  })
}

// Scale a single scalar metric (e.g. a total) by the same per-scope fraction, so the
// headline numbers move with the charts. Returns the original value for "all".
export function scaleValue(value: number, scopeId: string): number {
  if (scopeId === "all") return value
  const rand = mulberry32(seedFrom(scopeId))
  const base = 0.15 + rand() * 0.5
  return value * base
}

// Nudge a percentage up or down within ±spread for a scope, clamped to [0, 100].
// The right shape for rates (pass %, coverage) that shouldn't scale like a total.
// `salt` lets several percentages on one page vary independently for the same scope.
export function varyPercent(base: number, scopeId: string, spread = 12, salt = ""): number {
  if (scopeId === "all") return base
  const rand = mulberry32(seedFrom(scopeId + salt))
  const delta = (rand() * 2 - 1) * spread
  return Math.max(0, Math.min(100, Math.round((base + delta) * 10) / 10))
}
