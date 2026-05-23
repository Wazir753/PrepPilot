import api from './api';

const adminService = {
  async getUsers(params = {}) {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async getUser(id) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  async banUser(id) {
    const { data } = await api.post(`/admin/users/${id}/ban`);
    return data;
  },

  async unbanUser(id) {
    const { data } = await api.post(`/admin/users/${id}/unban`);
    return data;
  },

  async getStats() {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  async getInterviews(params = {}) {
    const { data } = await api.get('/admin/interviews', { params });
    return data;
  },
};

export default adminService;
