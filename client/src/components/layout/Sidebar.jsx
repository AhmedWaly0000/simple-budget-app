import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Trophy, User, GitCompare, Shield, LayoutDashboard,
  Sliders, Info, ChevronLeft, ChevronRight, Activity,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/rankings', icon: Trophy, label: 'Rankings' },
  { to: '/compare', icon: GitCompare, label: 'Compare' },
  { to: '/teams', icon: Shield, label: 'Teams' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/custom-rankings', icon: Sliders, label: 'Custom Rankings' },
  { to: '/about', icon: Info, label: 'About' },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 bg-nba-dark border-r border-white/5
                 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 bg-nba-blue rounded-lg flex items-center justify-center shrink-0">
          <Activity size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="ml-3 font-display text-base font-bold whitespace-nowrap"
          >
            Hoop<span className="text-nba-gold">Metrics</span>
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium
               transition-all duration-150 group relative
               ${isActive
                 ? 'text-white bg-nba-blue/20 border border-nba-blue/30'
                 : 'text-gray-400 hover:text-white hover:bg-white/5'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-nba-blue/20 border border-nba-blue/30"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 shrink-0 ${isActive ? 'text-blue-400' : ''}`}
                />
                {sidebarOpen && (
                  <span className="relative z-10 whitespace-nowrap">{label}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-nba-dark border
                                  border-white/10 rounded-md text-xs text-white whitespace-nowrap
                                  opacity-0 group-hover:opacity-100 pointer-events-none
                                  transition-opacity z-50 shadow-xl">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/5 shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-lg
                     text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs"
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
