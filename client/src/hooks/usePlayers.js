import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { MOCK_PLAYERS } from '../data/mockPlayers'
import { rankPlayers } from '../utils/ranking'
import { useAppStore } from '../store/useAppStore'
import { getNestedValue } from '../utils/format'

function applyFilters(players, filters) {
  let result = [...players]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.teamAbbr.toLowerCase().includes(q)
    )
  }

  if (filters.position !== 'all') {
    result = result.filter((p) => p.position === filters.position)
  }

  if (filters.team !== 'all') {
    result = result.filter((p) => p.teamAbbr === filters.team)
  }

  if (filters.tier !== 'all') {
    result = result.filter((p) => p.ranking?.tier === filters.tier)
  }

  return result
}

function applySort(players, sortBy, sortDir) {
  return [...players].sort((a, b) => {
    const aVal = getNestedValue(a, sortBy) ?? 0
    const bVal = getNestedValue(b, sortBy) ?? 0
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })
}

/** Hook that provides ranked + filtered players from mock data (falls back from API) */
export function usePlayers() {
  const { filters, rankingWeights } = useAppStore()

  // In production this would call the real API; use mock data for offline dev
  const { data: rawPlayers = MOCK_PLAYERS, isLoading } = useQuery({
    queryKey: ['players', filters.season],
    queryFn: async () => {
      try {
        const { playersApi } = await import('../services/api')
        return await playersApi.getAll({ season: filters.season })
      } catch {
        return MOCK_PLAYERS
      }
    },
    placeholderData: MOCK_PLAYERS,
    staleTime: 1000 * 60 * 10,
  })

  const processed = useMemo(() => {
    const ranked = rankPlayers(rawPlayers, rankingWeights)
    const filtered = applyFilters(ranked, filters)
    const sorted = applySort(filtered, filters.sortBy, filters.sortDir)
    const total = sorted.length
    const start = (filters.page - 1) * filters.perPage
    const paginated = sorted.slice(start, start + filters.perPage)
    return { players: paginated, total, allRanked: ranked }
  }, [rawPlayers, filters, rankingWeights])

  return { ...processed, isLoading }
}

export function usePlayer(id) {
  return useQuery({
    queryKey: ['player', id],
    queryFn: async () => {
      try {
        const { playersApi } = await import('../services/api')
        return await playersApi.getById(id)
      } catch {
        return MOCK_PLAYERS.find((p) => p.id === id) ?? null
      }
    },
    placeholderData: () => MOCK_PLAYERS.find((p) => p.id === id),
    enabled: !!id,
  })
}
