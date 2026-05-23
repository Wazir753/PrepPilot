import api from './api';

const leaderboardService = {
  async getGlobal(params = {}) {
    const { data } = await api.get('/leaderboard', { params });
    return data;
  },

  async getWeekly() {
    const { data } = await api.get('/leaderboard/weekly');
    return data;
  },

  async getByRole(role) {
    const { data } = await api.get('/leaderboard', { params: { role } });
    return data;
  },
};

export default leaderboardService;
