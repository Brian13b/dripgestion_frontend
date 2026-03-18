import api from './axios';

export const authService = {
  login: async (username, password, tenantId) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login/access-token', formData, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Tenant-ID': tenantId 
      }
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};