import { useAppStore } from '../../store/useAppStore'

const METRIC_LABELS = {
  points: 'Points (PTS)',
  assists: 'Assists (AST)',
  rebounds: 'Rebounds (REB)',
  efg_pct: 'Effective FG% (eFG%)',
  bpm: 'Box Plus/Minus (BPM)',
  win_shares: 'Win Shares (WS)',
}

const METRIC_COLORS = {
  points: '#3b82f6',
  assists: '#8b5cf6',
  rebounds: '#10b981',
  efg_pct: '#f59e0b',
  bpm: '#ef4444',
  win_shares: '#06b6d4',
}

export default function MetricSlider({ metric }) {
  const { rankingWeights, setWeight } = useAppStore()
  const value = rankingWeights[metric] ?? 0
  const pct = Math.round(value * 100)
  const color = METRIC_COLORS[metric] ?? '#6b7280'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300 font-medium">
          {METRIC_LABELS[metric] ?? metric}
        </label>
        <span
          className="text-sm font-bold font-mono tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => setWeight(metric, parseFloat(e.target.value))}
          className="w-full h-1 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
          }}
        />
      </div>
    </div>
  )
}

export function WeightsPanel() {
  const { rankingWeights, resetWeights } = useAppStore()
  const metrics = Object.keys(rankingWeights)
  const totalWeight = Object.values(rankingWeights).reduce((a, b) => a + b, 0)
  const totalPct = Math.round(totalWeight * 100)

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Ranking Weights</h3>
          <p className="text-xs text-gray-500 mt-0.5">Adjust to rerank players in real-time</p>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-mono font-bold ${
              Math.abs(totalPct - 100) < 5 ? 'text-green-400' : 'text-yellow-400'
            }`}
          >
            Total: {totalPct}%
          </span>
          <button
            onClick={resetWeights}
            className="block mt-0.5 text-xs text-gray-500 hover:text-white transition-colors"
          >
            Reset defaults
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <MetricSlider key={metric} metric={metric} />
        ))}
      </div>
    </div>
  )
}
