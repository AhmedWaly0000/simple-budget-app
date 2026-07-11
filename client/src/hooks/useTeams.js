import { useQuery } from '@tanstack/react-query'
import { MOCK_TEAMS } from '../data/mockPlayers'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      try {
        const { teamsApi } = await import('../services/api')
        return await teamsApi.getAll()
      } catch {
        return MOCK_TEAMS
      }
    },
    placeholderData: MOCK_TEAMS,
    staleTime: 1000 * 60 * 60,
  })
}

export function useTeam(id) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      try {
        const { teamsApi } = await import('../services/api')
        return await teamsApi.getById(id)
      } catch {
        return MOCK_TEAMS.find((t) => t.id === id) ?? null
      }
    },
    placeholderData: () => MOCK_TEAMS.find((t) => t.id === id),
    enabled: !!id,
  })
}
