export const fmt = {
  stat: (v, d = 1) => (v == null || isNaN(v) ? '—' : Number(v).toFixed(d)),
  pct: (v, d = 1) => (v == null || isNaN(v) ? '—' : `${Number(v).toFixed(d)}%`),
  score: (v) => (v == null ? '—' : Number(v).toFixed(1)),
  rank: (n) => `#${n}`,
  mvpProb: (v) => `${(v * 100).toFixed(1)}%`,
  record: (w, l) => `${w}-${l}`,
  winPct: (w, l) => `${((w / (w + l)) * 100).toFixed(1)}%`,
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function getPositionColor(pos) {
  const map = {
    PG: 'text-blue-400',
    SG: 'text-purple-400',
    SF: 'text-green-400',
    PF: 'text-orange-400',
    C: 'text-red-400',
  }
  return map[pos] ?? 'text-gray-400'
}

export function getStatTrend(value, threshold, inverse = false) {
  const good = inverse ? value < threshold : value > threshold
  return good ? 'positive' : 'negative'
}

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val))
}

export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}
