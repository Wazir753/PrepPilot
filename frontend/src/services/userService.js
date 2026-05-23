import api from './api';

const userService = {
  async getProfile() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async updateProfile(updates) {
    const { data } = await api.put('/auth/profile', updates);
    return data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getStats() {
    const { data } = await api.get('/analytics/summary');
    return {
      totalInterviews: data.total_interviews,
      avgScore: Math.round(data.average_score || 0),
      bestScore: Math.max(...(data.recent_scores || [0]), 0),
      streak: data.completed_interviews || 0,
    };
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },
};

export default userService;
