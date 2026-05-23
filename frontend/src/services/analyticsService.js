import api from './api';

const analyticsService = {
  async getOverview() {
    const { data } = await api.get('/analytics/overview');
    return data;
  },

  async getInterviewAnalytics(interviewId) {
    const { data } = await api.get(`/analytics/interviews/${interviewId}`);
    return data;
  },

  async getSkillRadar() {
    const { data } = await api.get('/analytics/skills');
    return data;
  },

  async getWeaknessHeatmap() {
    const { data } = await api.get('/analytics/weaknesses');
    return data;
  },

  async getProgressHistory(period = '30d') {
    const { data } = await api.get('/analytics/progress', { params: { period } });
    return data;
  },

  async getTrends() {
    const { data } = await api.get('/analytics/trends');
    return data;
  },
};

export default analyticsService;
