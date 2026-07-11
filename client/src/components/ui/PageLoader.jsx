import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-nba-darker flex flex-col items-center justify-center z-50">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 bg-nba-blue/20 rounded-2xl flex items-center justify-center
                   border border-nba-blue/30 mb-4"
      >
        <Activity size={28} className="text-blue-400" />
      </motion.div>
      <p className="text-gray-500 text-sm">Loading HoopMetrics…</p>
    </div>
  )
}
