import { useAppStore } from '../../store/useAppStore'
import { MOCK_TEAMS, POSITIONS, SEASONS, TIERS } from '../../data/mockPlayers'
import { RotateCcw } from 'lucide-react'

const Select = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field text-xs py-2 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-nba-dark">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)

export default function FilterPanel({ compact = false }) {
  const { filters, setFilter, resetFilters } = useAppStore()

  const seasonOpts = SEASONS.map((s) => ({ value: s, label: s }))
  const positionOpts = [{ value: 'all', label: 'All Positions' }, ...POSITIONS.map((p) => ({ value: p, label: p }))]
  const teamOpts = [
    { value: 'all', label: 'All Teams' },
    ...MOCK_TEAMS.sort((a, b) => a.name.localeCompare(b.name)).map((t) => ({
      value: t.abbr,
      label: `${t.abbr} – ${t.name}`,
    })),
  ]
  const tierOpts = [{ value: 'all', label: 'All Tiers' }, ...TIERS.map((t) => ({ value: t, label: `Tier ${t}` }))]

  return (
    <div className={`glass-card p-4 space-y-3 ${compact ? '' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</span>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      <Select
        label="Season"
        value={filters.season}
        onChange={(v) => setFilter('season', v)}
        options={seasonOpts}
      />
      <Select
        label="Position"
        value={filters.position}
        onChange={(v) => setFilter('position', v)}
        options={positionOpts}
      />
      <Select
        label="Team"
        value={filters.team}
        onChange={(v) => setFilter('team', v)}
        options={teamOpts}
      />
      <Select
        label="Tier"
        value={filters.tier}
        onChange={(v) => setFilter('tier', v)}
        options={tierOpts}
      />
    </div>
  )
}
