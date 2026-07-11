import { Outlet } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'

export default function MainLayout() {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="flex h-screen overflow-hidden bg-nba-darker">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
      >
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
