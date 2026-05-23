import api from './api';

const interviewService = {
  async create(config) {
    const { data } = await api.post('/interviews', config);
    return data;
  },

  async getAll(params = {}) {
    const { data } = await api.get('/interviews', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/interviews/${id}`);
    return data;
  },

  async submitResponse(interviewId, payload) {
    const { data } = await api.post(`/responses/interview/${interviewId}`, payload);
    return data;
  },

  async evaluateResponse(responseId, evaluationPayload) {
    const { data } = await api.post(`/responses/${responseId}/evaluate`, evaluationPayload);
    return data;
  },

  async listResponses(interviewId) {
    const { data } = await api.get(`/responses/interview/${interviewId}`);
    return data;
  },

  async getNextQuestion(id, previousScore = null) {
    const { data } = await api.post(`/questions/${id}/next`, {
      previous_score: previousScore,
    });
    return data;
  },

  async endInterview(id, durationSeconds = null) {
    const { data } = await api.post(`/interviews/${id}/complete`, {
      duration_seconds: durationSeconds,
    });
    return data;
  },

  async getReplay(id) {
    const responses = await this.listResponses(id);
    const interview = await this.getById(id);
    return { interview, responses };
  },

  async downloadReport(id) {
    const response = await api.get(`/analytics/report/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default interviewService;
