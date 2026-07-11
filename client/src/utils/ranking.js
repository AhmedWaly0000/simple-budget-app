/**
 * Core ranking engine — computes composite scores from player stats
 * using user-configurable weights and percentile normalization.
 */

export const DEFAULT_WEIGHTS = {
  points: 0.25,
  assists: 0.20,
  rebounds: 0.20,
  efg_pct: 0.15,
  bpm: 0.10,
  win_shares: 0.10,
}

/** Normalize a value to 0-100 given a min and max observed in the dataset */
function normalize(value, min, max) {
  if (max === min) return 50
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

/** Compute percentile ranks for each metric across the player pool */
export function computePercentiles(players) {
  const metrics = ['points', 'assists', 'rebounds', 'efg_pct', 'bpm', 'win_shares']
  const ranges = {}

  for (const metric of metrics) {
    const values = players.map((p) => getMetricValue(p, metric))
    ranges[metric] = {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  return players.map((player) => {
    const percentiles = {}
    for (const metric of metrics) {
      const val = getMetricValue(player, metric)
      percentiles[metric] = normalize(val, ranges[metric].min, ranges[metric].max)
    }
    return { ...player, percentiles }
  })
}

/** Extract the raw value for a given metric from a player object */
export function getMetricValue(player, metric) {
  const statMap = {
    points: player.stats?.points ?? 0,
    assists: player.stats?.assists ?? 0,
    rebounds: player.stats?.rebounds ?? 0,
    efg_pct: player.advanced?.efg_pct ?? 0,
    bpm: player.advanced?.bpm ?? 0,
    win_shares: player.advanced?.win_shares ?? 0,
    steals: player.stats?.steals ?? 0,
    blocks: player.stats?.blocks ?? 0,
    ts_pct: player.advanced?.ts_pct ?? 0,
    per: player.advanced?.per ?? 0,
    usage_rate: player.advanced?.usage_rate ?? 0,
  }
  return statMap[metric] ?? 0
}

/** Compute a composite ranking score given weights (0–1, must sum to ~1) */
export function computeScore(player, weights = DEFAULT_WEIGHTS, percentiles = null) {
  let score = 0
  let totalWeight = 0

  for (const [metric, weight] of Object.entries(weights)) {
    const pct = percentiles?.[metric] ?? getMetricValue(player, metric)
    score += pct * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? (score / totalWeight) * (1 / 0.01) * 0.01 : 0
}

/** Full ranking pipeline: normalize → score → sort → rank */
export function rankPlayers(players, weights = DEFAULT_WEIGHTS) {
  const withPercentiles = computePercentiles(players)

  const scored = withPercentiles.map((player) => ({
    ...player,
    computedScore: computeScore(player, weights, player.percentiles),
  }))

  return scored
    .sort((a, b) => b.computedScore - a.computedScore)
    .map((player, index) => ({
      ...player,
      computedRank: index + 1,
    }))
}

/** Assign tier labels based on percentile score */
export function assignTier(score, allScores) {
  const max = Math.max(...allScores)
  const pct = (score / max) * 100
  if (pct >= 90) return 'S'
  if (pct >= 75) return 'A'
  if (pct >= 55) return 'B'
  return 'C'
}

/** Calculate MVP probability based on key metrics */
export function mvpProbability(player, allPlayers) {
  const ranked = rankPlayers(allPlayers, DEFAULT_WEIGHTS)
  const rank = ranked.findIndex((p) => p.id === player.id) + 1
  const teamWins = player.teamWins ?? 45
  const score =
    (1 / rank) * 0.4 +
    (teamWins / 82) * 0.35 +
    ((player.advanced?.bpm ?? 0) / 15) * 0.25

  return Math.min(0.99, Math.max(0, score))
}

/** Format a stat value for display */
export function fmtStat(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—'
  return Number(value).toFixed(decimals)
}

/** Format a percentage */
export function fmtPct(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

/** Get tier color classes */
export function tierColorClass(tier) {
  const map = {
    S: 'tier-badge-s',
    A: 'tier-badge-a',
    B: 'tier-badge-b',
    C: 'tier-badge-c',
  }
  return map[tier] ?? 'tier-badge-c'
}

export function tierLabel(tier) {
  const map = {
    S: 'Elite',
    A: 'All-Star',
    B: 'Starter',
    C: 'Role Player',
  }
  return map[tier] ?? tier
}

/** Generate radar chart data for recharts */
export function buildRadarData(player) {
  const pct = player.percentiles ?? {}
  return [
    { subject: 'Scoring', value: pct.points ?? 0, fullMark: 100 },
    { subject: 'Assists', value: pct.assists ?? 0, fullMark: 100 },
    { subject: 'Rebounds', value: pct.rebounds ?? 0, fullMark: 100 },
    { subject: 'Efficiency', value: pct.efg_pct ?? 0, fullMark: 100 },
    { subject: 'Impact', value: pct.bpm ?? 0, fullMark: 100 },
    { subject: 'Win Shares', value: pct.win_shares ?? 0, fullMark: 100 },
  ]
}
