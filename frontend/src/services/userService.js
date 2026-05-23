import api from './api';

const userService = {
  async getProfile() {
    const { data } = await api.get('/users/me');
    return data;
  },

  async updateProfile(updates) {
    const { data } = await api.patch('/users/me', updates);
    return data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getStats() {
    const { data } = await api.get('/users/me/stats');
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.post('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },
};

export default userService;
