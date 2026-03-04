import { fetchApi } from './apiClient';
import { MOCK_HABITS, MOCK_WEEKLY_PROGRESS } from './mockData';

export const habitsService = {
  // Obtener hábitos de un día específico
  getDailyHabits: async (date) => {
    try {
      const res = await fetchApi(`/habits?date=${date}`);
      return res.habits || res;
    } catch (e) {
      // Fallback a Mock data para evitar romper la UI mientras el backend no está
      return new Promise(resolve => setTimeout(() => resolve(MOCK_HABITS), 800));
    }
  },
  
  // Crear nuevo hábito
  createHabit: async (habitData) => {
    return fetchApi('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData)
    });
  },
  
  // Marcar como completado/pendiente
  toggleHabitLog: async (habitId, date, completed) => {
    try {
      return await fetchApi(`/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ date, completed })
      });
    } catch (e) {
      // Mock network delay para Optimistic UI testing
      return new Promise(resolve => setTimeout(() => resolve({ 
        habitId, 
        done: completed, 
        streak: completed ? 1 : 0 
      }), 400));
    }
  },
  
  // Obtener progreso semanal
  getWeeklyProgress: async (startDate, endDate) => {
    try {
      return await fetchApi(`/progress?startDate=${startDate}&endDate=${endDate}`);
    } catch (e) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_WEEKLY_PROGRESS), 800));
    }
  }
};
