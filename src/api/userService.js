import api from './axios';

export const userService = {
  getEquipo: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  crearUsuario: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  actualizarUsuario: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  eliminarUsuario: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  logoutAllDevices: async (userId) => {
    const response = await api.post(`/users/${userId}/logout-all`);
    return response.data;
  }
};