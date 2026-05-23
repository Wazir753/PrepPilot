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

  async update(id, updates) {
    const { data } = await api.patch(`/interviews/${id}`, updates);
    return data;
  },

  async submitResponse(interviewId, response) {
    const { data } = await api.post(`/interviews/${interviewId}/responses`, response);
    return data;
  },

  async endInterview(id) {
    const { data } = await api.post(`/interviews/${id}/end`);
    return data;
  },

  async getQuestions(id) {
    const { data } = await api.get(`/interviews/${id}/questions`);
    return data;
  },

  async getNextQuestion(id) {
    const { data } = await api.post(`/interviews/${id}/next-question`);
    return data;
  },

  async getReplay(id) {
    const { data } = await api.get(`/interviews/${id}/replay`);
    return data;
  },

  async downloadReport(id) {
    const { data } = await api.get(`/interviews/${id}/report`, {
      responseType: 'blob',
    });
    return data;
  },
};

export default interviewService;
