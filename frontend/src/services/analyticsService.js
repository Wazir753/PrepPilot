import api from './api';

const analyticsService = {
  async getOverview() {
    const { data } = await api.get('/analytics/summary');
    return {
      totalInterviews: data.total_interviews,
      completedInterviews: data.completed_interviews,
      averageScore: data.average_score,
      averageTechnicalScore: data.average_technical_score,
      averageCommunicationScore: data.average_communication_score,
      recentScores: data.recent_scores || [],
      emotionSummary: data.emotion_summary,
      voiceSummary: data.voice_summary,
    };
  },

  async getInterviewAnalytics(interviewId) {
    const { data } = await api.get(`/interviews/${interviewId}`);
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
    const trends = await this.getTrends(period);
    return {
      labels: trends.map((t) => t.date?.slice(0, 10) || ''),
      data: trends.map((t) => t.score),
      dates: trends.map((t) => t.date),
      scores: trends.map((t) => t.score),
    };
  },

  async getTrends(period = '30d') {
    const { data } = await api.get('/analytics/trends', { params: { period } });
    return Array.isArray(data) ? data : [];
  },

  async getRoadmap(payload) {
    const { data } = await api.post('/analytics/roadmap', payload);
    return data;
  },

  async getHiringRecommendation(payload) {
    const { data } = await api.post('/analytics/hiring-recommendation', payload);
    return data;
  },

  async downloadPdfReport(interviewId) {
    const response = await api.get(`/analytics/report/${interviewId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService;
