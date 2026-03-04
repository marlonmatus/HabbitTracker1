const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout for AI
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }))
      const err = new Error(body.detail || 'Error en la petición')
      err.status = res.status
      throw err
    }
    if (res.status === 204) return null
    return res.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// --- Usuarios ---
export const usersApi = {
  create: (email, displayName) =>
    request('/users/', {
      method: 'POST',
      body: JSON.stringify({ email, display_name: displayName }),
    }),
  get: (userId) => request(`/users/${userId}`),
}

// --- Hábitos ---
export const habitsApi = {
  list: (userId) => request(`/habits/${userId}`),
  daily: (userId, date) => request(`/habits/${userId}/daily?date=${date}`),
  create: (payload) =>
    request('/habits/', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (habitId, userId) =>
    request(`/habits/${habitId}?user_id=${userId}`, { method: 'DELETE' }),
}

// --- Registros de hábitos (habit_logs) ---
export const habitLogsApi = {
  log: (habitId, userId, logDate) =>
    request(`/habit-logs/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ habit_id: habitId, log_date: logDate }),
    }),
  remove: (habitId, userId, logDate) =>
    request(`/habit-logs/?user_id=${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ habit_id: habitId, log_date: logDate }),
    }),
  list: (habitId) => request(`/habit-logs/${habitId}`),
}

// --- Progreso semanal ---
export const progressApi = {
  weekly: (userId) => request(`/progress/?user_id=${userId}`),
}

// --- Consejo motivacional ---
export const tipsApi = {
  get: (userId) => request(`/tips/?user_id=${userId}`),
  refresh: (userId) => request(`/tips/?user_id=${userId}&force=true`),
}

// --- IA (Gemini): insight, eventos contextuales, sugerencia de hábito, coach ---
export const insightApi = {
  get: (userId) => request(`/ai/insight?user_id=${userId}`),
}

export const aiApi = {
  contextualEvent: (body) =>
    request('/ai/contextual-event', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  suggestHabit: (userId) => request(`/ai/suggest-habit?user_id=${userId}`),
  coach: (body) =>
    request('/ai/coach', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
