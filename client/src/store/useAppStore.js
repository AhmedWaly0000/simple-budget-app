import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_WEIGHTS = {
  points: 0.25,
  assists: 0.20,
  rebounds: 0.20,
  efg_pct: 0.15,
  bpm: 0.10,
  win_shares: 0.10,
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // Rankings filters
      filters: {
        season: '2023-24',
        position: 'all',
        team: 'all',
        tier: 'all',
        search: '',
        sortBy: 'ranking.score',
        sortDir: 'desc',
        page: 1,
        perPage: 25,
      },
      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value, page: 1 } })),
      resetFilters: () =>
        set({
          filters: {
            season: '2023-24',
            position: 'all',
            team: 'all',
            tier: 'all',
            search: '',
            sortBy: 'ranking.score',
            sortDir: 'desc',
            page: 1,
            perPage: 25,
          },
        }),

      // Custom ranking weights
      rankingWeights: DEFAULT_WEIGHTS,
      setWeight: (metric, value) =>
        set((s) => ({
          rankingWeights: { ...s.rankingWeights, [metric]: value },
        })),
      resetWeights: () => set({ rankingWeights: DEFAULT_WEIGHTS }),

      // Player comparison
      compareList: [],
      addToCompare: (player) =>
        set((s) => {
          if (s.compareList.find((p) => p.id === player.id)) return s
          if (s.compareList.length >= 3) return s
          return { compareList: [...s.compareList, player] }
        }),
      removeFromCompare: (playerId) =>
        set((s) => ({
          compareList: s.compareList.filter((p) => p.id !== playerId),
        })),
      clearCompare: () => set({ compareList: [] }),

      // Favorites
      favorites: [],
      toggleFavorite: (playerId) =>
        set((s) => ({
          favorites: s.favorites.includes(playerId)
            ? s.favorites.filter((id) => id !== playerId)
            : [...s.favorites, playerId],
        })),
      isFavorite: (playerId) => get().favorites.includes(playerId),
    }),
    {
      name: 'hoop-metrics-store',
      partialize: (s) => ({
        rankingWeights: s.rankingWeights,
        favorites: s.favorites,
        sidebarOpen: s.sidebarOpen,
      }),
    }
  )
)
