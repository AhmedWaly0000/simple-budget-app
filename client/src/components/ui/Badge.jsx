import { tierColorClass } from '../../utils/ranking'

export function TierBadge({ tier, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
  return (
    <span className={`stat-badge font-bold ${tierColorClass(tier)} ${sizeClass}`}>
      {tier}
    </span>
  )
}

export function PositionBadge({ position }) {
  const colorMap = {
    PG: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    SG: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    SF: 'bg-green-500/15 text-green-400 border-green-500/30',
    PF: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    C: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <span className={`stat-badge font-semibold border ${colorMap[position] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
      {position}
    </span>
  )
}

export function TeamBadge({ abbr }) {
  return (
    <span className="stat-badge bg-white/10 text-gray-300 border border-white/10 font-mono text-xs">
      {abbr}
    </span>
  )
}
