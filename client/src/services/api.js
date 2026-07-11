import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export const playersApi = {
  getAll: (params) => apiClient.get('/players', { params }),
  getById: (id) => apiClient.get(`/players/${id}`),
  search: (query) => apiClient.get('/players/search', { params: { q: query } }),
}

export const rankingsApi = {
  get: (params) => apiClient.get('/rankings', { params }),
  custom: (weights, params) =>
    apiClient.post('/rankings/custom', { weights, ...params }),
}

export const teamsApi = {
  getAll: () => apiClient.get('/teams'),
  getById: (id) => apiClient.get(`/teams/${id}`),
  getRoster: (id) => apiClient.get(`/teams/${id}/roster`),
}

export const compareApi = {
  get: (ids) => apiClient.get('/compare', { params: { ids: ids.join(',') } }),
}

export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard'),
  getLeaderboards: () => apiClient.get('/dashboard/leaderboards'),
}
