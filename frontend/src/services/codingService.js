import api from './api';

const codingService = {
  async getProblem(interviewId) {
    const { data } = await api.get(`/coding/${interviewId}/problem`);
    return data;
  },

  async execute(interviewId, payload) {
    const { data } = await api.post(`/coding/${interviewId}/execute`, payload);
    return data;
  },

  async submit(interviewId, payload) {
    const { data } = await api.post(`/coding/${interviewId}/submit`, payload);
    return data;
  },

  async runTests(interviewId, payload) {
    const { data } = await api.post(`/coding/${interviewId}/test`, payload);
    return data;
  },

  async getTemplates(language) {
    const { data } = await api.get('/coding/templates', { params: { language } });
    return data;
  },
};

export default codingService;
