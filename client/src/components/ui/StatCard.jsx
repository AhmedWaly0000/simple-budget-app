import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, unit = '', trend, rank, delay = 0, highlight }) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`glass-card p-4 flex flex-col gap-1 hover:border-white/20 transition-all
                  ${highlight ? 'border-nba-blue/40 bg-nba-blue/5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        {rank && (
          <span className="text-xs text-gray-600">
            #{rank} <span className="text-gray-700">league</span>
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-bold font-display text-white">
          {value}
        </span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
        {trend && (
          <TrendIcon size={14} className={`${trendColor} mb-1 ml-auto`} />
        )}
      </div>
    </motion.div>
  )
}
