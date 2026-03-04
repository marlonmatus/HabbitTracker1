import { fetchApi } from './apiClient';
import { MOCK_INSIGHT } from './mockData';

export const insightsService = {
  getDailyInsight: async (date) => {
    try {
      return await fetchApi(`/insights?date=${date}`);
    } catch (e) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_INSIGHT), 1000));
    }
  }
};
