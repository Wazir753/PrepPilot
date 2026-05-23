import api from './api';

const leaderboardService = {
  async getGlobal(params = {}) {
    const { data } = await api.get('/interviews/leaderboard/global', { params });
    return data;
  },

  async getWeekly() {
    const { data } = await api.get('/interviews/leaderboard/global', {
      params: { period: 'weekly' },
    });
    return data;
  },

  async getByRole(role) {
    const { data } = await api.get('/interviews/leaderboard/global', {
      params: { role },
    });
    return data;
  },
};

export default leaderboardService;
