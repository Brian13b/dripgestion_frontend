import api from './axios';

export const authService = {
  login: async (username, password, tenantId) => {

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post('/auth/login/access-token', params, {
      headers: { 
        'X-Tenant-ID': tenantId, 
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getToken: () => localStorage.getItem('token'),

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};