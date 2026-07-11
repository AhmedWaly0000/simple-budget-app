import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Star, X, Activity } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { MOCK_PLAYERS } from '../../data/mockPlayers'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { compareList } = useAppStore()

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    const found = MOCK_PLAYERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.teamAbbr.toLowerCase().includes(q)
    ).slice(0, 6)
    setResults(found)
  }, [query])

  const handleSelect = (player) => {
    navigate(`/players/${player.id}`)
    setSearchOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4
                        bg-nba-dark/80 backdrop-blur-md border-b border-white/5">
      {/* Left: Logo text */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-7 h-7 bg-nba-blue rounded-lg flex items-center justify-center
                        group-hover:shadow-nba transition-shadow">
          <Activity size={16} className="text-white" />
        </div>
        <span className="font-display text-lg font-bold tracking-wide text-white">
          Hoop<span className="text-nba-gold">Metrics</span>
        </span>
      </Link>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5
                     border border-white/10 text-gray-400 text-sm hover:bg-white/8
                     hover:text-white transition-all w-48"
        >
          <Search size={14} />
          <span>Search players…</span>
          <kbd className="ml-auto text-xs opacity-50">⌘K</kbd>
        </button>

        {/* Compare badge */}
        {compareList.length > 0 && (
          <Link
            to="/compare"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-nba-blue/20 border border-nba-blue/40 text-blue-300
                       text-sm font-medium hover:bg-nba-blue/30 transition-all"
          >
            <Star size={13} />
            Compare ({compareList.length})
          </Link>
        )}

        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white
                           hover:bg-white/8 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-nba-red rounded-full" />
        </button>
      </div>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4
                       bg-black/60 backdrop-blur-sm"
            onClick={() => { setSearchOpen(false); setQuery('') }}
          >
            <motion.div
              initial={{ scale: 0.95, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-xl glass-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search size={16} className="text-gray-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search players, teams…"
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500
                             outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { setSearchOpen(false); setQuery('') }
                    if (e.key === 'Enter' && results[0]) handleSelect(results[0])
                  }}
                />
                <button
                  onClick={() => { setSearchOpen(false); setQuery('') }}
                  className="p-1 rounded text-gray-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {results.length > 0 ? (
                <ul>
                  {results.map((player) => (
                    <li key={player.id}>
                      <button
                        onClick={() => handleSelect(player)}
                        className="w-full flex items-center gap-3 px-4 py-3
                                   hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-nba-blue/20 flex items-center
                                        justify-center text-xs font-bold text-nba-gold">
                          {player.ranking.overall}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {player.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {player.team} · {player.position}
                          </p>
                        </div>
                        <span className={`stat-badge ${
                          player.ranking.tier === 'S' ? 'tier-badge-s' :
                          player.ranking.tier === 'A' ? 'tier-badge-a' : 'tier-badge-b'
                        }`}>
                          {player.ranking.tier}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No players found for "{query}"
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-600 text-xs">
                  Type to search NBA players and teams
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
